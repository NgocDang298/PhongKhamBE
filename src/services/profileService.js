const { User, Patient, Doctor, Staff, LabNurse, Appointment, Examination, MedicalProfile } = require('../models');

/**
 * Lấy thông tin profile của user hiện tại
 * @param {String} userId
 * @param {String} role
 * @returns {Object} - { ok, data }
 */
async function getMyProfile(userId, role) {
    const user = await User.findById(userId).select('-password -tokens').lean();

    if (!user) {
        return { ok: false, code: 404, message: 'Không tìm thấy user' };
    }

    let profile, stats;

    switch (role) {
        case 'patient':
            profile = await Patient.findOne({ userId }).lean();
            if (profile) {
                stats = {
                    totalAppointments: await Appointment.countDocuments({ patientId: profile._id }),
                    totalExaminations: await Examination.countDocuments({ patientId: profile._id })
                };
            }
            break;

        case 'doctor':
            profile = await Doctor.findOne({ userId }).lean();
            if (profile) {
                const examinations = await Examination.find({ doctorId: profile._id }).distinct('patientId');
                stats = {
                    totalExaminations: await Examination.countDocuments({ doctorId: profile._id }),
                    totalPatients: examinations.length
                };
            }
            break;

        case 'staff':
            profile = await Staff.findOne({ userId }).lean();
            break;

        case 'labNurse':
        case 'lab_nurse':
            profile = await LabNurse.findOne({ userId }).lean();
            break;

        case 'admin':
            // Admin không có profile riêng, chỉ có user info
            profile = { fullName: 'Administrator' };
            break;

        default:
            return { ok: false, code: 400, message: 'Role không hợp lệ' };
    }

    return {
        ok: true,
        data: {
            user,
            profile,
            stats: stats || {}
        }
    };
}

/**
 * Cập nhật profile của user hiện tại
 * @param {String} userId
 * @param {String} role
 * @param {Object} updates
 * @returns {Object} - { ok, data, message, code }
 */
async function updateMyProfile(userId, role, updates) {
    // Forbidden fields that cannot be updated
    const forbiddenFields = ['_id', 'userId', 'role', 'cccd', 'password', 'tokens'];

    for (const field of forbiddenFields) {
        if (updates[field] !== undefined) {
            return { ok: false, code: 400, message: `Không được phép cập nhật field: ${field}` };
        }
    }

    let profile;

    switch (role) {
        case 'patient':
            profile = await Patient.findOne({ userId });
            if (!profile) {
                return { ok: false, code: 404, message: 'Không tìm thấy profile bệnh nhân' };
            }

            // Allowed fields for patient
            const patientAllowedFields = ['fullName', 'phone', 'address', 'email', 'emergencyPhone'];
            for (const field of patientAllowedFields) {
                if (updates[field] !== undefined) {
                    profile[field] = updates[field];
                }
            }
            break;

        case 'doctor':
            profile = await Doctor.findOne({ userId });
            if (!profile) {
                return { ok: false, code: 404, message: 'Không tìm thấy profile bác sĩ' };
            }

            // Allowed fields for doctor
            const doctorAllowedFields = ['fullName', 'specialty', 'degree', 'workExperience'];
            for (const field of doctorAllowedFields) {
                if (updates[field] !== undefined) {
                    profile[field] = updates[field];
                }
            }
            break;

        case 'staff':
            profile = await Staff.findOne({ userId });
            if (!profile) {
                return { ok: false, code: 404, message: 'Không tìm thấy profile nhân viên' };
            }

            // Allowed fields for staff
            if (updates.fullName) profile.fullName = updates.fullName;
            break;

        case 'labNurse':
        case 'lab_nurse':
            profile = await LabNurse.findOne({ userId });
            if (!profile) {
                return { ok: false, code: 404, message: 'Không tìm thấy profile y tá' };
            }

            // Allowed fields for lab nurse
            if (updates.fullName) profile.fullName = updates.fullName;
            break;

        default:
            return { ok: false, code: 400, message: 'Role không hỗ trợ cập nhật profile' };
    }

    await profile.save();

    // Also update User model if email/phone is provided
    if (updates.email || updates.sdt) {
        const user = await User.findById(userId);
        if (updates.email) user.email = updates.email;
        if (updates.sdt) user.sdt = updates.sdt;
        await user.save();
    }

    return {
        ok: true,
        data: profile,
        message: 'Cập nhật profile thành công'
    };
}

/**
 * Lấy lịch sử khám bệnh của bệnh nhân
 * @param {String} patientId
 * @returns {Object} - { ok, data }
 */
async function getMedicalHistory(patientId) {
    const patient = await Patient.findById(patientId).lean();
    if (!patient) {
        return { ok: false, code: 404, message: 'Không tìm thấy bệnh nhân' };
    }

    // Get medical profile
    const medicalProfile = await MedicalProfile.findOne({ patientId }).lean();

    // Get examinations
    const examinations = await Examination.find({ patientId })
        .sort({ examDate: -1 })
        .populate('doctorId', 'fullName specialty')
        .populate('serviceId', 'name')
        .select('examDate diagnosis treatment doctorNote resultSummary')
        .lean();

    return {
        ok: true,
        data: {
            medicalProfile: medicalProfile || null,
            examinations,
            patientInfo: {
                fullName: patient.fullName,
                dateOfBirth: patient.dateOfBirth,
                gender: patient.gender
            }
        }
    };
}

/**
 * Lấy danh sách lịch hẹn của user
 * @param {String} userId
 * @param {String} role
 * @param {Object} filters - { status, limit, skip }
 * @returns {Object} - { ok, data }
 */
async function getMyAppointments(userId, role, filters = {}) {
    const { status, limit = 50, skip = 0 } = filters;

    let query = {};

    if (role === 'patient') {
        const patient = await Patient.findOne({ userId }).lean();
        if (!patient) {
            return { ok: false, code: 404, message: 'Không tìm thấy profile bệnh nhân' };
        }
        query.patientId = patient._id;
    } else if (role === 'doctor') {
        const doctor = await Doctor.findOne({ userId }).lean();
        if (!doctor) {
            return { ok: false, code: 404, message: 'Không tìm thấy profile bác sĩ' };
        }
        query.doctorId = doctor._id;
    } else {
        return { ok: false, code: 403, message: 'Chỉ patient và doctor mới có lịch hẹn' };
    }

    if (status) query.status = status;

    const appointments = await Appointment.find(query)
        .sort({ appointmentDate: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(skip))
        .populate('patientId', 'fullName phone')
        .populate('doctorId', 'fullName specialty')
        .lean();

    const total = await Appointment.countDocuments(query);

    return {
        ok: true,
        data: {
            appointments,
            total,
            limit: parseInt(limit),
            skip: parseInt(skip)
        }
    };
}

/**
 * Lấy danh sách ca khám của bác sĩ
 * @param {String} doctorId
 * @param {Object} filters - { status, fromDate, toDate, limit, skip }
 * @returns {Object} - { ok, data }
 */
async function getMyExaminations(doctorId, filters = {}) {
    const { status, fromDate, toDate, limit = 50, skip = 0 } = filters;

    const query = { doctorId };

    if (status) query.status = status;

    if (fromDate || toDate) {
        query.examDate = {};
        if (fromDate) query.examDate.$gte = new Date(fromDate);
        if (toDate) query.examDate.$lte = new Date(toDate);
    }

    const examinations = await Examination.find(query)
        .sort({ examDate: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(skip))
        .populate('patientId', 'fullName phone dateOfBirth')
        .populate('serviceId', 'name price')
        .lean();

    const total = await Examination.countDocuments(query);

    return {
        ok: true,
        data: {
            examinations,
            total,
            limit: parseInt(limit),
            skip: parseInt(skip)
        }
    };
}

module.exports = {
    getMyProfile,
    updateMyProfile,
    getMedicalHistory,
    getMyAppointments,
    getMyExaminations
};
