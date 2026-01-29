const { Staff, User } = require('../models');

/**
 * Staff Service - Xử lý logic liên quan đến nhân viên
 */
const staffService = {
    /**
     * Cập nhật thông tin nhân viên
     * @param {String} staffId - ID nhân viên (profile ID)
     * @param {Object} updates - { fullName, email, phone, gender, dateOfBirth, address, cccd, dob }
     * @returns {Object} - { ok, code, message, data }
     */
    async updateStaff(staffId, updates) {
        const staff = await Staff.findById(staffId);
        if (!staff) {
            return { ok: false, code: 404, message: 'Không tìm thấy nhân viên' };
        }

        const user = await User.findById(staff.userId);
        if (!user) {
            return { ok: false, code: 404, message: 'Không tìm thấy tài khoản người dùng của nhân viên' };
        }

        // 1. Cập nhật các trường trong model Staff
        // Lưu ý: Staff model hiện tại có trường dob. Chúng ta sẽ đồng bộ dateOfBirth và dob.
        const staffFields = ['fullName', 'gender', 'dateOfBirth', 'address', 'dob'];

        for (const field of staffFields) {
            if (updates[field] !== undefined) {
                // Xử lý đặc biệt cho dateOfBirth/dob nếu là chuỗi rỗng
                if ((field === 'dateOfBirth' || field === 'dob') && updates[field] === '') {
                    staff.dateOfBirth = null;
                    staff.dob = null;
                } else {
                    staff[field] = updates[field];
                    // Đồng bộ
                    if (field === 'dateOfBirth') staff.dob = updates[field];
                    if (field === 'dob') staff.dateOfBirth = updates[field];
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
        await staff.save();
        if (userUpdated) {
            await user.save();
        }

        // Lấy lại dữ liệu đầy đủ sau khi update
        const updatedStaff = await Staff.findById(staffId).populate('userId', '-password -tokens').lean();

        return {
            ok: true,
            data: updatedStaff,
            message: 'Cập nhật thông tin nhân viên thành công'
        };
    }
};

module.exports = staffService;
