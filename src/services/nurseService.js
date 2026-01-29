const { LabNurse, User } = require('../models');

/**
 * Nurse Service - Xử lý logic liên quan đến y tá
 */
const nurseService = {
    /**
     * Cập nhật thông tin y tá
     * @param {String} nurseId - ID y tá (profile ID)
     * @param {Object} updates - { fullName, email, phone, gender, dateOfBirth, address, cccd }
     * @returns {Object} - { ok, code, message, data }
     */
    async updateNurse(nurseId, updates) {
        const nurse = await LabNurse.findById(nurseId);
        if (!nurse) {
            return { ok: false, code: 404, message: 'Không tìm thấy y tá' };
        }

        const user = await User.findById(nurse.userId);
        if (!user) {
            return { ok: false, code: 404, message: 'Không tìm thấy tài khoản người dùng của y tá' };
        }

        // 1. Cập nhật các trường trong model LabNurse
        const nurseFields = ['fullName', 'gender', 'dateOfBirth', 'address'];

        for (const field of nurseFields) {
            if (updates[field] !== undefined) {
                // Xử lý đặc biệt cho dateOfBirth nếu là chuỗi rỗng
                if (field === 'dateOfBirth' && updates[field] === '') {
                    nurse[field] = null;
                    nurse.dob = null; // Cập nhật cả dob cũ nếu có
                } else {
                    nurse[field] = updates[field];
                    if (field === 'dateOfBirth') nurse.dob = updates[field];
                }
            }
        }

        // 2. Cập nhật các trường trong model User
        let userUpdated = false;

        // Email
        if (updates.email !== undefined) {
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
        await nurse.save();
        if (userUpdated) {
            await user.save();
        }

        // Lấy lại dữ liệu đầy đủ sau khi update
        const updatedNurse = await LabNurse.findById(nurseId).populate('userId', '-password -tokens').lean();

        return {
            ok: true,
            data: updatedNurse,
            message: 'Cập nhật thông tin y tá thành công'
        };
    }
};

module.exports = nurseService;
