const { mongoose } = require('./mongoose');

const AppointmentSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
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
        required: false,
        index: true
    },
    appointmentDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: [
            'pending',
            'confirmed',
            'cancelled'
        ],
        default: 'pending',
        index: true
    },
    note: {
        type: String
    }
}, {
    collection: 'appointments',
    timestamps: true
});

module.exports = mongoose.model('Appointment', AppointmentSchema);


