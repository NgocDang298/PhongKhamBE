const examinationService = require('../services/examinationService');

/**
 * Bắt đầu ca khám
 * POST /api/examinations/start
 * Body: { appointmentId, serviceId, staffId (optional - lấy từ appointment nếu không cung cấp) }
 */
async function startExam(req, res) {
    const { appointmentId, staffId, serviceId } = req.body;

    // Validate required fields (staffId is optional, will be taken from appointment if not provided)
    if (!appointmentId || !serviceId) {
        return res.status(400).json({
            status: false,
            message: 'appointmentId và serviceId là bắt buộc'
        });
    }

    const result = await examinationService.startExamination({
        appointmentId,
        staffId,
        serviceId
    });

    if (!result.ok) {
        return res.status(result.code || 400).json({
            status: false,
            message: result.message
        });
    }

    return res.status(result.code || 201).json({
        status: true,
        message: result.message,
        data: result.data
    });
}

/**
 * Lấy thông tin ca khám theo ID
 * GET /api/examinations/:id
 */
async function getExam(req, res) {
    const { id } = req.params;

    const result = await examinationService.getExaminationById(id);

    if (!result.ok) {
        return res.status(result.code || 404).json({
            status: false,
            message: result.message
        });
    }

    return res.json({
        status: true,
        data: result.data
    });
}

/**
 * Lấy ca khám theo appointmentId
 * GET /api/examinations/appointment/:appointmentId
 */
async function getExamByAppointment(req, res) {
    const { appointmentId } = req.params;

    const result = await examinationService.getExaminationByAppointment(appointmentId);

    if (!result.ok) {
        return res.status(result.code || 404).json({
            status: false,
            message: result.message
        });
    }

    return res.json({
        status: true,
        data: result.data
    });
}

/**
 * Danh sách ca khám
 * GET /api/examinations
 * Query params: status, doctorId, patientId, fromDate, toDate, limit, skip
 */
async function listExams(req, res) {
    const filters = {
        status: req.query.status,
        doctorId: req.query.doctorId,
        patientId: req.query.patientId,
        fromDate: req.query.fromDate,
        toDate: req.query.toDate,
        limit: req.query.limit,
        skip: req.query.skip
    };

    const result = await examinationService.listExaminations(filters);

    if (!result.ok) {
        return res.status(result.code || 400).json({
            status: false,
            message: result.message
        });
    }

    return res.json({
        status: true,
        data: result.data
    });
}

/**
 * Cập nhật thông tin ca khám
 * PUT /api/examinations/:id
 * Body: { diagnosis, treatment, doctorNote, resultSummary }
 */
async function updateExam(req, res) {
    const { id } = req.params;
    const updateData = {
        diagnosis: req.body.diagnosis,
        treatment: req.body.treatment,
        doctorNote: req.body.doctorNote,
        resultSummary: req.body.resultSummary
    };

    const result = await examinationService.updateExamination(id, updateData);

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
 * Hoàn thành ca khám
 * PUT /api/examinations/:id/complete
 * Body: { diagnosis, treatment, doctorNote, resultSummary }
 */
async function completeExam(req, res) {
    const { id } = req.params;
    const finalData = {
        diagnosis: req.body.diagnosis,
        treatment: req.body.treatment,
        doctorNote: req.body.doctorNote,
        resultSummary: req.body.resultSummary
    };

    const result = await examinationService.completeExamination(id, finalData);

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
 * Tạo lịch hẹn tái khám từ ca khám
 * POST /api/examinations/:id/follow-up
 * Body: { appointmentDate, note }
 */
async function createFollowUpAppointment(req, res) {
    const { id } = req.params;
    const { appointmentDate, note } = req.body;

    if (!appointmentDate) {
        return res.status(400).json({
            status: false,
            message: 'appointmentDate là bắt buộc'
        });
    }

    const result = await examinationService.createFollowUpAppointment(id, {
        appointmentDate,
        note
    });

    if (!result.ok) {
        return res.status(result.code || 400).json({
            status: false,
            message: result.message
        });
    }

    return res.status(201).json({
        status: true,
        message: result.message,
        data: result.data
    });
}

/**
 * DELETE /api/examinations/:id - Xóa ca khám
 */
async function deleteExam(req, res) {
    const { id } = req.params;
    const result = await examinationService.deleteExamination(id);

    if (!result.ok) {
        return res.status(result.code || 400).json({
            status: false,
            message: result.message
        });
    }

    return res.json({
        status: true,
        message: result.message
    });
}

module.exports = {
    startExam,
    getExam,
    getExamByAppointment,
    listExams,
    updateExam,
    completeExam,
    createFollowUpAppointment,
    deleteExam
};
