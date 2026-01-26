const profileService = require('../services/profileService');
const { Doctor } = require('../models');

/**
 * Lấy thông tin profile của mình
 * GET /profile/me
 */
async function getMyProfile(req, res) {
    const userId = req.user._id;
    const role = req.user.role;

    const result = await profileService.getMyProfile(userId, role);

    if (!result.ok) {
        return res.status(result.code || 404).json({
            status: false,
            message: result.message
        });
    }

    return res.json({
        status: true,
        message: result.message || 'Lấy thông tin cá nhân thành công',
        data: result.data
    });
}

/**
 * Cập nhật profile của mình
 * PUT /profile/me
 * Body: { fullName?, phone?, address?, email?, ... }
 */
async function updateMyProfile(req, res) {
    const userId = req.user._id;
    const role = req.user.role;
    const updates = req.body;

    const result = await profileService.updateMyProfile(userId, role, updates);

    if (!result.ok) {
        return res.status(result.code || 400).json({
            status: false,
            message: result.message
        });
    }

    return res.json({
        status: true,
        message: result.message,
        data: result.data
    });
}

/**
 * Upload avatar (Placeholder)
 * PUT /profile/avatar
 */
async function uploadAvatar(req, res) {
    // TODO: Implement file upload with multer
    return res.status(501).json({
        status: false,
        message: 'Tính năng upload avatar chưa được triển khai. Cần cài đặt multer middleware.'
    });
}

/**
 * Lấy lịch sử khám bệnh (Patient only)
 * GET /profile/medical-history
 */
async function getMedicalHistory(req, res) {
    const userId = req.user._id;
    const role = req.user.role;

    if (role !== 'patient') {
        return res.status(403).json({
            status: false,
            message: 'Chỉ bệnh nhân mới có lịch sử khám bệnh'
        });
    }

    // Get patient profile to get patientId
    const { Patient } = require('../models');
    const patient = await Patient.findOne({ userId }).lean();

    if (!patient) {
        return res.status(404).json({
            status: false,
            message: 'Không tìm thấy thông tin bệnh nhân'
        });
    }

    const result = await profileService.getMedicalHistory(patient._id);

    if (!result.ok) {
        return res.status(result.code || 404).json({
            status: false,
            message: result.message
        });
    }

    return res.json({
        status: true,
        message: result.message || 'Lấy lịch sử khám bệnh thành công',
        data: result.data
    });
}

/**
 * Lấy danh sách lịch hẹn của mình
 * GET /profile/appointments?status=confirmed&limit=20
 */
async function getMyAppointments(req, res) {
    const userId = req.user._id;
    const role = req.user.role;
    const filters = {
        status: req.query.status,
        limit: req.query.limit,
        skip: req.query.skip
    };

    const result = await profileService.getMyAppointments(userId, role, filters);

    if (!result.ok) {
        return res.status(result.code || 400).json({
            status: false,
            message: result.message
        });
    }

    return res.json({
        status: true,
        message: result.message || 'Lấy danh sách lịch hẹn thành công',
        data: result.data
    });
}

/**
 * Lấy danh sách ca khám của mình (Doctor only)
 * GET /profile/examinations?status=done&fromDate=2024-01-01&limit=20
 */
async function getMyExaminations(req, res) {
    const userId = req.user._id;
    const role = req.user.role;

    if (role !== 'doctor') {
        return res.status(403).json({
            status: false,
            message: 'Chỉ bác sĩ mới có danh sách ca khám'
        });
    }

    // Get doctor profile to get doctorId
    const doctor = await Doctor.findOne({ userId }).lean();

    if (!doctor) {
        return res.status(404).json({
            status: false,
            message: 'Không tìm thấy thông tin bác sĩ'
        });
    }

    const filters = {
        status: req.query.status,
        fromDate: req.query.fromDate,
        toDate: req.query.toDate,
        limit: req.query.limit,
        skip: req.query.skip
    };

    const result = await profileService.getMyExaminations(doctor._id, filters);

    if (!result.ok) {
        return res.status(result.code || 400).json({
            status: false,
            message: result.message
        });
    }

    return res.json({
        status: true,
        message: result.message || 'Lấy danh sách ca khám thành công',
        data: result.data
    });
}

module.exports = {
    getMyProfile,
    updateMyProfile,
    uploadAvatar,
    getMedicalHistory,
    getMyAppointments,
    getMyExaminations
};
