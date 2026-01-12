# THUYẾT TRÌNH: CHỨC NĂNG ĐĂNG NHẬP VÀ ĐĂNG KÝ
## Hệ thống Quản lý Bệnh viện

---

## 📋 MỤC LỤC

1. [Tổng quan hệ thống](#tổng-quan-hệ-thống)
2. [Kiến trúc Authentication](#kiến-trúc-authentication)
3. [Chức năng Đăng ký](#chức-năng-đăng-ký)
4. [Chức năng Đăng nhập](#chức-năng-đăng-nhập)
5. [Bảo mật và Xác thực](#bảo-mật-và-xác-thực)
6. [Quản lý Token](#quản-lý-token)
7. [Demo và Code](#demo-và-code)
8. [Kết luận](#kết-luận)

---

## 🏥 TỔNG QUAN HỆ THỐNG

### Mục tiêu
- Xây dựng hệ thống authentication an toàn cho ứng dụng quản lý bệnh viện
- Hỗ trợ nhiều vai trò người dùng: Patient, Doctor, Staff, Lab Nurse, Admin
- Đảm bảo bảo mật cao với mã hóa mật khẩu và JWT tokens

### Công nghệ sử dụng
- **Backend**: Node.js + Express.js
- **Database**: MongoDB với Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Architecture**: MVC Pattern

---

## 🏗️ KIẾN TRÚC AUTHENTICATION

### Cấu trúc thư mục
```
src/
├── controllers/auth.js      # Xử lý HTTP requests
├── services/authService.js  # Business logic
├── middleware/auth.js       # Authentication middleware
├── models/User.js          # User data model
└── routes/auth.js          # API routes
```

### Luồng xử lý
```
Client Request → Routes → Controllers → Services → Models → Database
                ↓
            Middleware (Authentication/Authorization)
```

---

## 📝 CHỨC NĂNG ĐĂNG KÝ

### API Endpoint
```
POST /auth/register
```

### Request Body
```json
{
  "username": "patient123",
  "password": "password123"
}
```

### Quy trình đăng ký

#### 1. Validation đầu vào
```javascript
if (!username || !password) {
    return { ok: false, code: 400, message: 'username and password are required' };
}
```

#### 2. Kiểm tra username đã tồn tại
```javascript
const existing = await User.findOne({ username }).lean();
if (existing) {
    return { ok: false, code: 409, message: 'Username already exists' };
}
```

#### 3. Tạo user mới với role mặc định
```javascript
const user = await User.create({ 
    username, 
    password, 
    role: 'patient' 
});
```

#### 4. Tạo JWT token
```javascript
const token = await user.generateAuthToken();
```

### Response thành công
```json
{
  "status": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "username": "patient123",
      "role": "patient",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

---

## 🔐 CHỨC NĂNG ĐĂNG NHẬP

### API Endpoint
```
POST /auth/login
```

### Request Body
```json
{
  "username": "patient123",
  "password": "password123"
}
```

### Quy trình đăng nhập

#### 1. Validation đầu vào
```javascript
if (!username || !password) {
    return { ok: false, code: 400, message: 'username and password are required' };
}
```

#### 2. Xác thực thông tin đăng nhập
```javascript
const user = await User.findByCredentials(username, password);
```

#### 3. Tạo token mới
```javascript
const token = await user.generateAuthToken();
```

### Static Method: findByCredentials
```javascript
UserSchema.statics.findByCredentials = async (username, password) => {
    const user = await User.findOne({ username });
    if (!user) {
        throw new Error('Invalid login credentials');
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
        throw new Error('Invalid login credentials');
    }
    return user;
};
```

### Response thành công
```json
{
  "status": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "patient123",
    "role": "patient"
  }
}
```

---

## 🛡️ BẢO MẬT VÀ XÁC THỰC

### 1. Mã hóa mật khẩu với bcrypt

#### Pre-save Hook
```javascript
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
```

#### So sánh mật khẩu
```javascript
UserSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};
```

### 2. JWT Token Management

#### Tạo token
```javascript
UserSchema.methods.generateAuthToken = async function () {
    const user = this;
    const token = jwt.sign({ _id: user._id }, process.env.JWT_KEY || process.env.SECRET);
    user.tokens = user.tokens.concat({ token });
    await user.save();
    return token;
};
```

#### Xác thực token
```javascript
async authenticate(req, res, next) {
    const token = getTokenFromRequest(req);
    if (!token) return res.status(401).json({ status: false, message: 'Unauthorized' });

    try {
        const payload = jwt.verify(token, SECRET);
        const user = await User.findById(payload._id);
        if (!user) return res.status(401).json({ status: false, message: 'User not found' });

        req.user = user;
        req.token = token;
        return next();
    } catch (err) {
        return res.status(401).json({ status: false, message: 'Invalid token' });
    }
}
```

### 3. User Model Schema

```javascript
const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 50
    },
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
```

---

## 🔑 QUẢN LÝ TOKEN

### 1. Lưu trữ Token
- Mỗi user có thể có nhiều tokens (đăng nhập từ nhiều thiết bị)
- Tokens được lưu trong array `tokens` của user

### 2. Đăng xuất (Logout)
```javascript
async logout(userId, token) {
    try {
        const user = await User.findById(userId);
        if (!user) {
            return { ok: false, code: 404, message: 'User not found' };
        }

        // Remove the specific token from user's tokens array
        user.tokens = user.tokens.filter(t => t.token !== token);
        await user.save();

        return { ok: true, message: 'Logged out successfully' };
    } catch (error) {
        return { ok: false, code: 500, message: 'Internal server error' };
    }
}
```

### 3. Đổi mật khẩu
```javascript
async changePassword(userId, { currentPassword, newPassword }) {
    // Validation
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

        // Verify current password
        const isCurrentPasswordValid = await user.comparePassword(currentPassword);
        if (!isCurrentPasswordValid) {
            return { ok: false, code: 400, message: 'Current password is incorrect' };
        }

        // Update password
        user.password = newPassword;
        await user.save();

        return { ok: true, message: 'Password changed successfully' };
    } catch (error) {
        return { ok: false, code: 500, message: 'Internal server error' };
    }
}
```

---

## 🎯 DEMO VÀ CODE

### 1. Đăng ký người dùng mới

#### Request
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newpatient",
    "password": "securepass123"
  }'
```

#### Response
```json
{
  "status": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "username": "newpatient",
      "role": "patient",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

### 2. Đăng nhập

#### Request
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newpatient",
    "password": "securepass123"
  }'
```

#### Response
```json
{
  "status": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "newpatient",
    "role": "patient"
  }
}
```

### 3. Sử dụng token để truy cập API bảo mật

#### Request
```bash
curl -X GET http://localhost:3000/api/protected-route \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 4. Đăng xuất

#### Request
```bash
curl -X POST http://localhost:3000/auth/logout \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### Response
```json
{
  "status": true,
  "message": "Logged out successfully"
}
```

---

## 📊 SƠ ĐỒ LUỒNG XỬ LÝ

### Luồng đăng ký
```
Client → POST /auth/register → Controller → Service → Model → Database
  ↓
Validation → Check existing → Hash password → Create user → Generate token
  ↓
Response with token and user info
```

### Luồng đăng nhập
```
Client → POST /auth/login → Controller → Service → Model → Database
  ↓
Validation → Find user → Compare password → Generate token
  ↓
Response with token and user info
```

### Luồng xác thực
```
Client → Protected Route → Middleware → Verify token → Extract user → Next()
  ↓
JWT verification → User lookup → Attach to request
```

---

## 🔒 CÁC BIỆN PHÁP BẢO MẬT

### 1. Password Security
- **Mã hóa**: Sử dụng bcrypt với salt rounds = 8
- **Độ dài tối thiểu**: 6 ký tự
- **Validation**: Kiểm tra đầu vào nghiêm ngặt

### 2. Token Security
- **JWT**: Sử dụng JSON Web Tokens
- **Expiration**: Token có thời hạn (có thể cấu hình)
- **Storage**: Lưu trữ an toàn trong database
- **Revocation**: Có thể thu hồi token khi logout

### 3. Input Validation
- **Required fields**: Kiểm tra các trường bắt buộc
- **Data types**: Validation kiểu dữ liệu
- **Length limits**: Giới hạn độ dài username/password
- **Unique constraints**: Username phải duy nhất

### 4. Error Handling
- **Consistent responses**: Format response thống nhất
- **Security**: Không tiết lộ thông tin nhạy cảm
- **Status codes**: Sử dụng HTTP status codes phù hợp

---

## 🎯 TÍNH NĂNG NỔI BẬT

### 1. Multi-device Support
- Một user có thể đăng nhập từ nhiều thiết bị
- Mỗi session có token riêng biệt
- Logout chỉ ảnh hưởng đến session hiện tại

### 2. Role-based Access Control
- Hỗ trợ 5 roles: patient, doctor, staff, lab_nurse, admin
- Middleware authorization linh hoạt
- Có thể mở rộng dễ dàng

### 3. Clean Architecture
- **Separation of concerns**: Controller, Service, Model tách biệt
- **Reusable components**: Middleware có thể tái sử dụng
- **Maintainable code**: Code dễ đọc và bảo trì

### 4. Comprehensive API
- **CRUD operations**: Đầy đủ các thao tác cơ bản
- **Error handling**: Xử lý lỗi toàn diện
- **Response format**: Format response nhất quán

---

## 📈 HIỆU SUẤT VÀ TỐI ƯU

### 1. Database Optimization
- **Indexing**: Username và role được index
- **Lean queries**: Sử dụng `.lean()` khi không cần Mongoose document
- **Selective fields**: Chỉ lấy các trường cần thiết

### 2. Memory Management
- **Token cleanup**: Tự động dọn dẹp token khi logout
- **Password exclusion**: Loại bỏ password khỏi JSON response
- **Efficient queries**: Tối ưu hóa database queries

### 3. Scalability
- **Stateless authentication**: JWT không cần lưu trữ trên server
- **Horizontal scaling**: Có thể scale ngang dễ dàng
- **Load balancing**: Hỗ trợ load balancer

---

## 🚀 MỞ RỘNG TRONG TƯƠNG LAI

### 1. Tính năng có thể thêm
- **Two-factor authentication (2FA)**
- **Password reset via email**
- **Social login (Google, Facebook)**
- **Refresh token mechanism**
- **Account lockout after failed attempts**

### 2. Cải tiến bảo mật
- **Rate limiting** cho login attempts
- **IP whitelisting** cho admin accounts
- **Audit logging** cho các hoạt động authentication
- **Password complexity requirements**

### 3. Monitoring và Analytics
- **Login analytics**
- **Failed login tracking**
- **User activity monitoring**
- **Security alerts**

---

## ✅ KẾT LUẬN

### Điểm mạnh của hệ thống
1. **Bảo mật cao**: Mã hóa password với bcrypt, JWT tokens
2. **Kiến trúc tốt**: MVC pattern, separation of concerns
3. **Linh hoạt**: Hỗ trợ multi-device, role-based access
4. **Dễ mở rộng**: Code structure cho phép thêm tính năng mới
5. **Error handling**: Xử lý lỗi toàn diện và nhất quán

### Các tính năng chính
- ✅ Đăng ký người dùng mới
- ✅ Đăng nhập với xác thực
- ✅ Quản lý JWT tokens
- ✅ Đăng xuất an toàn
- ✅ Đổi mật khẩu
- ✅ Middleware authentication
- ✅ Role-based authorization

### Công nghệ sử dụng
- **Node.js + Express.js**: Backend framework
- **MongoDB + Mongoose**: Database và ODM
- **JWT**: Token-based authentication
- **bcryptjs**: Password hashing
- **RESTful API**: API design pattern

---

## 🙏 CẢM ƠN!

**Hệ thống Authentication đã được thiết kế với tiêu chí:**
- 🔒 **Bảo mật cao**
- 🚀 **Hiệu suất tốt**
- 🔧 **Dễ bảo trì**
- 📈 **Có thể mở rộng**

**Questions & Answers**

---

*Thuyết trình được chuẩn bị bởi: [Tên sinh viên]*  
*Ngày: [Ngày thuyết trình]*  
*Môn học: [Tên môn học]*
