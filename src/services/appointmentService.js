const { Appointment, WorkSchedule, Doctor } = require('../models');

const APPOINTMENT_DURATION_MINUTES = 30;

// --- Tạo Date VN (0h ngày đó) ---
function createDateVN(dateStr) {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day, 0, 0, 0)); // UTC tương ứng 0h VN
}

// --- Kiểm tra xung đột slot ---
function hasTimeConflict(slotUTC, existingUTC) {
    const diffMinutes = Math.abs(slotUTC - existingUTC) / (1000 * 60);
    return diffMinutes < APPOINTMENT_DURATION_MINUTES;
}

// --- Format slot trực tiếp giờ VN ---
function formatSlotVN(slotUTC) {
    const d = new Date(slotUTC.getTime());
    d.setUTCHours(d.getUTCHours() + 7); // UTC → VN
    const yyyy = d.getUTCFullYear();
    const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(d.getUTCDate()).padStart(2, '0');
    const hh = String(d.getUTCHours()).padStart(2, '0');
    const min = String(d.getUTCMinutes()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

// --- Tạo slot theo ca bác sĩ ---
function getSlotsForShift(dateVN, shiftStart, shiftEnd) {
    const slots = [];
    const [startH, startM] = shiftStart.split(':').map(Number);
    const [endH, endM] = shiftEnd.split(':').map(Number);

    let slotUTC = new Date(dateVN.getTime());
    slotUTC.setUTCHours(startH - 7, startM, 0, 0); // giờ VN → UTC

    const endUTC = new Date(dateVN.getTime());
    endUTC.setUTCHours(endH - 7, endM, 0, 0);

    while (slotUTC < endUTC) {
        slots.push(new Date(slotUTC));
        slotUTC = new Date(slotUTC.getTime() + APPOINTMENT_DURATION_MINUTES * 60 * 1000);
    }

    return slots;
}

// --- Lấy slot trống theo bác sĩ & ngày (hoặc chuyên khoa) ---
async function getAvailableSlotsByDoctorAndDate(doctorId, dateStr, specialty) {
    const dateVN = createDateVN(dateStr);
    const dayOfWeek = dateVN.getUTCDay(); // 0 = Sunday, 1 = Monday...

    const filter = { dayOfWeek };
    if (doctorId) {
        filter.doctorId = doctorId;
    } else if (specialty) {
        // Nếu không có doctorId nhưng có chuyên khoa, tìm các bác sĩ thuộc chuyên khoa đó
        const doctorsInSpecialty = await Doctor.find({ specialty, active: true }).select('_id').lean();
        const ids = doctorsInSpecialty.map(d => d._id);
        filter.doctorId = { $in: ids };
    }

    const schedules = await WorkSchedule.find(filter).lean();
    if (!schedules.length) return [];

    const nextDateVN = new Date(dateVN.getTime());
    nextDateVN.setUTCDate(dateVN.getUTCDate() + 1);

    const apptFilter = {
        status: 'confirmed',
        appointmentDate: { $gte: dateVN, $lt: nextDateVN }
    };
    if (doctorId) apptFilter.doctorId = doctorId;

    const appointments = await Appointment.find(apptFilter).select('appointmentDate doctorId').lean();

    const slots = [];
    const timeSet = new Set();

    for (const schedule of schedules) {
        const shiftSlots = getSlotsForShift(dateVN, schedule.shiftStart, schedule.shiftEnd);
        for (const slot of shiftSlots) {
            const timeStr = formatSlotVN(slot);

            if (!appointments.some(appt =>
                appt.doctorId.toString() === schedule.doctorId.toString() &&
                hasTimeConflict(slot, new Date(appt.appointmentDate))
            )) {
                if (!doctorId) {
                    // Trường hợp auto-assign (không truyền doctorId): Chỉ lấy unique time
                    if (!timeSet.has(timeStr)) {
                        slots.push({ time: timeStr });
                        timeSet.add(timeStr);
                    }
                } else {
                    // Trường hợp xem đích danh 1 bác sĩ: Lấy đủ time và doctorId
                    slots.push({ time: timeStr, doctorId: schedule.doctorId });
                }
            }
        }
    }

    // Sắp xếp theo thứ tự thời gian tăng dần để FE hiển thị dễ nhìn
    slots.sort((a, b) => a.time.localeCompare(b.time));

    return slots;
}

// --- Lấy ngày trống theo bác sĩ ---
async function getAvailableDatesByDoctor(doctorId, daysAhead = 30) {
    const datesWithSlot = [];
    const fromDate = createDateVN(new Date().toISOString().slice(0, 10));

    for (let i = 0; i <= daysAhead; i++) {
        const dateVN = new Date(fromDate.getTime());
        dateVN.setUTCDate(fromDate.getUTCDate() + i);

        const dayOfWeek = dateVN.getUTCDay();

        const schedules = await WorkSchedule.find({ doctorId, dayOfWeek }).lean();
        if (!schedules.length) continue;

        const nextDateVN = new Date(dateVN.getTime());
        nextDateVN.setUTCDate(dateVN.getUTCDate() + 1);

        const appointments = await Appointment.find({
            doctorId,
            status: 'confirmed',
            appointmentDate: { $gte: dateVN, $lt: nextDateVN }
        }).select('appointmentDate').lean();

        let hasSlot = false;
        for (const schedule of schedules) {
            const shiftSlots = getSlotsForShift(dateVN, schedule.shiftStart, schedule.shiftEnd);
            if (shiftSlots.some(slot => !appointments.some(appt => hasTimeConflict(slot, new Date(appt.appointmentDate))))) {
                hasSlot = true;
                break;
            }
        }

        if (hasSlot) datesWithSlot.push(dateVN.toISOString().slice(0, 10));
    }

    return datesWithSlot;
}

// --- Tự động chọn bác sĩ phù hợp ---
// Thuật toán: Tìm bác sĩ có lịch làm việc, có slot trống, và ít lịch hẹn nhất (load balancing)
async function autoAssignDoctor(appointmentDate, specialty) {
    const slotUTC = new Date(appointmentDate);

    // Lấy ngày và thứ trong tuần
    const dateVN = new Date(slotUTC.getTime());
    dateVN.setUTCHours(0, 0, 0, 0);
    const dayOfWeek = dateVN.getUTCDay(); // 0 = Sunday

    // Tìm tất cả bác sĩ active theo chuyên khoa (nếu có)
    const doctorFilter = { active: true };
    if (specialty) doctorFilter.specialty = specialty;

    const activeDoctors = await Doctor.find(doctorFilter).select('_id fullName specialty').lean();
    if (!activeDoctors.length) {
        return { ok: false, message: specialty ? `Không có bác sĩ chuyên khoa ${specialty} khả dụng` : 'Không có bác sĩ nào khả dụng', code: 404 };
    }

    // Lấy lịch làm việc của các bác sĩ trong ngày này
    const doctorIds = activeDoctors.map(d => d._id);
    const schedules = await WorkSchedule.find({
        doctorId: { $in: doctorIds },
        dayOfWeek: dayOfWeek
    }).lean();

    if (!schedules.length) {
        return { ok: false, message: 'Không có bác sĩ nào làm việc trong ngày này', code: 404 };
    }

    // Lọc bác sĩ có lịch làm việc
    const doctorsWithSchedule = schedules.map(s => s.doctorId.toString());

    // Kiểm tra từng bác sĩ xem có slot trống không
    const availableDoctors = [];

    for (const schedule of schedules) {
        const doctorId = schedule.doctorId;

        // Kiểm tra xem slot này có bị conflict với appointment đã confirm không
        const conflict = await Appointment.findOne({
            doctorId,
            status: 'confirmed',
            appointmentDate: {
                $lt: new Date(slotUTC.getTime() + APPOINTMENT_DURATION_MINUTES * 60 * 1000),
                $gte: slotUTC
            }
        });

        // Kiểm tra xem thời gian có nằm trong ca làm việc không
        const [startH, startM] = schedule.shiftStart.split(':').map(Number);
        const [endH, endM] = schedule.shiftEnd.split(':').map(Number);

        const shiftStartUTC = new Date(dateVN.getTime());
        shiftStartUTC.setUTCHours(startH - 7, startM, 0, 0);

        const shiftEndUTC = new Date(dateVN.getTime());
        shiftEndUTC.setUTCHours(endH - 7, endM, 0, 0);

        const isInShift = slotUTC >= shiftStartUTC && slotUTC < shiftEndUTC;

        if (!conflict && isInShift) {
            // Đếm số lịch hẹn confirmed của bác sĩ trong ngày
            const nextDateVN = new Date(dateVN.getTime());
            nextDateVN.setUTCDate(dateVN.getUTCDate() + 1);

            const appointmentCount = await Appointment.countDocuments({
                doctorId,
                status: 'confirmed',
                appointmentDate: { $gte: dateVN, $lt: nextDateVN }
            });

            availableDoctors.push({
                doctorId,
                appointmentCount,
                doctor: activeDoctors.find(d => d._id.toString() === doctorId.toString())
            });
        }
    }

    if (!availableDoctors.length) {
        return { ok: false, message: 'Không có bác sĩ nào có slot trống tại thời điểm này', code: 404 };
    }

    // Sắp xếp theo số lượng lịch hẹn tăng dần (ưu tiên bác sĩ ít lịch hẹn nhất)
    availableDoctors.sort((a, b) => a.appointmentCount - b.appointmentCount);

    // Chọn bác sĩ đầu tiên (có ít lịch hẹn nhất)
    const selectedDoctor = availableDoctors[0];

    return {
        ok: true,
        doctorId: selectedDoctor.doctorId,
        doctor: selectedDoctor.doctor,
        appointmentCount: selectedDoctor.appointmentCount
    };
}

// --- Tạo lịch hẹn theo bác sĩ ---
async function createAppointmentForDoctor({ patientId, doctorId, appointmentDate, note, createdByRole, specialty }) {
    const slotUTC = new Date(appointmentDate);

    // Nếu không có doctorId, tự động chọn bác sĩ
    if (!doctorId) {
        const autoAssignResult = await autoAssignDoctor(appointmentDate, specialty);
        if (!autoAssignResult.ok) {
            return autoAssignResult;
        }
        doctorId = autoAssignResult.doctorId;
        console.log(`Tự động chọn bác sĩ: ${autoAssignResult.doctor.fullName} (${autoAssignResult.appointmentCount} lịch hẹn trong ngày)`);
    }

    // Kiểm tra xung đột với appointment đã confirm
    const conflict = await Appointment.findOne({
        doctorId,
        status: 'confirmed',
        appointmentDate: {
            $lt: new Date(slotUTC.getTime() + APPOINTMENT_DURATION_MINUTES * 60 * 1000),
            $gte: slotUTC
        }
    });

    if (conflict) return { ok: false, message: 'Slot này đã có người đặt', code: 400 };

    // Nếu patient tự tạo => status pending, nếu staff/admin tạo => confirmed
    const status = (createdByRole === 'patient') ? 'pending' : 'confirmed';

    const newAppointment = await Appointment.create({
        patientId,
        doctorId,
        appointmentDate: slotUTC,
        note,
        status
    });

    // Populate để trả về thông tin đầy đủ
    const populatedAppointment = await Appointment.findById(newAppointment._id)
        .populate('patientId', 'fullName phone gender dateOfBirth')
        .populate('doctorId', 'fullName specialty')
        .lean();

    return { ok: true, data: populatedAppointment };
}

// --- Danh sách bác sĩ ---
async function listActiveDoctors() {
    return Doctor.find({ active: true }).select('fullName specialty').lean();
}

// --- Kiểm tra slot có available không ---
async function checkSlotAvailability(doctorId, appointmentDate) {
    const slotUTC = new Date(appointmentDate);

    // Kiểm tra xung đột với appointment đã confirm
    const conflict = await Appointment.findOne({
        doctorId,
        status: 'confirmed',
        appointmentDate: {
            $lt: new Date(slotUTC.getTime() + APPOINTMENT_DURATION_MINUTES * 60 * 1000),
            $gte: slotUTC
        }
    });

    if (conflict) {
        return {
            available: false,
            reason: 'Slot này đã có người đặt'
        };
    }

    return { available: true };
}

// --- Lấy slots gợi ý thay thế ---
async function getSuggestedSlots(appointmentId, limit = 5) {
    const appointment = await Appointment.findById(appointmentId).lean();
    if (!appointment) return [];

    const dateStr = appointment.appointmentDate.toISOString().slice(0, 10);
    const slots = await getAvailableSlotsByDoctorAndDate(appointment.doctorId, dateStr);

    return slots.slice(0, limit);
}

// --- Tạo appointment core (dùng chung cho staff) ---
async function createAppointmentCore({ patientId, doctorId, appointmentDate, note, staffId }) {
    if (!appointmentDate) {
        return { ok: false, code: 400, message: 'appointmentDate là bắt buộc' };
    }

    const slotUTC = new Date(appointmentDate);

    // Kiểm tra xung đột với appointment đã confirm
    const conflict = await Appointment.findOne({
        doctorId,
        status: 'confirmed',
        appointmentDate: {
            $lt: new Date(slotUTC.getTime() + APPOINTMENT_DURATION_MINUTES * 60 * 1000),
            $gte: slotUTC
        }
    });

    if (conflict) return { ok: false, message: 'Slot này đã có người đặt', code: 400 };

    // Nếu có staffId => staff tạo => confirmed, không có => patient tự tạo => pending
    const status = staffId ? 'confirmed' : 'pending';

    const newAppointment = await Appointment.create({
        patientId,
        doctorId,
        appointmentDate: slotUTC,
        note,
        status,
        staffId
    });

    // Populate để trả về thông tin đầy đủ
    const populatedAppointment = await Appointment.findById(newAppointment._id)
        .populate('patientId', 'fullName phone gender dateOfBirth')
        .populate('doctorId', 'fullName specialty')
        .populate('staffId', 'fullName')
        .lean();

    return { ok: true, data: populatedAppointment };
}

/**
 * Cập nhật lịch hẹn
 * @param {String} appointmentId
 * @param {Object} updates - { appointmentDate, note, doctorId }
 * @returns {Object} - { ok, data, message, code }
 */
async function updateAppointment(appointmentId, updates) {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
        return { ok: false, code: 404, message: 'Không tìm thấy lịch hẹn' };
    }

    // Only allow updating pending or confirmed appointments
    if (appointment.status === 'cancelled') {
        return { ok: false, code: 400, message: 'Không thể cập nhật lịch hẹn đã hủy' };
    }

    // Update allowed fields
    if (updates.appointmentDate) {
        appointment.appointmentDate = new Date(updates.appointmentDate);
    }
    if (updates.note !== undefined) {
        appointment.note = updates.note;
    }
    if (updates.doctorId) {
        appointment.doctorId = updates.doctorId;
    }

    await appointment.save();

    const updatedAppointment = await Appointment.findById(appointmentId)
        .populate('patientId', 'fullName phone')
        .populate('doctorId', 'fullName specialty')
        .populate('staffId', 'fullName')
        .lean();

    return {
        ok: true,
        data: updatedAppointment,
        message: 'Cập nhật lịch hẹn thành công'
    };
}

/**
 * Xóa lịch hẹn (chỉ xóa được lịch pending)
 * @param {String} appointmentId
 * @returns {Object} - { ok, message, code }
 */
async function deleteAppointment(appointmentId) {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
        return { ok: false, code: 404, message: 'Không tìm thấy lịch hẹn' };
    }

    // Only allow deleting pending appointments
    if (appointment.status !== 'pending') {
        return { ok: false, code: 400, message: 'Chỉ có thể xóa lịch hẹn đang chờ xác nhận' };
    }

    await Appointment.findByIdAndDelete(appointmentId);

    return {
        ok: true,
        message: 'Xóa lịch hẹn thành công'
    };
}

// --- Lấy danh sách chuyên khoa ---
async function listSpecialties() {
    const specialties = await Doctor.distinct('specialty', { active: true, specialty: { $ne: null } });
    return specialties.sort();
}

module.exports = {
    getAvailableSlotsByDoctorAndDate,
    getAvailableSlots: getAvailableSlotsByDoctorAndDate, // Alias for consistency
    getAvailableDatesByDoctor,
    createAppointmentForDoctor,
    listActiveDoctors,
    listSpecialties,
    checkSlotAvailability,
    getSuggestedSlots,
    createAppointmentCore,
    updateAppointment,
    deleteAppointment,
    autoAssignDoctor
};
