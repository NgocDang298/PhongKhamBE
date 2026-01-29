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
    // phone, email, cccd đã được lưu trong User model
    dob: {
        type: Date
    }
}, {
    collection: 'staffs',
    timestamps: true
});

module.exports = mongoose.model('Staff', StaffSchema);


