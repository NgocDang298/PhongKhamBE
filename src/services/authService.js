const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { SECRET } = require('../config');
const { User, Patient, Doctor, Staff, LabNurse } = require('../models');

function signToken(payload) {
    return jwt.sign(payload, SECRET, { expiresIn: '7d' });
}

// Phương thức tạo token xác thực
async function generateAuthToken(user) {
    const token = jwt.sign({ _id: user._id }, process.env.JWT_KEY || SECRET);
    user.tokens = user.tokens.concat({ token });
    await user.save();
    return token;
}

// Phương thức tìm kiếm theo thông tin đăng nhập (sử dụng CCCD)
async function findByCredentials(cccd, password) {
    const user = await User.findOne({ cccd });
    if (!user) {
        throw new Error('Invalid login credentials');
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
        throw new Error('Invalid login credentials');
    }
    return user;
}

module.exports = {
    /**
     * General register function - routes to specific register functions based on role
     * For patient: calls registerPatient
     * For doctor: calls registerDoctor
     * For staff: calls registerStaff
     * For lab_nurse: calls registerLabNurse
     */
    async register(payload) {
        const { role } = payload;

        // Route to appropriate registration function based on role
        switch (role) {
            case 'patient':
            case undefined:
            case null:
                return this.registerPatient(payload);
            case 'doctor':
                return this.registerDoctor(payload);
            case 'staff':
                return this.registerStaff(payload);
            case 'lab_nurse':
                return this.registerLabNurse(payload);
            case 'admin':
                return { ok: false, code: 403, message: 'Không thể tự đăng ký tài khoản admin' };
            default:
                return { ok: false, code: 400, message: `Role '${role}' không hợp lệ` };
        }
    },

    async registerPatient({
        password,
        email,
        sdt,
        phone,
        cccd,
        fullName,
        gender,
        dateOfBirth,
        address,
        autoGenerateCredentials = false // Cho walk-in patients
    }) {
        // Support both 'sdt' and 'phone' parameter names
        const phoneNumber = sdt || phone;

        // Validate required fields
        if (!cccd) {
            return { ok: false, code: 400, message: 'CCCD là bắt buộc' };
        }

        if (!phoneNumber) {
            return { ok: false, code: 400, message: 'Số điện thoại là bắt buộc' };
        }

        if (!password) {
            return { ok: false, code: 400, message: 'Mật khẩu là bắt buộc' };
        }

        if (!fullName) {
            return { ok: false, code: 400, message: 'Họ tên là bắt buộc' };
        }

        if (!gender) {
            return { ok: false, code: 400, message: 'Giới tính là bắt buộc' };
        }

        if (!dateOfBirth) {
            return { ok: false, code: 400, message: 'Ngày sinh là bắt buộc' };
        }

        // Validate email format (only if email is provided)
        if (email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return { ok: false, code: 400, message: 'Email không hợp lệ' };
            }
        }

        // Validate password length
        if (password.length < 6) {
            return { ok: false, code: 400, message: 'Mật khẩu phải có ít nhất 6 ký tự' };
        }

        try {
            // Check if email already exists in User collection (if provided)
            if (email) {
                const existingUserEmail = await User.findOne({ email: email.toLowerCase() }).lean();
                if (existingUserEmail) {
                    return { ok: false, code: 409, message: 'Email đã được sử dụng' };
                }
            }

            // Check if phone number already exists
            if (phoneNumber) {
                const existingUserPhone = await User.findOne({ sdt: phoneNumber }).lean();
                if (existingUserPhone) {
                    return { ok: false, code: 409, message: 'Số điện thoại đã được sử dụng' };
                }
            }

            // Check if cccd already exists in User collection
            if (cccd) {
                const existingUserCccd = await User.findOne({ cccd }).lean();
                if (existingUserCccd) {
                    return { ok: false, code: 409, message: 'CCCD đã được sử dụng' };
                }

                // Check if cccd already exists in Patient collection
                const existingPatient = await Patient.findOne({ cccd }).lean();
                if (existingPatient) {
                    return { ok: false, code: 409, message: 'CCCD đã tồn tại trong hệ thống' };
                }
            }

            // Create User account với cccd, sdt, và email
            const userData = {
                password,
                role: 'patient',
                sdt: phoneNumber,
                cccd: cccd // CCCD là bắt buộc
            };

            if (email) {
                userData.email = email.toLowerCase();
            }

            const user = await User.create(userData);

            // Create Patient profile
            const patientData = {
                userId: user._id,
                phone: phoneNumber,
                fullName: fullName, // Required field, validated above
                gender: gender, // Required field, validated above
                dateOfBirth: new Date(dateOfBirth), // Required field, validated above
                cccd: cccd // Required field, validated above
            };

            // Optional fields
            if (address) {
                patientData.address = address;
            }

            const patient = await Patient.create(patientData);

            // Generate authentication token (chỉ cho đăng ký online)
            let token = null;
            if (!autoGenerateCredentials) {
                token = await generateAuthToken(user);
            }

            const response = {
                ok: true,
                data: {
                    user: {
                        _id: user._id,
                        cccd: user.cccd,
                        role: user.role,
                        createdAt: user.createdAt
                    },
                    patient: {
                        _id: patient._id,
                        fullName: patient.fullName,
                        email: patient.email,
                        phone: patient.phone,
                        gender: patient.gender,
                        dateOfBirth: patient.dateOfBirth,
                        address: patient.address,
                        registerDate: patient.registerDate,
                        medicalHistory: patient.medicalHistory
                    }
                }
            };

            // Thêm token nếu có (đăng ký online)
            if (token) {
                response.data.token = token;
            }

            // Thêm credentials nếu là walk-in (autoGenerateCredentials = true)
            if (autoGenerateCredentials) {
                response.data.credentials = {
                    cccd: user.cccd,
                    password: password,
                    message: 'Vui lòng đổi mật khẩu sau khi đăng nhập lần đầu. Đăng nhập bằng CCCD và mật khẩu.'
                };
            }

            return response;
        } catch (error) {
            // Handle duplicate key errors
            if (error.code === 11000) {
                if (error.keyPattern && error.keyPattern.email) {
                    return { ok: false, code: 409, message: 'Email đã được sử dụng' };
                }
                if (error.keyPattern && error.keyPattern.cccd) {
                    return { ok: false, code: 409, message: 'CCCD đã được sử dụng' };
                }
            }
            return { ok: false, code: 500, message: error.message || 'Lỗi server khi đăng ký' };
        }
    },

    async registerDoctor({
        password,
        email,
        sdt,
        phone,
        cccd,
        fullName,
        specialty,
        degree,
        birthYear,
        workExperience
    }) {
        const phoneNumber = sdt || phone;

        // Validate required fields
        if (!cccd) {
            return { ok: false, code: 400, message: 'CCCD là bắt buộc' };
        }

        if (!phoneNumber) {
            return { ok: false, code: 400, message: 'Số điện thoại là bắt buộc' };
        }

        if (!password) {
            return { ok: false, code: 400, message: 'Mật khẩu là bắt buộc' };
        }

        if (!fullName) {
            return { ok: false, code: 400, message: 'Họ tên là bắt buộc' };
        }

        if (!specialty) {
            return { ok: false, code: 400, message: 'Chuyên khoa là bắt buộc' };
        }

        // Validate email format (only if email is provided)
        if (email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return { ok: false, code: 400, message: 'Email không hợp lệ' };
            }
        }

        // Validate password length
        if (password.length < 6) {
            return { ok: false, code: 400, message: 'Mật khẩu phải có ít nhất 6 ký tự' };
        }

        try {
            // Check if email already exists
            if (email) {
                const existingUserEmail = await User.findOne({ email: email.toLowerCase() }).lean();
                if (existingUserEmail) {
                    return { ok: false, code: 409, message: 'Email đã được sử dụng' };
                }
            }

            // Check if phone number already exists
            if (phoneNumber) {
                const existingUserPhone = await User.findOne({ sdt: phoneNumber }).lean();
                if (existingUserPhone) {
                    return { ok: false, code: 409, message: 'Số điện thoại đã được sử dụng' };
                }
            }

            // Check if cccd already exists
            const existingUserCccd = await User.findOne({ cccd }).lean();
            if (existingUserCccd) {
                return { ok: false, code: 409, message: 'CCCD đã được sử dụng' };
            }

            // Create User account
            const userData = {
                password,
                role: 'doctor',
                sdt: phoneNumber,
                cccd: cccd
            };

            if (email) {
                userData.email = email.toLowerCase();
            }

            const user = await User.create(userData);

            // Create Doctor profile
            const doctorData = {
                userId: user._id,
                fullName: fullName,
                specialty: specialty
            };

            // Optional fields
            if (degree) doctorData.degree = degree;
            if (birthYear) doctorData.birthYear = birthYear;
            if (workExperience) doctorData.workExperience = workExperience;

            const doctor = await Doctor.create(doctorData);

            // Generate authentication token
            const token = await generateAuthToken(user);

            return {
                ok: true,
                data: {
                    user: {
                        _id: user._id,
                        cccd: user.cccd,
                        role: user.role,
                        createdAt: user.createdAt
                    },
                    doctor: {
                        _id: doctor._id,
                        fullName: doctor.fullName,
                        specialty: doctor.specialty,
                        degree: doctor.degree,
                        birthYear: doctor.birthYear,
                        workExperience: doctor.workExperience,
                        status: doctor.status
                    },
                    token
                }
            };
        } catch (error) {
            // Handle duplicate key errors
            if (error.code === 11000) {
                if (error.keyPattern && error.keyPattern.email) {
                    return { ok: false, code: 409, message: 'Email đã được sử dụng' };
                }
                if (error.keyPattern && error.keyPattern.cccd) {
                    return { ok: false, code: 409, message: 'CCCD đã được sử dụng' };
                }
            }
            return { ok: false, code: 500, message: error.message || 'Lỗi server khi đăng ký' };
        }
    },

    async registerStaff({
        password,
        email,
        sdt,
        phone,
        cccd,
        fullName,
        dob
    }) {
        const phoneNumber = sdt || phone;

        // Validate required fields
        if (!cccd) {
            return { ok: false, code: 400, message: 'CCCD là bắt buộc' };
        }

        if (!phoneNumber) {
            return { ok: false, code: 400, message: 'Số điện thoại là bắt buộc' };
        }

        if (!password) {
            return { ok: false, code: 400, message: 'Mật khẩu là bắt buộc' };
        }

        if (!fullName) {
            return { ok: false, code: 400, message: 'Họ tên là bắt buộc' };
        }

        // Validate email format (only if email is provided)
        if (email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return { ok: false, code: 400, message: 'Email không hợp lệ' };
            }
        }

        // Validate password length
        if (password.length < 6) {
            return { ok: false, code: 400, message: 'Mật khẩu phải có ít nhất 6 ký tự' };
        }

        try {
            // Check if email already exists
            if (email) {
                const existingUserEmail = await User.findOne({ email: email.toLowerCase() }).lean();
                if (existingUserEmail) {
                    return { ok: false, code: 409, message: 'Email đã được sử dụng' };
                }
            }

            // Check if phone number already exists
            if (phoneNumber) {
                const existingUserPhone = await User.findOne({ sdt: phoneNumber }).lean();
                if (existingUserPhone) {
                    return { ok: false, code: 409, message: 'Số điện thoại đã được sử dụng' };
                }
            }

            // Check if cccd already exists
            const existingUserCccd = await User.findOne({ cccd }).lean();
            if (existingUserCccd) {
                return { ok: false, code: 409, message: 'CCCD đã được sử dụng' };
            }

            // Create User account
            const userData = {
                password,
                role: 'staff',
                sdt: phoneNumber,
                cccd: cccd
            };

            if (email) {
                userData.email = email.toLowerCase();
            }

            const user = await User.create(userData);

            // Create Staff profile
            const staffData = {
                userId: user._id,
                fullName: fullName
            };

            // Optional fields
            if (dob) staffData.dob = new Date(dob);

            const staff = await Staff.create(staffData);

            // Generate authentication token
            const token = await generateAuthToken(user);

            return {
                ok: true,
                data: {
                    user: {
                        _id: user._id,
                        cccd: user.cccd,
                        role: user.role,
                        createdAt: user.createdAt
                    },
                    staff: {
                        _id: staff._id,
                        fullName: staff.fullName,
                        dob: staff.dob
                    },
                    token
                }
            };
        } catch (error) {
            // Handle duplicate key errors
            if (error.code === 11000) {
                if (error.keyPattern && error.keyPattern.email) {
                    return { ok: false, code: 409, message: 'Email đã được sử dụng' };
                }
                if (error.keyPattern && error.keyPattern.cccd) {
                    return { ok: false, code: 409, message: 'CCCD đã được sử dụng' };
                }
            }
            return { ok: false, code: 500, message: error.message || 'Lỗi server khi đăng ký' };
        }
    },

    async registerLabNurse({
        password,
        email,
        sdt,
        phone,
        cccd,
        fullName,
        dob
    }) {
        const phoneNumber = sdt || phone;

        // Validate required fields
        if (!cccd) {
            return { ok: false, code: 400, message: 'CCCD là bắt buộc' };
        }

        if (!phoneNumber) {
            return { ok: false, code: 400, message: 'Số điện thoại là bắt buộc' };
        }

        if (!password) {
            return { ok: false, code: 400, message: 'Mật khẩu là bắt buộc' };
        }

        if (!fullName) {
            return { ok: false, code: 400, message: 'Họ tên là bắt buộc' };
        }

        // Validate email format (only if email is provided)
        if (email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return { ok: false, code: 400, message: 'Email không hợp lệ' };
            }
        }

        // Validate password length
        if (password.length < 6) {
            return { ok: false, code: 400, message: 'Mật khẩu phải có ít nhất 6 ký tự' };
        }

        try {
            // Check if email already exists
            if (email) {
                const existingUserEmail = await User.findOne({ email: email.toLowerCase() }).lean();
                if (existingUserEmail) {
                    return { ok: false, code: 409, message: 'Email đã được sử dụng' };
                }
            }

            // Check if phone number already exists
            if (phoneNumber) {
                const existingUserPhone = await User.findOne({ sdt: phoneNumber }).lean();
                if (existingUserPhone) {
                    return { ok: false, code: 409, message: 'Số điện thoại đã được sử dụng' };
                }
            }

            // Check if cccd already exists
            const existingUserCccd = await User.findOne({ cccd }).lean();
            if (existingUserCccd) {
                return { ok: false, code: 409, message: 'CCCD đã được sử dụng' };
            }

            // Create User account
            const userData = {
                password,
                role: 'lab_nurse',
                sdt: phoneNumber,
                cccd: cccd
            };

            if (email) {
                userData.email = email.toLowerCase();
            }

            const user = await User.create(userData);

            // Create LabNurse profile
            const labNurseData = {
                userId: user._id,
                fullName: fullName
            };

            // Optional fields
            if (dob) labNurseData.dob = new Date(dob);

            const labNurse = await LabNurse.create(labNurseData);

            // Generate authentication token
            const token = await generateAuthToken(user);

            return {
                ok: true,
                data: {
                    user: {
                        _id: user._id,
                        cccd: user.cccd,
                        role: user.role,
                        createdAt: user.createdAt
                    },
                    labNurse: {
                        _id: labNurse._id,
                        fullName: labNurse.fullName,
                        dob: labNurse.dob
                    },
                    token
                }
            };
        } catch (error) {
            // Handle duplicate key errors
            if (error.code === 11000) {
                if (error.keyPattern && error.keyPattern.email) {
                    return { ok: false, code: 409, message: 'Email đã được sử dụng' };
                }
                if (error.keyPattern && error.keyPattern.cccd) {
                    return { ok: false, code: 409, message: 'CCCD đã được sử dụng' };
                }
            }
            return { ok: false, code: 500, message: error.message || 'Lỗi server khi đăng ký' };
        }
    },

    async registerAdmin({
        password,
        email,
        sdt,
        phone,
        cccd
    }) {
        const phoneNumber = sdt || phone;

        // Validate required fields
        if (!cccd) {
            return { ok: false, code: 400, message: 'CCCD là bắt buộc' };
        }

        if (!phoneNumber) {
            return { ok: false, code: 400, message: 'Số điện thoại là bắt buộc' };
        }

        if (!email) {
            return { ok: false, code: 400, message: 'Email là bắt buộc' };
        }

        if (!password) {
            return { ok: false, code: 400, message: 'Mật khẩu là bắt buộc' };
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return { ok: false, code: 400, message: 'Email không hợp lệ' };
        }

        // Strong password validation for admin
        if (password.length < 8) {
            return { ok: false, code: 400, message: 'Mật khẩu admin phải có ít nhất 8 ký tự' };
        }

        // Check password complexity (at least one uppercase, one lowercase, one number)
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);

        if (!hasUpperCase || !hasLowerCase || !hasNumber) {
            return {
                ok: false,
                code: 400,
                message: 'Mật khẩu admin phải chứa ít nhất một chữ hoa, một chữ thường và một số'
            };
        }

        try {
            // Check if email already exists
            const existingUserEmail = await User.findOne({ email: email.toLowerCase() }).lean();
            if (existingUserEmail) {
                return { ok: false, code: 409, message: 'Email đã được sử dụng' };
            }

            // Check if phone number already exists
            const existingUserPhone = await User.findOne({ sdt: phoneNumber }).lean();
            if (existingUserPhone) {
                return { ok: false, code: 409, message: 'Số điện thoại đã được sử dụng' };
            }

            // Check if cccd already exists
            const existingUserCccd = await User.findOne({ cccd }).lean();
            if (existingUserCccd) {
                return { ok: false, code: 409, message: 'CCCD đã được sử dụng' };
            }

            // Create User account with admin role
            const userData = {
                password,
                role: 'admin',
                sdt: phoneNumber,
                cccd: cccd,
                email: email.toLowerCase()
            };

            const user = await User.create(userData);

            // Generate authentication token
            const token = await generateAuthToken(user);

            return {
                ok: true,
                data: {
                    user: {
                        _id: user._id,
                        cccd: user.cccd,
                        email: user.email,
                        sdt: user.sdt,
                        role: user.role,
                        createdAt: user.createdAt
                    },
                    token,
                    message: 'Tài khoản admin đã được tạo thành công. Vui lòng bảo mật thông tin đăng nhập.'
                }
            };
        } catch (error) {
            // Handle duplicate key errors
            if (error.code === 11000) {
                if (error.keyPattern && error.keyPattern.email) {
                    return { ok: false, code: 409, message: 'Email đã được sử dụng' };
                }
                if (error.keyPattern && error.keyPattern.cccd) {
                    return { ok: false, code: 409, message: 'CCCD đã được sử dụng' };
                }
                if (error.keyPattern && error.keyPattern.sdt) {
                    return { ok: false, code: 409, message: 'Số điện thoại đã được sử dụng' };
                }
            }
            return { ok: false, code: 500, message: error.message || 'Lỗi server khi tạo admin' };
        }
    },


    async login({ cccd, password }) {
        if (!cccd || !password) {
            return { ok: false, code: 400, message: 'cccd và password là bắt buộc' };
        }
        try {
            const user = await findByCredentials(cccd, password);
            const token = await generateAuthToken(user);
            return {
                ok: true,
                data: {
                    token,
                    user: {
                        _id: user._id,
                        cccd: user.cccd,
                        role: user.role,
                    }
                }
            };
        } catch (error) {
            return { ok: false, code: 401, message: 'CCCD hoặc mật khẩu không đúng' };
        }
    },

    async changePassword(userId, { currentPassword, newPassword }) {
        if (!currentPassword || !newPassword) {
            return { ok: false, code: 400, message: 'Current password and new password are required' };
        }

        if (newPassword.length < 6) {
            return { ok: false, code: 400, message: 'New password must be at least 6 characters long' };
        }

        try {
            const user = await User.findById(userId);
            if (!user) {
                return { ok: false, code: 404, message: 'User not found' };
            }

            // Xác minh mật khẩu hiện tại
            const isCurrentPasswordValid = await user.comparePassword(currentPassword);
            if (!isCurrentPasswordValid) {
                return { ok: false, code: 400, message: 'Current password is incorrect' };
            }

            // Cập nhật mật khẩu
            user.password = newPassword;
            await user.save();

            return { ok: true, message: 'Password changed successfully' };
        } catch (error) {
            return { ok: false, code: 500, message: 'Internal server error' };
        }
    },

    async logout(userId, token) {
        try {
            const user = await User.findById(userId);
            if (!user) {
                return { ok: false, code: 404, message: 'User not found' };
            }

            // Xóa token cụ thể khỏi mảng tokens của người dùng
            user.tokens = user.tokens.filter(t => t.token !== token);
            await user.save();

            return { ok: true, message: 'Logged out successfully' };
        } catch (error) {
            return { ok: false, code: 500, message: 'Internal server error' };
        }
    }
};



