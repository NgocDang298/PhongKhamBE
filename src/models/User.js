const { mongoose } = require('./mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    role: {
        type: String,
        required: true,
        enum: ['patient', 'doctor', 'staff', 'lab_nurse', 'admin'],
        index: true
    },
    cccd: {
        type: String,
        trim: true,
        unique: true,
        required: true // CCCD là bắt buộc và dùng để đăng nhập
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        sparse: true, // Cho phép null nhưng unique nếu có giá trị
        index: true
    },
    sdt: {
        type: String,
        trim: true,
        unique: true,
        sparse: true, // Cho phép null nhưng unique nếu có giá trị
        index: true
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
}, {
    collection: 'users',
    timestamps: true
});

// Mã hóa mật khẩu trước khi lưu
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(8);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});


// Phương thức so sánh mật khẩu
UserSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Loại bỏ mật khẩu và token khỏi kết quả JSON
UserSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password;
    delete user.tokens;
    return user;
};

const User = mongoose.model('User', UserSchema);

module.exports = User;