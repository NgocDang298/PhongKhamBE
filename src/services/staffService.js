const { Appointment, Patient, Staff, MedicalProfile, User } = require('../models');
const appointmentService = require('./appointmentService');
const authService = require('./authService');

/**
 * Staff Service - Xử lý logic liên quan đến nhân viên
 */
const staffService = {
    /**
     * Nhân viên tạo hồ sơ bệnh nhân walk-in (tự động tạo tài khoản User)
     * Dùng cho trường hợp bệnh nhân đến trực tiếp tại bệnh viện
     * Sử dụng chung hàm registerPatient từ authService
     * @param {Object} currentUser - User hiện tại (role: staff/admin)
     * @param {Object} payload - { fullName, gender, dateOfBirth, address, phone, cccd, email (optional), password (optional) }
     * @returns {Object} - { ok, code, message, data }
     */
    async createPatientProfile(currentUser, payload) {
        const { fullName, gender, dateOfBirth, address, phone, cccd, email, password } = payload || {};

        // Validation
        if (!fullName || !gender || !dateOfBirth || !phone || !cccd) {
            return {
                ok: false,
                code: 400,
                message: 'fullName, gender, dateOfBirth, phone, cccd là bắt buộc'
            };
        }

        // Sử dụng hàm registerPatient chung với autoGenerateCredentials = true
        const result = await authService.registerPatient({
            phone,
            cccd,
            email,
            password,
            fullName,
            gender,
            dateOfBirth,
            address,
            autoGenerateCredentials: true // Tự động tạo password
        });

        if (!result.ok) {
            return result;
        }

        // Trả về response với format phù hợp cho staff service
        return {
            ok: true,
            code: 201,
            data: result.data,
            message: 'Tạo tài khoản và hồ sơ bệnh nhân thành công'
        };
    },

    /**
     * Nhân viên tạo hồ sơ bệnh nhân walk-in kèm medical profile cơ bản (tự động tạo tài khoản User)
     * Sử dụng chung hàm registerPatient từ authService
     * @param {Object} currentUser - Staff user
     * @param {Object} payload - Patient + medical info + email (optional), password (optional)
     * @returns {Object} - { ok, code, message, data }
     */
    async createPatientWithMedicalProfile(currentUser, payload) {
        const { fullName, gender, dateOfBirth, address, phone, cccd, email, password, medicalInfo } = payload || {};

        // Validation thông tin cơ bản
        if (!fullName || !gender || !dateOfBirth || !phone || !cccd) {
            return {
                ok: false,
                code: 400,
                message: 'fullName, gender, dateOfBirth, phone, cccd là bắt buộc'
            };
        }

        // Sử dụng hàm registerPatient chung
        const result = await authService.registerPatient({
            phone,
            cccd,
            email,
            password,
            fullName,
            gender,
            dateOfBirth,
            address,
            autoGenerateCredentials: true
        });

        if (!result.ok) {
            return result;
        }

        // Tạo medical profile cơ bản
        try {
            const medicalProfile = await MedicalProfile.create({
                patientId: result.data.patient._id,
                bloodType: medicalInfo?.bloodType || null,
                allergies: medicalInfo?.allergies || [],
                chronicDiseases: medicalInfo?.chronicDiseases || [],
                medications: medicalInfo?.medications || [],
                surgeries: medicalInfo?.surgeries || [],
                familyHistory: medicalInfo?.familyHistory || [],
                notes: medicalInfo?.notes || 'Hồ sơ tạo tại quầy - thông tin y tế cơ bản đã thu thập'
            });

            return {
                ok: true,
                code: 201,
                data: {
                    ...result.data,
                    medicalProfile
                },
                message: 'Tạo tài khoản, hồ sơ bệnh nhân và medical profile thành công'
            };
        } catch (error) {
            return { ok: false, code: 500, message: error.message || 'Lỗi server khi tạo medical profile' };
        }
    },

    /**
     * Lấy danh sách tất cả bệnh nhân (tất cả đều có tài khoản User)
     * @param {Object} currentUser - User hiện tại (role: staff/admin)
     * @param {Object} query - { search (optional) }
     * @returns {Object} - { ok, data }
     */
    async listAllPatients(currentUser, query) {
        const { search } = query || {};

        const filter = {};

        // Tìm kiếm theo tên hoặc CCCD
        if (search) {
            filter.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { cccd: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }

        const patients = await Patient.find(filter)
            .populate('userId', '-password -tokens')
            .sort({ createdAt: -1 })
            .lean();

        return { ok: true, data: patients };
    },


    /**
     * Nhân viên/Admin tạo lịch hẹn cho bệnh nhân
     * @param {Object} currentUser - User hiện tại (role: staff/admin)
     * @param {Object} payload - { patientId, doctorId (optional), appointmentDate, note }
     * @returns {Object} - { ok, code, message, data }
     */
    async createAppointmentForPatient(currentUser, payload) {
        const { patientId, doctorId, appointmentDate, note } = payload || {};

        if (!patientId) {
            return { ok: false, code: 400, message: 'patientId là bắt buộc khi tạo bởi nhân viên' };
        }

        if (!appointmentDate) {
            return { ok: false, code: 400, message: 'appointmentDate là bắt buộc' };
        }

        // Lấy thông tin staff
        const staff = await Staff.findOne({ userId: currentUser._id }).lean();
        const staffId = staff ? staff._id : null;
        console.log("test");
        console.log(patientId);
        // Gọi appointmentService để tạo appointment
        const result = await appointmentService.createAppointmentCore({
            patientId,
            doctorId,
            appointmentDate,
            note,
            staffId
        });

        return result;
    },

    /**
     * Lấy danh sách tất cả lịch hẹn (có thể lọc theo status)
     * @param {Object} currentUser - User hiện tại (role: staff/admin)
     * @param {Object} query - { status (optional) }
     * @returns {Object} - { ok, data }
     */
    async listAllAppointments(currentUser, query) {
        const { status } = query || {};

        const filter = {};
        if (status) filter.status = status;

        const data = await Appointment.find(filter)
            .sort({ createdAt: -1 })
            .populate('patientId', 'fullName')
            .populate('doctorId', 'fullName')
            .populate('staffId', 'fullName')
            .lean();

        return { ok: true, data };
    },

    /**
     * Xác nhận appointment (chỉ nhân viên/staff)
     * Khi confirm, slot sẽ bị lock (vì chỉ tính confirmed appointments)
     * @param {Object} currentUser - User hiện tại (role: staff/admin)
     * @param {String} appointmentId - ID appointment
     * @returns {Object} - { ok, code, message, data }
     */
    async confirmAppointment(currentUser, appointmentId) {
        const appointment = await Appointment.findById(appointmentId).lean();
        if (!appointment) {
            return { ok: false, code: 404, message: 'Lịch hẹn không tồn tại' };
        }

        // Chỉ confirm được appointment pending
        if (appointment.status !== 'pending') {
            return {
                ok: false,
                code: 400,
                message: `Lịch hẹn đã có trạng thái ${appointment.status}, không thể xác nhận`
            };
        }

        // Kiểm tra slot còn available không (chỉ tính confirmed appointments)
        const slotAvailability = await appointmentService.checkSlotAvailability(
            appointment.doctorId,
            appointment.appointmentDate
        );

        if (!slotAvailability.available) {
            return {
                ok: false,
                code: 400,
                message: `Không thể xác nhận: ${slotAvailability.reason}`
            };
        }

        // Lấy staff ID
        const staff = await Staff.findOne({ userId: currentUser._id }).lean();
        const staffId = staff ? staff._id : null;

        // Update appointment status = confirmed
        // Khi confirm, slot này sẽ bị lấp đầy (filled) và không còn available cho lịch hẹn khác
        const updatedAppointment = await Appointment.findByIdAndUpdate(
            appointmentId,
            {
                status: 'confirmed',
                staffId: staffId // Lưu staff đã confirm
            },
            { new: true }
        )
            .populate('patientId', 'fullName phone')
            .populate('doctorId', 'fullName specialty')
            .populate('staffId', 'fullName')
            .lean();

        return {
            ok: true,
            data: updatedAppointment,
            message: 'Lịch hẹn đã được xác nhận thành công. Khung giờ này đã được lấp đầy.'
        };
    },

    /**
     * Từ chối appointment (reject) - chỉ staff/admin
     * Khác với cancel: reject là khi staff từ chối pending appointment
     * @param {Object} currentUser - User hiện tại (role: staff/admin)
     * @param {String} appointmentId - ID appointment
     * @param {String} reason - Lý do từ chối
     * @returns {Object} - { ok, code, message, data, suggestedSlots }
     */
    async rejectAppointment(currentUser, appointmentId, reason) {
        const appointment = await Appointment.findById(appointmentId).lean();
        if (!appointment) {
            return { ok: false, code: 404, message: 'Lịch hẹn không tồn tại' };
        }

        // Chỉ reject được appointment pending
        if (appointment.status !== 'pending') {
            return {
                ok: false,
                code: 400,
                message: `Chỉ có thể từ chối lịch hẹn đang chờ xác nhận (pending), hiện tại lịch có trạng thái ${appointment.status}`
            };
        }

        // Lấy staff ID
        const staff = await Staff.findOne({ userId: currentUser._id }).lean();
        const staffId = staff ? staff._id : null;

        // Update appointment status = cancelled và lưu lý do
        const updatedAppointment = await Appointment.findByIdAndUpdate(
            appointmentId,
            {
                status: 'cancelled',
                staffId: staffId,
                note: reason ? `${appointment.note || ''}\n[Rejected by staff]: ${reason}`.trim() : appointment.note
            },
            { new: true }
        )
            .populate('patientId', 'fullName phone')
            .populate('doctorId', 'fullName specialty')
            .populate('staffId', 'fullName')
            .lean();

        // Tìm các slots thay thế để gợi ý cho bệnh nhân
        const suggestedSlots = await appointmentService.getSuggestedSlots(appointmentId, 5);

        return {
            ok: true,
            data: updatedAppointment,
            suggestedSlots: suggestedSlots,
            message: 'Lịch hẹn đã được từ chối. Vui lòng gợi ý bệnh nhân các giờ khác.'
        };
    },

    /**
     * Hủy appointment (staff/admin có thể hủy bất kỳ lịch nào)
     * @param {Object} currentUser - User hiện tại (role: staff/admin)
     * @param {String} appointmentId - ID appointment
     * @returns {Object} - { ok, code, message, data, suggestedSlots }
     */
    async cancelAppointment(currentUser, appointmentId) {
        const appointment = await Appointment.findById(appointmentId).lean();
        if (!appointment) {
            return { ok: false, code: 404, message: 'Lịch hẹn không tồn tại' };
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
                ? 'Lịch hẹn đã được hủy. Có thể gợi ý bệnh nhân các giờ khác.'
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
    }
};

module.exports = staffService;


