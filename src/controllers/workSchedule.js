const workScheduleService = require('../services/workScheduleService');

/**
 * Tạo lịch làm việc
 * POST /work-schedules
 * Body: { doctorId?, labNurseId?, dayOfWeek, shiftStart, shiftEnd, note? }
 */
async function createWorkSchedule(req, res) {
    const { doctorId, labNurseId, dayOfWeek, shiftStart, shiftEnd, note } = req.body;

    // Validate required fields
    if (dayOfWeek === undefined || !shiftStart || !shiftEnd) {
        return res.status(400).json({
            status: false,
            message: 'dayOfWeek, shiftStart và shiftEnd là bắt buộc'
        });
    }

    const result = await workScheduleService.createWorkSchedule({
        doctorId,
        labNurseId,
        dayOfWeek,
        shiftStart,
        shiftEnd,
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
 * Lấy lịch làm việc của bác sĩ
 * GET /work-schedules/doctor/:doctorId
 */
async function getDoctorSchedule(req, res) {
    const { doctorId } = req.params;

    const result = await workScheduleService.getDoctorSchedule(doctorId);

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
 * Lấy lịch làm việc của y tá
 * GET /work-schedules/nurse/:nurseId
 */
async function getNurseSchedule(req, res) {
    const { nurseId } = req.params;

    const result = await workScheduleService.getNurseSchedule(nurseId);

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
 * Cập nhật lịch làm việc
 * PUT /work-schedules/:id
 * Body: { dayOfWeek?, shiftStart?, shiftEnd?, note? }
 */
async function updateWorkSchedule(req, res) {
    const { id } = req.params;
    const updates = req.body;

    const result = await workScheduleService.updateWorkSchedule(id, updates);

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
 * Xóa lịch làm việc
 * DELETE /work-schedules/:id
 */
async function deleteWorkSchedule(req, res) {
    const { id } = req.params;

    const result = await workScheduleService.deleteWorkSchedule(id);

    if (!result.ok) {
        return res.status(result.code || 404).json({
            status: false,
            message: result.message
        });
    }

    return res.json({
        status: true,
        message: result.message
    });
}

/**
 * Tìm bác sĩ/y tá có lịch làm việc
 * GET /work-schedules/available?dayOfWeek=1&time=09:00&role=doctor
 */
async function findAvailableStaff(req, res) {
    const { dayOfWeek, time, role } = req.query;

    // Validate required params
    if (dayOfWeek === undefined || !time || !role) {
        return res.status(400).json({
            status: false,
            message: 'dayOfWeek, time và role là bắt buộc'
        });
    }

    const result = await workScheduleService.findAvailableStaff({
        dayOfWeek: parseInt(dayOfWeek),
        time,
        role
    });

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

module.exports = {
    createWorkSchedule,
    getDoctorSchedule,
    getNurseSchedule,
    updateWorkSchedule,
    deleteWorkSchedule,
    findAvailableStaff
};
