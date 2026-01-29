const { Examination, Appointment, Service, Patient, Doctor, Staff } = require('../models');
const mongoose = require('mongoose');

/**
 * Bắt đầu ca khám từ lịch hẹn đã confirmed
 * @param {Object} params - { appointmentId, staffId, serviceId }
 * @returns {Object} - { ok, data, message, code }
 */
async function startExamination({ appointmentId, staffId, serviceId }) {
    // Validate input parameters
    if (!appointmentId || !mongoose.Types.ObjectId.isValid(appointmentId)) {
        return { ok: false, code: 400, message: 'appointmentId không hợp lệ' };
    }

    if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
        return { ok: false, code: 400, message: 'serviceId không hợp lệ' };
    }

    // Start a session for transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Kiểm tra appointment tồn tại và đã confirmed
        const appointment = await Appointment.findById(appointmentId)
            .populate('patientId', 'fullName phone email gender dateOfBirth address')
            .populate('doctorId', 'fullName specialty')
            .populate('staffId', '_id') // Populate staffId to check if it exists on appointment
            .session(session);

        if (!appointment) {
            await session.abortTransaction();
            return { ok: false, code: 404, message: 'Không tìm thấy lịch hẹn' };
        }

        if (appointment.status !== 'confirmed') {
            await session.abortTransaction();
            return {
                ok: false,
                code: 400,
                message: `Lịch hẹn chưa được xác nhận. Trạng thái hiện tại: ${appointment.status}`
            };
        }

        // Kiểm tra xem đã có ca khám cho appointment này chưa
        const existingExam = await Examination.findOne({ appointmentId }).session(session);
        if (existingExam) {
            await session.abortTransaction();
            return {
                ok: false,
                code: 400,
                message: 'Ca khám đã được tạo cho lịch hẹn này. Vui lòng kiểm tra lại.'
            };
        }

        // Kiểm tra service tồn tại và đang hoạt động
        const service = await Service.findById(serviceId).session(session);
        if (!service) {
            await session.abortTransaction();
            return { ok: false, code: 404, message: 'Không tìm thấy dịch vụ' };
        }

        if (!service.isActive) {
            await session.abortTransaction();
            return {
                ok: false,
                code: 400,
                message: `Dịch vụ "${service.name}" hiện không hoạt động`
            };
        }

        // Xác định staffId: ưu tiên từ parameter, nếu không có thì lấy từ appointment
        let finalStaffId = staffId;

        // Nếu không có staffId từ parameter, thử lấy từ appointment
        if (!finalStaffId && appointment.staffId) {
            finalStaffId = appointment.staffId;
        }

        // Validate finalStaffId nếu có
        if (finalStaffId) {
            if (!mongoose.Types.ObjectId.isValid(finalStaffId)) {
                await session.abortTransaction();
                return {
                    ok: false,
                    code: 400,
                    message: 'staffId không hợp lệ'
                };
            }

            // Kiểm tra staff tồn tại
            const staff = await Staff.findById(finalStaffId).session(session);
            if (!staff) {
                await session.abortTransaction();
                return { ok: false, code: 404, message: 'Không tìm thấy nhân viên' };
            }
        }

        // Kiểm tra doctor có tồn tại không
        const doctor = await Doctor.findById(appointment.doctorId._id).session(session);
        if (!doctor) {
            await session.abortTransaction();
            return { ok: false, code: 404, message: 'Không tìm thấy bác sĩ' };
        }

        // Kiểm tra patient có tồn tại không
        const patient = await Patient.findById(appointment.patientId._id).session(session);
        if (!patient) {
            await session.abortTransaction();
            return { ok: false, code: 404, message: 'Không tìm thấy bệnh nhân' };
        }

        // Tạo ca khám mới
        const examination = await Examination.create([{
            appointmentId,
            doctorId: appointment.doctorId._id,
            staffId: finalStaffId,
            serviceId,
            patientId: appointment.patientId._id,
            examDate: new Date(),
            status: 'processing'
        }], { session });

        // Cập nhật trạng thái appointment sang 'in-progress'
        await Appointment.findByIdAndUpdate(
            appointmentId,
            {
                status: 'in-progress',
                updatedAt: new Date()
            },
            { session }
        );

        // Commit transaction
        await session.commitTransaction();

        // Populate để trả về đầy đủ thông tin (sau khi commit)
        const populatedExam = await Examination.findById(examination[0]._id)
            .populate('patientId', 'fullName phone email gender dateOfBirth address cccd')
            .populate('doctorId', 'fullName specialty')
            .populate('staffId', 'fullName')
            .populate('serviceId', 'name price description')
            .populate('appointmentId', 'appointmentDate note status')
            .lean();

        return {
            ok: true,
            data: populatedExam,
            message: 'Bắt đầu ca khám thành công',
            code: 201
        };

    } catch (error) {
        // Rollback transaction on error
        await session.abortTransaction();
        console.error('Error in startExamination:', error);

        return {
            ok: false,
            code: 500,
            message: 'Lỗi khi bắt đầu ca khám: ' + error.message
        };
    } finally {
        // End session
        session.endSession();
    }
}

/**
 * Lấy thông tin ca khám theo ID
 * @param {String} examinationId
 * @returns {Object} - { ok, data, message, code }
 */
async function getExaminationById(examinationId) {
    const examination = await Examination.findById(examinationId)
        .populate('patientId', 'fullName phone gender dateOfBirth address cccd')
        .populate('doctorId', 'fullName specialty')
        .populate('staffId', 'fullName')
        .populate('serviceId', 'name price description')
        .populate('appointmentId', 'appointmentDate note')
        .populate('previousExamId')
        .lean();

    if (!examination) {
        return { ok: false, code: 404, message: 'Không tìm thấy ca khám' };
    }

    return { ok: true, data: examination };
}

/**
 * Lấy ca khám theo appointmentId
 * @param {String} appointmentId
 * @returns {Object} - { ok, data, message, code }
 */
async function getExaminationByAppointment(appointmentId) {
    const examination = await Examination.findOne({ appointmentId })
        .populate('patientId', 'fullName phone gender dateOfBirth address cccd')
        .populate('doctorId', 'fullName specialty')
        .populate('staffId', 'fullName')
        .populate('serviceId', 'name price description')
        .populate('appointmentId', 'appointmentDate note')
        .lean();

    if (!examination) {
        return { ok: false, code: 404, message: 'Không tìm thấy ca khám cho lịch hẹn này' };
    }

    return { ok: true, data: examination };
}

/**
 * Danh sách ca khám với filter
 * @param {Object} filters - { status, doctorId, patientId, fromDate, toDate, limit, skip }
 * @returns {Object} - { ok, data }
 */
async function listExaminations(filters = {}) {
    const { status, doctorId, patientId, fromDate, toDate, limit = 50, skip = 0 } = filters;

    const query = {};

    if (status) query.status = status;
    if (doctorId) query.doctorId = doctorId;
    if (patientId) query.patientId = patientId;

    if (fromDate || toDate) {
        query.examDate = {};
        if (fromDate) query.examDate.$gte = new Date(fromDate);
        if (toDate) query.examDate.$lte = new Date(toDate);
    }

    const examinations = await Examination.find(query)
        .sort({ examDate: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(skip))
        .populate('patientId', 'fullName phone')
        .populate('doctorId', 'fullName specialty')
        .populate('staffId', 'fullName')
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

/**
 * Cập nhật thông tin ca khám (chẩn đoán, điều trị, ghi chú)
 * @param {String} examinationId
 * @param {Object} updateData - { diagnosis, treatment, doctorNote, resultSummary }
 * @returns {Object} - { ok, data, message, code }
 */
async function updateExamination(examinationId, updateData) {
    const examination = await Examination.findById(examinationId);

    if (!examination) {
        return { ok: false, code: 404, message: 'Không tìm thấy ca khám' };
    }

    if (examination.status === 'done') {
        return { ok: false, code: 400, message: 'Không thể cập nhật ca khám đã hoàn thành' };
    }

    // Chỉ cập nhật các trường được phép
    const allowedFields = ['diagnosis', 'treatment', 'doctorNote', 'resultSummary'];
    allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
            examination[field] = updateData[field];
        }
    });

    await examination.save();

    const updatedExam = await Examination.findById(examinationId)
        .populate('patientId', 'fullName phone')
        .populate('doctorId', 'fullName specialty')
        .populate('staffId', 'fullName')
        .populate('serviceId', 'name price')
        .lean();

    return {
        ok: true,
        data: updatedExam,
        message: 'Cập nhật ca khám thành công'
    };
}

/**
 * Hoàn thành ca khám
 * @param {String} examinationId
 * @param {Object} finalData - { diagnosis, treatment, doctorNote, resultSummary }
 * @returns {Object} - { ok, data, message, code }
 */
async function completeExamination(examinationId, finalData = {}) {
    const examination = await Examination.findById(examinationId);

    if (!examination) {
        return { ok: false, code: 404, message: 'Không tìm thấy ca khám' };
    }

    if (examination.status === 'done') {
        return { ok: false, code: 400, message: 'Ca khám đã được hoàn thành trước đó' };
    }

    // Cập nhật thông tin cuối cùng
    const allowedFields = ['diagnosis', 'treatment', 'doctorNote', 'resultSummary'];
    allowedFields.forEach(field => {
        if (finalData[field] !== undefined) {
            examination[field] = finalData[field];
        }
    });

    // Đánh dấu hoàn thành
    examination.status = 'done';
    await examination.save();

    const completedExam = await Examination.findById(examinationId)
        .populate('patientId', 'fullName phone')
        .populate('doctorId', 'fullName specialty')
        .populate('staffId', 'fullName')
        .populate('serviceId', 'name price')
        .lean();

    return {
        ok: true,
        data: completedExam,
        message: 'Hoàn thành ca khám thành công'
    };
}

/**
 * Tạo lịch hẹn tái khám từ ca khám hiện tại
 * @param {String} examinationId - ID ca khám hiện tại
 * @param {Object} appointmentData - { appointmentDate, note }
 * @returns {Object} - { ok, data, message, code }
 */
async function createFollowUpAppointment(examinationId, appointmentData) {
    const { appointmentDate, note } = appointmentData;

    if (!appointmentDate) {
        return { ok: false, code: 400, message: 'appointmentDate là bắt buộc' };
    }

    // Lấy thông tin ca khám hiện tại
    const examination = await Examination.findById(examinationId)
        .populate('patientId')
        .populate('doctorId')
        .lean();

    if (!examination) {
        return { ok: false, code: 404, message: 'Không tìm thấy ca khám' };
    }

    // Tạo appointment mới cho tái khám
    const { Appointment } = require('../models');
    const appointmentService = require('./appointmentService');

    const result = await appointmentService.createAppointmentCore({
        patientId: examination.patientId._id,
        doctorId: examination.doctorId._id,
        appointmentDate: new Date(appointmentDate),
        note: note || `Tái khám từ ca khám ngày ${new Date(examination.examDate).toLocaleDateString('vi-VN')}`,
        staffId: examination.staffId // Giữ nguyên staff đã tạo ca khám trước
    });

    if (!result.ok) {
        return result;
    }

    // Cập nhật ghi chú bác sĩ trong ca khám hiện tại
    await Examination.findByIdAndUpdate(examinationId, {
        doctorNote: `${examination.doctorNote || ''}\n[Đã tạo lịch tái khám: ${new Date(appointmentDate).toLocaleString('vi-VN')}]`.trim()
    });

    return {
        ok: true,
        data: {
            appointment: result.data,
            currentExamination: examination
        },
        message: 'Tạo lịch hẹn tái khám thành công'
    };
}

module.exports = {
    startExamination,
    getExaminationById,
    getExaminationByAppointment,
    listExaminations,
    updateExamination,
    completeExamination,
    createFollowUpAppointment
};
