const { mongoose } = require('./mongoose');

const WorkScheduleSchema = new mongoose.Schema({
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true,
        index: true
    },
    labNurseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LabNurse',
        index: true,
        default: null
    },
    dayOfWeek: {
        type: Number,
        required: true,
        min: 0,  // Chủ nhật = 0
        max: 6   // Thứ 7 = 6
    },
    shiftStart: {
        type: String,
        required: true // "HH:mm"
    },
    shiftEnd: {
        type: String,
        required: true // "HH:mm"
    },
    note: {
        type: String,
        default: ''
    }
}, {
    collection: 'workschedules',
    timestamps: true
});

// Chỉ lưu 1 ca duy nhất cho 1 bác sĩ + dayOfWeek + shiftStart/shiftEnd
WorkScheduleSchema.index({ doctorId: 1, dayOfWeek: 1, shiftStart: 1, shiftEnd: 1 }, { unique: true });

module.exports = mongoose.model('WorkSchedule', WorkScheduleSchema);
