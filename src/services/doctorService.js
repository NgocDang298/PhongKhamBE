const { Doctor, User } = require('../models');

/**
 * Doctor Service - Xử lý logic liên quan đến bác sĩ
 */
const doctorService = {
    /**
     * Cập nhật thông tin bác sĩ
     * @param {String} doctorId - ID bác sĩ (profile ID)
     * @param {Object} updates - { fullName, email, phone, gender, dateOfBirth, address, cccd, specialty, degree, birthYear, workExperience }
     * @returns {Object} - { ok, code, message, data }
     */
    async updateDoctor(doctorId, updates) {
        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return { ok: false, code: 404, message: 'Không tìm thấy bác sĩ' };
        }

        const user = await User.findById(doctor.userId);
        if (!user) {
            return { ok: false, code: 404, message: 'Không tìm thấy tài khoản người dùng của bác sĩ' };
        }

        // 1. Cập nhật các trường trong model Doctor
        const doctorFields = [
            'fullName', 'specialty', 'degree', 'birthYear',
            'workExperience', 'gender', 'dateOfBirth', 'address', 'status'
        ];

        for (const field of doctorFields) {
            if (updates[field] !== undefined) {
                // Xử lý đặc biệt cho dateOfBirth nếu là chuỗi rỗng
                if (field === 'dateOfBirth' && updates[field] === '') {
                    doctor[field] = null;
                } else {
                    doctor[field] = updates[field];
                }
            }
        }

        // 2. Cập nhật các trường trong model User
        let userUpdated = false;

        // Email
        if (updates.email !== undefined) {
            // Kiểm tra email trùng (nếu thay đổi)
            if (updates.email && updates.email !== user.email) {
                const existingEmail = await User.findOne({ email: updates.email.toLowerCase(), _id: { $ne: user._id } });
                if (existingEmail) {
                    return { ok: false, code: 409, message: 'Email đã được sử dụng bởi người dùng khác' };
                }
            }
            user.email = updates.email ? updates.email.toLowerCase() : undefined;
            userUpdated = true;
        }

        // Phone (sdt)
        const phoneNumber = updates.phone || updates.sdt;
        if (phoneNumber !== undefined) {
            if (phoneNumber && phoneNumber !== user.sdt) {
                const existingPhone = await User.findOne({ sdt: phoneNumber, _id: { $ne: user._id } });
                if (existingPhone) {
                    return { ok: false, code: 409, message: 'Số điện thoại đã được sử dụng bởi người dùng khác' };
                }
            }
            user.sdt = phoneNumber || undefined;
            userUpdated = true;
        }

        // CCCD
        if (updates.cccd !== undefined) {
            if (updates.cccd && updates.cccd !== user.cccd) {
                const existingCccd = await User.findOne({ cccd: updates.cccd, _id: { $ne: user._id } });
                if (existingCccd) {
                    return { ok: false, code: 409, message: 'CCCD đã được sử dụng bởi người dùng khác' };
                }
            }
            user.cccd = updates.cccd;
            userUpdated = true;
        }

        // Save both
        await doctor.save();
        if (userUpdated) {
            await user.save();
        }

        // Lấy lại dữ liệu đầy đủ sau khi update
        const updatedDoctor = await Doctor.findById(doctorId).populate('userId', '-password -tokens').lean();

        return {
            ok: true,
            data: updatedDoctor,
            message: 'Cập nhật thông tin bác sĩ thành công'
        };
    }
};

module.exports = doctorService;
