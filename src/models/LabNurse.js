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
    // email, phone, cccd đã được lưu trong User model
    dob: {
        type: Date
    }
}, {
    collection: 'labnurses',
    timestamps: true
});

module.exports = mongoose.model('LabNurse', LabNurseSchema);