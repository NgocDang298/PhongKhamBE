const { mongoose } = require('./mongoose');

const ExaminationSchema = new mongoose.Schema({
    appointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
        required: true,
        index: true
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true,
        index: true
    },
    staffId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff',
        required: true,
        index: true
    },
    serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
        required: true,
        index: true
    },
    previousExamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Examination',
        index: true
    },
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true,
        index: true
    },
    examDate: {
        type: Date,
        default: Date.now
    },
    diagnosis: {
        type: String
    },
    resultSummary: {
        type: String
    },
    treatment: {
        type: String
    },
    doctorNote: {
        type: String
    },
    status: {
        type: String,
        enum: [
            'done',
            'processing'
        ],
        default: 'processing'
    }
}, {
    collection: 'examinations',
    timestamps: true
});

module.exports = mongoose.model('Examination', ExaminationSchema);


