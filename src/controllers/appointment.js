const appointmentService = require('../services/appointmentService');
const { Doctor, Appointment, Patient } = require('../models');

// --- CREATE LỊCH HẸN CHUNG ---
async function create(req, res) {
    let result;
    if (req.user.role === 'patient') {
        result = await require('../services/patientService').createAppointment(req.user, req.body || {});
    } else if (req.user.role === 'staff' || req.user.role === 'admin') {
        result = await require('../services/staffService').createAppointmentForPatient(req.user, req.body || {});
    } else if (req.user.role === 'doctor') {
        result = await require('../services/staffService').createAppointmentForPatient(req.user, req.body || {});
    } else {
        return res.status(403).json({ status: false, message: 'Không có quyền tạo lịch hẹn' });
    }
    if (!result.ok) return res.status(result.code || 400).json({ status: false, message: result.message });
    return res.json({ status: true, data: result.data });
}

// --- LIST ---
async function list(req, res) {
    let result;
    if (req.user.role === 'patient') {
        result = await require('../services/patientService').listMyAppointments(req.user, req.query || {});
    } else if (req.user.role === 'staff' || req.user.role === 'admin') {
        result = await require('../services/staffService').listAllAppointments(req.user, req.query || {});
    } else if (req.user.role === 'doctor') {
        result = await listDoctorAppointments(req.user, req.query || {});
    } else {
        return res.status(403).json({ status: false, message: 'Không có quyền xem lịch hẹn' });
    }
    if (!result.ok) return res.status(result.code || 400).json({ status: false, message: result.message });
    return res.json({ status: true, data: result.data });
}

// --- GET SLOTS ---
async function getSlots(req, res) {
    const { date, doctorId } = req.query || {};
    if (!date) return res.status(400).json({ status: false, message: 'date là bắt buộc' });
    try {
        const slots = await appointmentService.getAvailableSlots(doctorId, date);
        return res.json({ status: true, data: slots });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
}

// --- CONFIRM ---
async function confirm(req, res) {
    if (req.user.role !== 'staff' && req.user.role !== 'admin') return res.status(403).json({ status: false, message: 'Chỉ nhân viên mới được xác nhận lịch hẹn' });
    const { id } = req.params;
    const result = await require('../services/staffService').confirmAppointment(req.user, id);
    if (!result.ok) return res.status(result.code || 400).json({ status: false, message: result.message });
    return res.json({ status: true, message: result.message, data: result.data });
}

// --- CANCEL ---
async function cancel(req, res) {
    const { id } = req.params;
    let result;
    if (req.user.role === 'patient') result = await require('../services/patientService').cancelMyAppointment(req.user, id);
    else if (req.user.role === 'staff' || req.user.role === 'admin') result = await require('../services/staffService').cancelAppointment(req.user, id);
    else return res.status(403).json({ status: false, message: 'Không có quyền hủy lịch hẹn' });
    if (!result.ok) return res.status(result.code || 400).json({ status: false, message: result.message });
    const response = { status: true, message: result.message, data: result.data };
    if (result.suggestedSlots) response.suggestedSlots = result.suggestedSlots;
    return res.json(response);
}

// --- REJECT ---
async function reject(req, res) {
    if (req.user.role !== 'staff' && req.user.role !== 'admin') return res.status(403).json({ status: false, message: 'Chỉ nhân viên mới được từ chối lịch hẹn' });
    const { id } = req.params;
    const { reason } = req.body || {};
    const result = await require('../services/staffService').rejectAppointment(req.user, id, reason);
    if (!result.ok) return res.status(result.code || 400).json({ status: false, message: result.message });
    return res.json({ status: true, message: result.message, data: result.data, suggestedSlots: result.suggestedSlots || [] });
}

// --- GET SUGGESTED SLOTS ---
async function getSuggestedSlots(req, res) {
    const { id } = req.params;
    const { limit } = req.query || {};
    try {
        const suggestedSlots = await require('../services/appointmentService').getSuggestedSlots(id, limit ? parseInt(limit) : 5);
        return res.json({ status: true, data: suggestedSlots });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
}

// --- CHỨC NĂNG BÁC SĨ MỚI ---
// danh sách bác sĩ
async function listDoctors(req, res) {
    try {
        const doctors = await appointmentService.listActiveDoctors();
        return res.json({ status: true, data: doctors });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
}

// ngày trống theo bác sĩ
async function getAvailableDatesByDoctor(req, res) {
    const { doctorId } = req.query;
    if (!doctorId) return res.status(400).json({ status: false, message: 'doctorId là bắt buộc' });
    try {
        const dates = await appointmentService.getAvailableDatesByDoctor(doctorId);
        return res.json({ status: true, data: dates });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
}

// slot trống theo bác sĩ + ngày
async function getAvailableSlotsByDoctorAndDate(req, res) {
    const { doctorId, date } = req.query;
    if (!doctorId || !date) return res.status(400).json({ status: false, message: 'doctorId và date là bắt buộc' });
    try {
        const slots = await appointmentService.getAvailableSlotsByDoctorAndDate(doctorId, date);
        return res.json({ status: true, data: slots });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
}

// tạo appointment theo bác sĩ
async function createAppointmentByDoctor(req, res) {
    const { doctorId, appointmentDate, note } = req.body;

    let patientId;

    // Nếu là patient tự đặt, cần tìm Patient record từ userId
    if (req.user.role === 'patient') {
        const patient = await Patient.findOne({ userId: req.user._id });
        if (!patient) {
            return res.status(404).json({ status: false, message: 'Không tìm thấy thông tin bệnh nhân' });
        }
        patientId = patient._id;
    } else {
        // Nếu là staff/admin đặt cho bệnh nhân, lấy patientId từ body
        patientId = req.body.patientId;
    }

    if (!patientId) return res.status(400).json({ status: false, message: 'patientId là bắt buộc' });

    console.log("test111");
    console.log(patientId.toString());

    try {
        const result = await appointmentService.createAppointmentForDoctor({
            patientId,
            doctorId,
            appointmentDate,
            note,
            createdByRole: req.user.role
        });
        if (!result.ok) return res.status(result.code || 400).json({ status: false, message: result.message });
        return res.json({ status: true, data: result.data });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
}


// --- Helper function ---
async function listDoctorAppointments(currentUser, query) {
    const { status } = query || {};
    const doctor = await Doctor.findOne({ userId: currentUser._id }).lean();
    if (!doctor) return { ok: true, data: [] };
    const filter = { doctorId: doctor._id };
    if (status) filter.status = status;
    const data = await Appointment.find(filter)
        .sort({ appointmentDate: 1 })
        .populate('patientId', 'fullName phone')
        .populate('doctorId', 'fullName specialty')
        .populate('staffId', 'fullName')
        .lean();
    return { ok: true, data };
}

/**
 * PUT /appointments/:id - Cập nhật lịch hẹn
 */
async function updateAppointment(req, res) {
    const appointmentService = require('../services/appointmentService');
    const result = await appointmentService.updateAppointment(req.params.id, req.body || {});
    if (!result.ok) return res.status(result.code || 400).json({ status: false, message: result.message });
    return res.json({ status: true, message: result.message, data: result.data });
}

/**
 * DELETE /appointments/:id - Xóa lịch hẹn
 */
async function deleteAppointment(req, res) {
    const appointmentService = require('../services/appointmentService');
    const result = await appointmentService.deleteAppointment(req.params.id);
    if (!result.ok) return res.status(result.code || 400).json({ status: false, message: result.message });
    return res.json({ status: true, message: result.message });
}

module.exports = {
    create,
    list,
    getSlots,
    confirm,
    cancel,
    reject,
    getSuggestedSlots,
    // chức năng bác sĩ mới
    listDoctors,
    getAvailableDatesByDoctor,
    getAvailableSlotsByDoctorAndDate,
    createAppointmentByDoctor,
    updateAppointment,
    deleteAppointment
};
