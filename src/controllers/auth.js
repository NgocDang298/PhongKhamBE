const authService = require('../services/authService');

module.exports = {
    /**
     * POST /auth/register - Đăng ký tài khoản cho doctor, staff, labNurse (Admin only)
     * body: {
     *   password, fullName, email, phone, role,
     *   // Doctor: specialty (required), degree, birthYear, workExperience, cccd
     *   // Staff: cccd
     *   // LabNurse: cccd
     * }
     */
    async register(req, res) {
        const { role } = req.body;

        // Chỉ cho phép đăng ký doctor, staff, labNurse qua route này
        if (role === 'patient') {
            return res.status(403).json({
                status: false,
                message: 'Vui lòng sử dụng /auth/register/patient để đăng ký bệnh nhân'
            });
        }

        if (!['doctor', 'staff', 'lab_nurse'].includes(role)) {
            return res.status(400).json({
                status: false,
                message: 'Role phải là doctor, staff hoặc lab_nurse'
            });
        }

        const result = await authService.register(req.body || {});
        if (!result.ok) return res.status(result.code).json({ status: false, message: result.message });
        return res.json({ status: true, data: result.data });
    },

    /**
     * POST /auth/register/patient - Đăng ký tài khoản bệnh nhân (Public)
     * body: {
     *   password, fullName, email, phone, gender, dateOfBirth, address, cccd
     * }
     */
    async registerPatient(req, res) {
        const result = await authService.registerPatient(req.body || {});
        if (!result.ok) return res.status(result.code).json({ status: false, message: result.message });
        return res.json({ status: true, data: result.data });
    },

    /**
     * POST /auth/register/admin - Đăng ký tài khoản admin (Public - for initial setup)
     * body: {
     *   password, email, sdt (or phone), cccd
     * }
     * WARNING: This is a public endpoint. Consider disabling after creating first admin.
     */
    async registerAdmin(req, res) {
        const result = await authService.registerAdmin(req.body || {});
        if (!result.ok) return res.status(result.code).json({ status: false, message: result.message });
        return res.json({ status: true, data: result.data });
    },


    /**
     * POST /auth/login - Đăng nhập
     * body: { cccd, password }
     */
    async login(req, res) {
        const result = await authService.login(req.body || {});
        if (!result.ok) return res.status(result.code).json({ status: false, message: result.message });
        return res.json({ status: true, ...result.data });
    },

    /**
     * PUT /auth/change-password - Đổi mật khẩu
     * body: { currentPassword, newPassword }
     * headers: { Authorization: Bearer <token> }
     */
    async changePassword(req, res) {
        const result = await authService.changePassword(req.user._id, req.body || {});
        if (!result.ok) return res.status(result.code).json({ status: false, message: result.message });
        return res.json({ status: true, message: result.message });
    },

    /**
     * POST /auth/logout - Đăng xuất
     * headers: { Authorization: Bearer <token> }
     */
    async logout(req, res) {
        const result = await authService.logout(req.user._id, req.token);
        if (!result.ok) return res.status(result.code).json({ status: false, message: result.message });
        return res.json({ status: true, message: result.message });
    }
};


