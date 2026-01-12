const { mongoose } = require('./mongoose');

const PatientSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false, // Optional - cho phép tạo patient walk-in không cần tài khoản
        index: true
    },
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other'],
        required: true
    },
    dateOfBirth: {
        type: Date,
        required: true
    },
    address: {
        type: String
    },
    phone: {
        type: String,
        required: true
    },

    emergencyPhone: {
        type: String,
        trim: true,
        default: null 
    },

    email: {
        type: String,
        trim: true,
        lowercase: true,
        default: null,
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    
    cccd: {
        type: String,
        required: true,
        unique: true
    },
    registerDate: {
        type: Date,
        default: Date.now
    },
    medicalHistory: [
        {
            type: String,
            trim: true
        }
    ]
}, {
    collection: 'patients',
    timestamps: true
});

module.exports = mongoose.model('Patient', PatientSchema);
