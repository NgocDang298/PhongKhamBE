const { mongoose } = require('./mongoose');

const StaffSchema = new mongoose.Schema({
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
    // phone, email, cccd đã được lưu trong User model
    dob: {
        type: Date
    }
}, {
    collection: 'staffs',
    timestamps: true
});

module.exports = mongoose.model('Staff', StaffSchema);


