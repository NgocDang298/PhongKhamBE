# 📝 HƯỚNG DẪN API ĐĂNG KÝ TÀI KHOẢN

## 🎯 Tổng quan

API đăng ký tự động tạo **User** và **Profile** tương ứng (Patient, Doctor, Staff, LabNurse) trong một transaction.

---

## 📍 Endpoint

```
POST /auth/register
```

---

## 1️⃣ ĐĂNG KÝ PATIENT (Bệnh nhân)

### Request Body
```json
{
  "username": "patient123",
  "password": "password123",
  "fullName": "Nguyễn Văn A",
  "email": "patient@example.com",
  "phone": "0901234567",
  "gender": "male",
  "dateOfBirth": "1990-01-15",
  "address": "123 Đường ABC, Quận 1, TP.HCM",
  "role": "patient",
  "cccd": "001234567890"
}
```

### Required Fields
- ✅ `username` - Tên đăng nhập (unique)
- ✅ `password` - Mật khẩu (min 6 ký tự)
- ✅ `fullName` - Họ tên đầy đủ
- ✅ `email` - Email (unique)
- ✅ `phone` - Số điện thoại
- ✅ `gender` - Giới tính (`male`, `female`, `other`)
- ✅ `dateOfBirth` - Ngày sinh
- ✅ `role` - Vai trò = `"patient"`
- ✅ `cccd` - Số CMND/CCCD (unique)

### Response Success
```json
{
  "status": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "username": "patient123",
      "fullName": "Nguyễn Văn A",
      "email": "patient@example.com",
      "phone": "0901234567",
      "gender": "male",
      "dateOfBirth": "1990-01-15T00:00:00.000Z",
      "address": "123 Đường ABC, Quận 1, TP.HCM",
      "role": "patient",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "profile": {
      "_id": "507f1f77bcf86cd799439012",
      "userId": "507f1f77bcf86cd799439011",
      "fullName": "Nguyễn Văn A",
      "gender": "male",
      "dateOfBirth": "1990-01-15T00:00:00.000Z",
      "address": "123 Đường ABC, Quận 1, TP.HCM",
      "phone": "0901234567",
      "cccd": "001234567890",
      "registerDate": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

---

## 2️⃣ ĐĂNG KÝ DOCTOR (Bác sĩ)

### Request Body
```json
{
  "username": "doctor123",
  "password": "password123",
  "fullName": "Bác sĩ Trần Thị B",
  "email": "doctor@example.com",
  "phone": "0912345678",
  "gender": "female",
  "dateOfBirth": "1985-05-20",
  "address": "456 Đường XYZ, Quận 3, TP.HCM",
  "role": "doctor",
  "specialty": "Nội khoa",
  "degree": "Tiến sĩ",
  "birthYear": 1985,
  "workExperience": 10
}
```

### Required Fields
- ✅ `username`, `password`, `fullName`, `email` - Bắt buộc
- ✅ `role` - Vai trò = `"doctor"`
- ✅ `specialty` - Chuyên khoa (VD: "Nội khoa", "Ngoại khoa", "Tim mạch")

### Optional Fields
- `degree` - Học vị (VD: "Thạc sĩ", "Tiến sĩ")
- `birthYear` - Năm sinh
- `workExperience` - Số năm kinh nghiệm (default: 0)
- `phone`, `gender`, `dateOfBirth`, `address`

### Response Success
```json
{
  "status": true,
  "data": {
    "token": "...",
    "user": { ... },
    "profile": {
      "_id": "...",
      "userId": "...",
      "fullName": "Bác sĩ Trần Thị B",
      "specialty": "Nội khoa",
      "degree": "Tiến sĩ",
      "email": "doctor@example.com",
      "birthYear": 1985,
      "workExperience": 10,
      "status": "active"
    }
  }
}
```

---

## 3️⃣ ĐĂNG KÝ STAFF (Nhân viên)

### Request Body
```json
{
  "username": "staff123",
  "password": "password123",
  "fullName": "Lê Văn C",
  "email": "staff@example.com",
  "phone": "0923456789",
  "dateOfBirth": "1992-08-10",
  "role": "staff",
  "cccd": "002345678901"
}
```

### Required Fields
- ✅ `username`, `password`, `fullName`, `email` - Bắt buộc
- ✅ `role` - Vai trò = `"staff"`

### Optional Fields
- `phone`, `dateOfBirth`, `cccd`

---

## 4️⃣ ĐĂNG KÝ LAB_NURSE (Y tá xét nghiệm)

### Request Body
```json
{
  "username": "nurse123",
  "password": "password123",
  "fullName": "Phạm Thị D",
  "email": "nurse@example.com",
  "phone": "0934567890",
  "dateOfBirth": "1995-03-25",
  "role": "lab_nurse",
  "cccd": "003456789012"
}
```

### Required Fields
- ✅ `username`, `password`, `fullName`, `email` - Bắt buộc
- ✅ `role` - Vai trò = `"lab_nurse"`

### Optional Fields
- `phone`, `dateOfBirth`, `cccd`

---

## 5️⃣ ĐĂNG KÝ ADMIN

### Request Body
```json
{
  "username": "admin123",
  "password": "password123",
  "fullName": "Admin User",
  "email": "admin@example.com",
  "role": "admin"
}
```

### Required Fields
- ✅ `username`, `password`, `fullName`, `email` - Bắt buộc
- ✅ `role` - Vai trò = `"admin"`

**Lưu ý**: Admin không tạo profile riêng, chỉ có User account.

---

## ❌ Error Responses

### 1. Missing Required Fields
```json
{
  "status": false,
  "message": "username, password, fullName and email are required"
}
```

### 2. Invalid Role
```json
{
  "status": false,
  "message": "role must be one of: patient, doctor, staff, lab_nurse, admin"
}
```

### 3. Username Already Exists
```json
{
  "status": false,
  "message": "Username already exists"
}
```

### 4. Email Already Exists
```json
{
  "status": false,
  "message": "Email already exists"
}
```

### 5. CCCD Already Exists (Patient)
```json
{
  "status": false,
  "message": "CCCD already exists"
}
```

### 6. Missing Role-Specific Fields
```json
{
  "status": false,
  "message": "Patient requires: cccd, phone, gender, dateOfBirth"
}
```

```json
{
  "status": false,
  "message": "Doctor requires: specialty"
}
```

---

## 🔐 Sau khi đăng ký

1. **Token được tạo tự động** - Sử dụng token này để authenticate các request tiếp theo
2. **User và Profile được tạo** - Kiểm tra trong database:
   - Collection `users` - Tài khoản user
   - Collection `patients` / `doctors` / `staffs` / `labnurses` - Profile tương ứng

3. **Sử dụng token**:
```
Authorization: Bearer <token>
```

---

## 📊 Database Collections

| Role | User Collection | Profile Collection |
|------|----------------|-------------------|
| patient | ✅ users | ✅ patients |
| doctor | ✅ users | ✅ doctors |
| staff | ✅ users | ✅ staffs |
| lab_nurse | ✅ users | ✅ labnurses |
| admin | ✅ users | ❌ (no profile) |

---

## 🧪 Test với Postman/Thunder Client

### 1. Đăng ký Patient
```bash
POST http://localhost:3000/auth/register
Content-Type: application/json

{
  "username": "patient_test",
  "password": "123456",
  "fullName": "Test Patient",
  "email": "patient_test@test.com",
  "phone": "0901111111",
  "gender": "male",
  "dateOfBirth": "1990-01-01",
  "role": "patient",
  "cccd": "001111111111"
}
```

### 2. Đăng ký Doctor
```bash
POST http://localhost:3000/auth/register
Content-Type: application/json

{
  "username": "doctor_test",
  "password": "123456",
  "fullName": "Test Doctor",
  "email": "doctor_test@test.com",
  "role": "doctor",
  "specialty": "Nội khoa"
}
```

---

## ✅ Checklist

- [x] Tạo User account
- [x] Tạo Profile tương ứng (Patient/Doctor/Staff/LabNurse)
- [x] Validate required fields theo role
- [x] Check duplicate username/email/cccd
- [x] Hash password tự động
- [x] Generate JWT token
- [x] Return user + profile data
- [x] Rollback nếu có lỗi

