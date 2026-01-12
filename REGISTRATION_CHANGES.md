# 🔒 THAY ĐỔI QUAN TRỌNG VỀ ĐĂNG KÝ TÀI KHOẢN

## ✅ Đã Hoàn Thành

### 1. **Chỉ Admin Mới Đăng Ký Được Tài Khoản Nhân Viên**

#### Trước:
```javascript
POST /auth/register
// Ai cũng có thể đăng ký bất kỳ role nào
```

#### Sau:
```javascript
// Bệnh nhân tự đăng ký (Public)
POST /auth/register/patient
Body: { password, fullName, email, phone, gender, dateOfBirth, address, cccd }

// Admin đăng ký cho nhân viên (Admin only)
POST /auth/register
Auth: Required (Admin only)
Body: { 
  password, fullName, email, phone, cccd, role,
  // Nếu role = doctor: specialty (required), degree, birthYear, workExperience
  // Nếu role = staff: cccd
  // Nếu role = lab_nurse: cccd
}
```

**Phân quyền:**
- ✅ **Bệnh nhân**: Tự đăng ký qua `/auth/register/patient` (không cần đăng nhập)
- ✅ **Doctor, Staff, Lab Nurse**: Chỉ Admin mới đăng ký được qua `/auth/register`

---

### 2. **Email và Số Điện Thoại Không Được Trùng**

#### Cập nhật User Model:
```javascript
// src/models/User.js
email: {
    type: String,
    unique: true,      // ← Thêm unique constraint
    sparse: true,      // Cho phép null nhưng unique nếu có giá trị
    ...
},
sdt: {
    type: String,
    unique: true,      // ← Thêm unique constraint
    sparse: true,      // Cho phép null nhưng unique nếu có giá trị
    ...
}
```

#### Validation trong authService:
```javascript
// Kiểm tra email trùng
if (email) {
    const existingUserEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingUserEmail) {
        return { ok: false, code: 409, message: 'Email đã được sử dụng' };
    }
}

// Kiểm tra số điện thoại trùng
if (phoneNumber) {
    const existingUserPhone = await User.findOne({ sdt: phoneNumber });
    if (existingUserPhone) {
        return { ok: false, code: 409, message: 'Số điện thoại đã được sử dụng' };
    }
}

// Kiểm tra CCCD trùng
const existingUserCccd = await User.findOne({ cccd });
if (existingUserCccd) {
    return { ok: false, code: 409, message: 'CCCD đã được sử dụng' };
}
```

**Áp dụng cho:**
- ✅ `registerPatient`
- ✅ `registerDoctor`
- ✅ `registerStaff`
- ✅ `registerLabNurse`

---

## 📋 Files Đã Thay Đổi

### 1. `src/models/User.js`
- Thêm `unique: true` cho `email`
- Thêm `unique: true` và `sparse: true` cho `sdt`

### 2. `src/services/authService.js`
- Thêm validation kiểm tra số điện thoại trùng trong tất cả hàm register
- Giữ nguyên validation email và CCCD

### 3. `src/routes/auth.js`
- Tách route đăng ký:
  - `POST /auth/register/patient` - Public (bệnh nhân tự đăng ký)
  - `POST /auth/register` - Admin only (đăng ký nhân viên)
- Thêm `authorize(['admin'])` cho route `/auth/register`

### 4. `src/controllers/auth.js`
- Thêm hàm `registerPatient` cho public registration
- Cập nhật hàm `register` để chỉ cho phép role: doctor, staff, lab_nurse
- Reject nếu cố đăng ký patient qua `/auth/register`

---

## 🧪 Testing

### Test 1: Bệnh nhân tự đăng ký
```bash
POST /auth/register/patient
{
  "password": "123456",
  "fullName": "Nguyễn Văn A",
  "email": "patient@example.com",
  "phone": "0987654321",
  "gender": "male",
  "dateOfBirth": "1990-01-01",
  "address": "123 ABC",
  "cccd": "001234567890"
}

# Expected: Success (không cần đăng nhập)
```

### Test 2: Admin đăng ký bác sĩ
```bash
POST /auth/register
Headers: Authorization: Bearer <admin_token>
{
  "password": "123456",
  "fullName": "BS. Trần Văn B",
  "email": "doctor@example.com",
  "phone": "0912345678",
  "cccd": "001234567891",
  "role": "doctor",
  "specialty": "Nội khoa",
  "degree": "Thạc sĩ"
}

# Expected: Success (admin đã đăng nhập)
```

### Test 3: Staff cố đăng ký bác sĩ
```bash
POST /auth/register
Headers: Authorization: Bearer <staff_token>
{
  "role": "doctor",
  ...
}

# Expected: 403 Forbidden
```

### Test 4: Email trùng
```bash
POST /auth/register/patient
{
  "email": "patient@example.com",  // Email đã tồn tại
  ...
}

# Expected: 409 Conflict - "Email đã được sử dụng"
```

### Test 5: Số điện thoại trùng
```bash
POST /auth/register/patient
{
  "phone": "0987654321",  // SĐT đã tồn tại
  ...
}

# Expected: 409 Conflict - "Số điện thoại đã được sử dụng"
```

### Test 6: CCCD trùng
```bash
POST /auth/register/patient
{
  "cccd": "001234567890",  // CCCD đã tồn tại
  ...
}

# Expected: 409 Conflict - "CCCD đã được sử dụng"
```

---

## ⚠️ Breaking Changes

### 1. Route Đăng Ký Bệnh Nhân Đã Thay Đổi
**Trước:**
```javascript
POST /auth/register
{ role: "patient", ... }
```

**Sau:**
```javascript
POST /auth/register/patient
{ ... }  // Không cần truyền role
```

### 2. Đăng Ký Nhân Viên Yêu Cầu Admin
**Trước:**
```javascript
POST /auth/register
{ role: "doctor", ... }  // Ai cũng đăng ký được
```

**Sau:**
```javascript
POST /auth/register
Headers: Authorization: Bearer <admin_token>
{ role: "doctor", ... }  // Chỉ admin mới đăng ký được
```

---

## 🔄 Migration Notes

### Nếu đã có dữ liệu trong database:

1. **Kiểm tra email trùng:**
```javascript
db.users.aggregate([
  { $group: { _id: "$email", count: { $sum: 1 } } },
  { $match: { count: { $gt: 1 } } }
])
```

2. **Kiểm tra sdt trùng:**
```javascript
db.users.aggregate([
  { $group: { _id: "$sdt", count: { $sum: 1 } } },
  { $match: { count: { $gt: 1 } } }
])
```

3. **Tạo unique index:**
```javascript
db.users.createIndex({ email: 1 }, { unique: true, sparse: true })
db.users.createIndex({ sdt: 1 }, { unique: true, sparse: true })
```

---

## 📊 Tổng Kết

| Thay Đổi | Trước | Sau |
|----------|-------|-----|
| **Đăng ký bệnh nhân** | `/auth/register` (public) | `/auth/register/patient` (public) |
| **Đăng ký nhân viên** | `/auth/register` (public) | `/auth/register` (admin only) |
| **Email unique** | ❌ Không | ✅ Có |
| **SĐT unique** | ❌ Không | ✅ Có |
| **CCCD unique** | ✅ Có | ✅ Có |

---

## ✅ Checklist

- [x] Thêm unique constraint cho email và sdt trong User model
- [x] Thêm validation kiểm tra sdt trùng trong authService
- [x] Tách route đăng ký patient ra riêng
- [x] Thêm authorization admin cho route đăng ký nhân viên
- [x] Cập nhật controller để xử lý 2 route riêng biệt
- [x] Tạo tài liệu hướng dẫn

---

**Lưu ý:** Sau khi deploy, cần thông báo cho frontend team về thay đổi endpoint đăng ký bệnh nhân!
