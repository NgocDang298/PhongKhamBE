const { Appointment, Patient } = require('../models');
const appointmentService = require('./appointmentService');

/**
 * Patient Service - Xử lý logic liên quan đến bệnh nhân
 */
const patientService = {
    /**
     * Bệnh nhân đặt lịch hẹn khám
     * Có 2 cách đặt lịch:
     * 1. Đặt lịch qua bác sĩ: { doctorId, appointmentDate, note }
     * 2. Đặt lịch qua ngày khám (tự động sắp xếp bác sĩ): { appointmentDate, note }
     * @param {Object} currentUser - User hiện tại (role: patient)
     * @param {Object} payload - { doctorId (optional), appointmentDate, note }
     * @returns {Object} - { ok, code, message, data }
     */
    async createAppointment(currentUser, payload) {
        const { doctorId, appointmentDate, note } = payload || {};

        if (!appointmentDate) {
            return { ok: false, code: 400, message: 'appointmentDate là bắt buộc' };
        }

        // Lấy thông tin patient từ user
        const patient = await Patient.findOne({ userId: currentUser._id }).lean();
        if (!patient) {
            return { ok: false, code: 400, message: 'Hồ sơ bệnh nhân không tồn tại' };
        }

        // Gọi appointmentService để tạo appointment
        const result = await appointmentService.createAppointmentForDoctor({
            patientId: patient._id,
            doctorId,
            appointmentDate,
            note,
            staffId: null
        });

        return result;
    },

    /**
     * Lấy danh sách lịch hẹn của bệnh nhân
     * @param {Object} currentUser - User hiện tại (role: patient)
     * @param {Object} query - { status (optional) }
     * @returns {Object} - { ok, data }
     */
    async listMyAppointments(currentUser, query) {
        const { status } = query || {};

        const patient = await Patient.findOne({ userId: currentUser._id }).lean();
        if (!patient) {
            return { ok: true, data: [] };
        }

        const filter = { patientId: patient._id };
        if (status) filter.status = status;

        const data = await Appointment.find(filter)
            .sort({ appointmentDate: 1 })
            .populate('patientId', 'fullName phone')
            .populate('doctorId', 'fullName specialty')
            .populate('staffId', 'fullName')
            .lean();

        return { ok: true, data };
    },

    /**
     * Bệnh nhân hủy lịch hẹn của chính mình
     * @param {Object} currentUser - User hiện tại (role: patient)
     * @param {String} appointmentId - ID appointment
     * @returns {Object} - { ok, code, message, data, suggestedSlots }
     */
    async cancelMyAppointment(currentUser, appointmentId) {
        const appointment = await Appointment.findById(appointmentId).lean();
        if (!appointment) {
            return { ok: false, code: 404, message: 'Lịch hẹn không tồn tại' };
        }

        // Kiểm tra quyền - patient chỉ hủy được lịch của chính mình
        const patient = await Patient.findOne({ userId: currentUser._id }).lean();
        if (!patient || patient._id.toString() !== appointment.patientId.toString()) {
            return { ok: false, code: 403, message: 'Bạn chỉ có thể hủy lịch hẹn của chính mình' };
        }

        // Chỉ hủy được appointment pending hoặc confirmed
        if (appointment.status === 'cancelled') {
            return { ok: false, code: 400, message: 'Lịch hẹn đã bị hủy trước đó' };
        }

        // Lưu status cũ để kiểm tra sau
        const oldStatus = appointment.status;

        // Update appointment status = cancelled
        const updatedAppointment = await Appointment.findByIdAndUpdate(
            appointmentId,
            { status: 'cancelled' },
            { new: true }
        )
            .populate('patientId', 'fullName phone')
            .populate('doctorId', 'fullName specialty')
            .populate('staffId', 'fullName')
            .lean();

        // Nếu cancel appointment đã confirmed, gợi ý slots thay thế
        let suggestedSlots = [];
        if (oldStatus === 'confirmed') {
            suggestedSlots = await appointmentService.getSuggestedSlots(appointmentId, 5);
        }

        return {
            ok: true,
            data: updatedAppointment,
            suggestedSlots: suggestedSlots.length > 0 ? suggestedSlots : undefined,
            message: suggestedSlots.length > 0
                ? 'Lịch hẹn đã được hủy. Dưới đây là các giờ khác bạn có thể đặt lại.'
                : 'Lịch hẹn đã được hủy thành công'
        };
    },

    /**
     * Lấy danh sách slots có sẵn cho một ngày/bác sĩ
     * @param {String|Object} doctorId - ID bác sĩ (optional)
     * @param {Date|String} date - Ngày cần xem slots
     * @returns {Array} - Danh sách slots
     */
    async getAvailableSlots(doctorId, date) {
        return await appointmentService.getAvailableSlots(doctorId, date);
    },

    /**
     * Lấy các slots gợi ý thay thế cho một appointment
     * @param {String} appointmentId - ID appointment
     * @param {Number} limit - Số lượng slots gợi ý
     * @returns {Array} - Danh sách slots gợi ý
     */
    async getSuggestedSlots(appointmentId, limit = 5) {
        return await appointmentService.getSuggestedSlots(appointmentId, limit);
    },

    /**
     * Cập nhật thông tin bệnh nhân
     * @param {String} patientId - ID bệnh nhân
     * @param {Object} updates - { fullName, phone, address, gender, dateOfBirth, cccd, email }
     * @returns {Object} - { ok, code, message, data }
     */
    async updatePatient(patientId, updates) {
        const patient = await Patient.findById(patientId);
        if (!patient) {
            return { ok: false, code: 404, message: 'Không tìm thấy bệnh nhân' };
        }

        // Validate and update allowed fields
        const allowedFields = ['fullName', 'phone', 'address', 'gender', 'dateOfBirth', 'cccd', 'email'];

        for (const field of allowedFields) {
            if (updates[field] !== undefined) {
                patient[field] = updates[field];
            }
        }

        await patient.save();

        return {
            ok: true,
            data: patient,
            message: 'Cập nhật thông tin bệnh nhân thành công'
        };
    },

    /**
     * Xóa bệnh nhân (soft delete)
     * @param {String} patientId - ID bệnh nhân
     * @returns {Object} - { ok, code, message }
     */
    async deletePatient(patientId) {
        const patient = await Patient.findById(patientId);
        if (!patient) {
            return { ok: false, code: 404, message: 'Không tìm thấy bệnh nhân' };
        }

        // Soft delete - mark as inactive
        patient.isActive = false;
        await patient.save();

        return {
            ok: true,
            message: 'Xóa bệnh nhân thành công'
        };
    }
};

module.exports = patientService;

