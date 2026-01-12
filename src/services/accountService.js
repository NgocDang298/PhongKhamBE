const { User, Patient, Doctor, Staff, LabNurse } = require('../models');

/**
 * Lấy danh sách tất cả tài khoản
 * @param {Object} filters - { role, search }
 * @returns {Object} { ok, data, message }
 */
async function getAllAccounts(filters = {}) {
    try {
        const { role, search } = filters;

        // Build query
        const query = {};

        // Filter by role if provided
        if (role && ['patient', 'doctor', 'staff', 'lab_nurse', 'admin'].includes(role)) {
            query.role = role;
        }

        // Search by cccd, email, or sdt
        if (search) {
            query.$or = [
                { cccd: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { sdt: { $regex: search, $options: 'i' } }
            ];
        }

        // Get users
        const users = await User.find(query)
            .select('-password -tokens')
            .sort({ createdAt: -1 })
            .lean();

        // Populate profile data for each user
        const accountsWithProfiles = await Promise.all(users.map(async (user) => {
            let profile = null;

            switch (user.role) {
                case 'patient':
                    profile = await Patient.findOne({ userId: user._id }).lean();
                    break;
                case 'doctor':
                    profile = await Doctor.findOne({ userId: user._id }).lean();
                    break;
                case 'staff':
                    profile = await Staff.findOne({ userId: user._id }).lean();
                    break;
                case 'lab_nurse':
                    profile = await LabNurse.findOne({ userId: user._id }).lean();
                    break;
                case 'admin':
                    // Admin không có profile riêng
                    profile = {
                        fullName: 'Administrator',
                        role: 'admin'
                    };
                    break;
            }

            return {
                ...user,
                profile
            };
        }));

        return {
            ok: true,
            data: accountsWithProfiles
        };
    } catch (error) {
        console.error('Error in getAllAccounts:', error);
        return {
            ok: false,
            message: 'Lỗi khi lấy danh sách tài khoản',
            code: 500
        };
    }
}

/**
 * Lấy thông tin chi tiết một tài khoản
 * @param {String} userId - ID của user
 * @returns {Object} { ok, data, message }
 */
async function getAccountById(userId) {
    try {
        const user = await User.findById(userId)
            .select('-password -tokens')
            .lean();

        if (!user) {
            return {
                ok: false,
                message: 'Không tìm thấy tài khoản',
                code: 404
            };
        }

        let profile = null;

        switch (user.role) {
            case 'patient':
                profile = await Patient.findOne({ userId: user._id }).lean();
                break;
            case 'doctor':
                profile = await Doctor.findOne({ userId: user._id }).lean();
                break;
            case 'staff':
                profile = await Staff.findOne({ userId: user._id }).lean();
                break;
            case 'lab_nurse':
                profile = await LabNurse.findOne({ userId: user._id }).lean();
                break;
            case 'admin':
                profile = {
                    fullName: 'Administrator',
                    role: 'admin'
                };
                break;
        }

        return {
            ok: true,
            data: {
                ...user,
                profile
            }
        };
    } catch (error) {
        console.error('Error in getAccountById:', error);
        return {
            ok: false,
            message: 'Lỗi khi lấy thông tin tài khoản',
            code: 500
        };
    }
}

module.exports = {
    getAllAccounts,
    getAccountById
};
