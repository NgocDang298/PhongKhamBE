const { mongoose } = require('./mongoose');

const LabNurseSchema = new mongoose.Schema({
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
    gender: {
        type: String,
        enum: ['male', 'female', 'other']
    },
    dateOfBirth: {
        type: Date
    },
    address: {
        type: String
    },
    // email, phone, cccd đã được lưu trong User model
    dob: {
        type: Date
    }
}, {
    collection: 'labnurses',
    timestamps: true
});

module.exports = mongoose.model('LabNurse', LabNurseSchema);