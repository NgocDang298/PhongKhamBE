const { Patient, Doctor, Staff, LabNurse } = require('../models');
const staffService = require('../services/staffService');

module.exports = {
    /**
     * POST /patients - Tạo hồ sơ bệnh nhân walk-in (tự động tạo tài khoản User)
     * Chỉ staff/admin mới được tạo
     * body: { fullName, gender, dateOfBirth, address, phone, cccd, email (optional), password (optional) }
     */
    async createPatient(req, res) {
        const result = await staffService.createPatientProfile(req.user, req.body || {});
        if (!result.ok) return res.status(result.code || 400).json({ status: false, message: result.message });
        return res.status(result.code || 201).json({ status: true, message: result.message, data: result.data });
    },

    /**
     * GET /patients - Danh sách bệnh nhân (tất cả đều có tài khoản User)
     * Query: search (optional) - Tìm kiếm theo tên, CCCD, hoặc số điện thoại
     */
    async listPatients(req, res) {
        const result = await staffService.listAllPatients(req.user, req.query || {});
        if (!result.ok) return res.status(result.code || 400).json({ status: false, message: result.message });
        return res.json({ status: true, message: result.message || 'Lấy danh sách bệnh nhân thành công', data: result.data });
    },

    /**
     * GET /doctors - Danh sách bác sĩ
     */
    async listDoctors(req, res) {
        const doctors = await Doctor.find({})
            .populate('userId', '-password -tokens')
            .lean();
        return res.json({ status: true, message: 'Lấy danh sách bác sĩ thành công', data: doctors });
    },

    /**
     * GET /staffs - Danh sách nhân viên
     */
    async listStaffs(req, res) {
        const staffs = await Staff.find({})
            .populate('userId', '-password -tokens')
            .lean();
        return res.json({ status: true, message: 'Lấy danh sách nhân viên thành công', data: staffs });
    },

    /**
     * GET /nurses - Danh sách y tá (LabNurse)
     */
    async listNurses(req, res) {
        const nurses = await LabNurse.find({})
            .populate('userId', '-password -tokens')
            .lean();
        return res.json({ status: true, message: 'Lấy danh sách y tá thành công', data: nurses });
    },

    /**
     * PUT /patients/:id - Cập nhật thông tin bệnh nhân
     */
    async updatePatient(req, res) {
        const patientService = require('../services/patientService');
        const result = await patientService.updatePatient(req.params.id, req.body || {});
        if (!result.ok) return res.status(result.code || 400).json({ status: false, message: result.message });
        return res.json({ status: true, message: result.message, data: result.data });
    },

    /**
     * DELETE /patients/:id - Xóa bệnh nhân (soft delete)
     */
    async deletePatient(req, res) {
        const patientService = require('../services/patientService');
        const result = await patientService.deletePatient(req.params.id);
        if (!result.ok) return res.status(result.code || 400).json({ status: false, message: result.message });
        return res.json({ status: true, message: result.message });
    }
};






