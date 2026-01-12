const { WorkSchedule, Doctor, LabNurse } = require('../models');

/**
 * Helper: Validate time format (HH:mm)
 */
function isValidTimeFormat(time) {
    const timeRegex = /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/;
    return timeRegex.test(time);
}

/**
 * Helper: Check if two time ranges overlap
 */
function timeRangesOverlap(start1, end1, start2, end2) {
    // Convert HH:mm to minutes for comparison
    const toMinutes = (time) => {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    };

    const s1 = toMinutes(start1);
    const e1 = toMinutes(end1);
    const s2 = toMinutes(start2);
    const e2 = toMinutes(end2);

    // Check overlap: start1 < end2 AND start2 < end1
    return s1 < e2 && s2 < e1;
}

/**
 * Helper: Check if time is between start and end
 */
function timeIsBetween(time, start, end) {
    const toMinutes = (t) => {
        const [hours, minutes] = t.split(':').map(Number);
        return hours * 60 + minutes;
    };

    const t = toMinutes(time);
    const s = toMinutes(start);
    const e = toMinutes(end);

    return t >= s && t <= e;
}

/**
 * Tạo lịch làm việc
 * @param {Object} params - { doctorId, labNurseId, dayOfWeek, shiftStart, shiftEnd, note }
 * @returns {Object} - { ok, data, message, code }
 */
async function createWorkSchedule({ doctorId, labNurseId, dayOfWeek, shiftStart, shiftEnd, note }) {
    // Validate: Must have either doctorId OR labNurseId (not both, not neither)
    if ((!doctorId && !labNurseId) || (doctorId && labNurseId)) {
        return { ok: false, code: 400, message: 'Phải có doctorId HOẶC labNurseId (không được cả hai hoặc không có)' };
    }

    // Validate dayOfWeek
    if (dayOfWeek < 0 || dayOfWeek > 6) {
        return { ok: false, code: 400, message: 'dayOfWeek phải từ 0 (Chủ nhật) đến 6 (Thứ 7)' };
    }

    // Validate time format
    if (!isValidTimeFormat(shiftStart) || !isValidTimeFormat(shiftEnd)) {
        return { ok: false, code: 400, message: 'Định dạng thời gian phải là HH:mm (ví dụ: 08:00)' };
    }

    // Validate shiftStart < shiftEnd
    if (shiftStart >= shiftEnd) {
        return { ok: false, code: 400, message: 'shiftStart phải nhỏ hơn shiftEnd' };
    }

    // Check if doctor/nurse exists
    if (doctorId) {
        const doctor = await Doctor.findById(doctorId).lean();
        if (!doctor) {
            return { ok: false, code: 404, message: 'Không tìm thấy bác sĩ' };
        }
    }

    if (labNurseId) {
        const nurse = await LabNurse.findById(labNurseId).lean();
        if (!nurse) {
            return { ok: false, code: 404, message: 'Không tìm thấy y tá xét nghiệm' };
        }
    }

    // Check for schedule conflicts
    const query = { dayOfWeek };
    if (doctorId) query.doctorId = doctorId;
    if (labNurseId) query.labNurseId = labNurseId;

    const existingSchedules = await WorkSchedule.find(query).lean();

    for (const schedule of existingSchedules) {
        if (timeRangesOverlap(shiftStart, shiftEnd, schedule.shiftStart, schedule.shiftEnd)) {
            return {
                ok: false,
                code: 400,
                message: `Xung đột lịch làm việc: Ca ${schedule.shiftStart}-${schedule.shiftEnd} đã tồn tại`
            };
        }
    }

    // Create work schedule
    const workSchedule = await WorkSchedule.create({
        doctorId: doctorId || null,
        labNurseId: labNurseId || null,
        dayOfWeek,
        shiftStart,
        shiftEnd,
        note: note || ''
    });

    // Populate để trả về đầy đủ thông tin
    const populated = await WorkSchedule.findById(workSchedule._id)
        .populate('doctorId', 'fullName specialty')
        .populate('labNurseId', 'fullName')
        .lean();

    return {
        ok: true,
        data: populated,
        message: 'Tạo lịch làm việc thành công'
    };
}

/**
 * Lấy lịch làm việc của bác sĩ
 * @param {String} doctorId
 * @returns {Object} - { ok, data }
 */
async function getDoctorSchedule(doctorId) {
    // Check if doctor exists
    const doctor = await Doctor.findById(doctorId).lean();
    if (!doctor) {
        return { ok: false, code: 404, message: 'Không tìm thấy bác sĩ' };
    }

    const schedules = await WorkSchedule.find({ doctorId })
        .sort({ dayOfWeek: 1, shiftStart: 1 })
        .lean();

    return { ok: true, data: schedules };
}

/**
 * Lấy lịch làm việc của y tá
 * @param {String} nurseId
 * @returns {Object} - { ok, data }
 */
async function getNurseSchedule(nurseId) {
    // Check if nurse exists
    const nurse = await LabNurse.findById(nurseId).lean();
    if (!nurse) {
        return { ok: false, code: 404, message: 'Không tìm thấy y tá xét nghiệm' };
    }

    const schedules = await WorkSchedule.find({ labNurseId: nurseId })
        .sort({ dayOfWeek: 1, shiftStart: 1 })
        .lean();

    return { ok: true, data: schedules };
}

/**
 * Cập nhật lịch làm việc
 * @param {String} scheduleId
 * @param {Object} updates - { dayOfWeek, shiftStart, shiftEnd, note }
 * @returns {Object} - { ok, data, message, code }
 */
async function updateWorkSchedule(scheduleId, updates) {
    const schedule = await WorkSchedule.findById(scheduleId);

    if (!schedule) {
        return { ok: false, code: 404, message: 'Không tìm thấy lịch làm việc' };
    }

    // Validate dayOfWeek if provided
    if (updates.dayOfWeek !== undefined && (updates.dayOfWeek < 0 || updates.dayOfWeek > 6)) {
        return { ok: false, code: 400, message: 'dayOfWeek phải từ 0 đến 6' };
    }

    // Validate time format if provided
    if (updates.shiftStart && !isValidTimeFormat(updates.shiftStart)) {
        return { ok: false, code: 400, message: 'Định dạng shiftStart phải là HH:mm' };
    }

    if (updates.shiftEnd && !isValidTimeFormat(updates.shiftEnd)) {
        return { ok: false, code: 400, message: 'Định dạng shiftEnd phải là HH:mm' };
    }

    // Get new values (use existing if not updated)
    const newDayOfWeek = updates.dayOfWeek !== undefined ? updates.dayOfWeek : schedule.dayOfWeek;
    const newShiftStart = updates.shiftStart || schedule.shiftStart;
    const newShiftEnd = updates.shiftEnd || schedule.shiftEnd;

    // Validate shiftStart < shiftEnd
    if (newShiftStart >= newShiftEnd) {
        return { ok: false, code: 400, message: 'shiftStart phải nhỏ hơn shiftEnd' };
    }

    // Check for conflicts (exclude current schedule)
    const query = {
        dayOfWeek: newDayOfWeek,
        _id: { $ne: scheduleId }
    };

    if (schedule.doctorId) query.doctorId = schedule.doctorId;
    if (schedule.labNurseId) query.labNurseId = schedule.labNurseId;

    const existingSchedules = await WorkSchedule.find(query).lean();

    for (const existing of existingSchedules) {
        if (timeRangesOverlap(newShiftStart, newShiftEnd, existing.shiftStart, existing.shiftEnd)) {
            return {
                ok: false,
                code: 400,
                message: `Xung đột lịch làm việc: Ca ${existing.shiftStart}-${existing.shiftEnd} đã tồn tại`
            };
        }
    }

    // Update fields
    if (updates.dayOfWeek !== undefined) schedule.dayOfWeek = updates.dayOfWeek;
    if (updates.shiftStart) schedule.shiftStart = updates.shiftStart;
    if (updates.shiftEnd) schedule.shiftEnd = updates.shiftEnd;
    if (updates.note !== undefined) schedule.note = updates.note;

    await schedule.save();

    const updated = await WorkSchedule.findById(scheduleId)
        .populate('doctorId', 'fullName specialty')
        .populate('labNurseId', 'fullName')
        .lean();

    return {
        ok: true,
        data: updated,
        message: 'Cập nhật lịch làm việc thành công'
    };
}

/**
 * Xóa lịch làm việc
 * @param {String} scheduleId
 * @returns {Object} - { ok, message, code }
 */
async function deleteWorkSchedule(scheduleId) {
    const schedule = await WorkSchedule.findById(scheduleId);

    if (!schedule) {
        return { ok: false, code: 404, message: 'Không tìm thấy lịch làm việc' };
    }

    await WorkSchedule.findByIdAndDelete(scheduleId);

    return {
        ok: true,
        message: 'Xóa lịch làm việc thành công'
    };
}

/**
 * Tìm bác sĩ/y tá có lịch làm việc tại thời điểm cụ thể
 * @param {Object} params - { dayOfWeek, time, role }
 * @returns {Object} - { ok, data }
 */
async function findAvailableStaff({ dayOfWeek, time, role }) {
    // Validate inputs
    if (dayOfWeek < 0 || dayOfWeek > 6) {
        return { ok: false, code: 400, message: 'dayOfWeek phải từ 0 đến 6' };
    }

    if (!isValidTimeFormat(time)) {
        return { ok: false, code: 400, message: 'Định dạng time phải là HH:mm' };
    }

    if (!['doctor', 'nurse'].includes(role)) {
        return { ok: false, code: 400, message: 'role phải là doctor hoặc nurse' };
    }

    // Find all schedules for that day
    const query = { dayOfWeek };
    const populateField = role === 'doctor' ? 'doctorId' : 'labNurseId';

    const schedules = await WorkSchedule.find(query)
        .populate(populateField, 'fullName specialty')
        .lean();

    // Filter to those working at specified time
    const available = schedules.filter(schedule => {
        return timeIsBetween(time, schedule.shiftStart, schedule.shiftEnd);
    });

    // Extract staff info
    const staffList = available
        .map(s => s[populateField])
        .filter(staff => staff !== null);

    // Remove duplicates
    const uniqueStaff = Array.from(
        new Map(staffList.map(s => [s._id.toString(), s])).values()
    );

    return {
        ok: true,
        data: uniqueStaff
    };
}

module.exports = {
    createWorkSchedule,
    getDoctorSchedule,
    getNurseSchedule,
    updateWorkSchedule,
    deleteWorkSchedule,
    findAvailableStaff
};
