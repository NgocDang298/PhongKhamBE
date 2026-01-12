const { mongoose } = require('./mongoose');

const DoctorSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    specialty: {
        type: String,
        required: true
    },
    degree: {
        type: String
    },
    // email đã được lưu trong User model
    birthYear: {
        type: Number
    },
    workExperience: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: [
            'active',
            'off',
            'retired'
        ],
        default: 'active'
    }
}, {
    collection: 'doctors',
    timestamps: true
});

module.exports = mongoose.model('Doctor', DoctorSchema);


