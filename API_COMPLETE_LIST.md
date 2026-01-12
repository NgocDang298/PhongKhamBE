# 📚 Tổng Hợp Tất Cả API Endpoints

## Base URL
```
http://localhost:3000
```

---

## 🔐 1. AUTHENTICATION APIs

### 1.1. Đăng Ký Tài Khoản
**Endpoint:** `POST /auth/register`

**Body:**
```json
{
  "password": "string (required)",
  "fullName": "string (required)",
  "email": "string (required)",
  "phone": "string (required)",
  "gender": "male|female|other (required)",
  "dateOfBirth": "YYYY-MM-DD (required)",
  "address": "string (required)",
  "role": "patient|doctor|staff|labNurse (required)",
  
  // Nếu role = "patient":
  "cccd": "string (required - dùng để đăng nhập)",
  
  // Nếu role = "doctor":
  "specialty": "string (required)",
  "degree": "string (optional)",
  "birthYear": "number (optional)",
  "workExperience": "number (optional)",
  
  // Nếu role = "staff" hoặc "labNurse":
  "cccd": "string (optional)"
}
```

**Response Success (200):**
```json
{
  "status": true,
  "data": {
    "user": { ... },
    "profile": { ... }
  }
}
```

---

### 1.2. Đăng Nhập
**Endpoint:** `POST /auth/login`

**Body:**
```json
{
  "cccd": "string (required)",
  "password": "string (required)"
}
```

**Response Success (200):**
```json
{
  "status": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "...",
    "email": "...",
    "role": "patient",
    "fullName": "..."
  }
}
```

---

### 1.3. Đổi Mật Khẩu
**Endpoint:** `PUT /auth/change-password`

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "currentPassword": "string (required)",
  "newPassword": "string (required)"
}
```

**Response Success (200):**
```json
{
  "status": true,
  "message": "Đổi mật khẩu thành công"
}
```

---

### 1.4. Đăng Xuất
**Endpoint:** `POST /auth/logout`

**Headers:**
```
Authorization: Bearer <token>
```

**Body:** (empty)

**Response Success (200):**
```json
{
  "status": true,
  "message": "Đăng xuất thành công"
}
```

---

## 📅 2. APPOINTMENT APIs (Lịch Hẹn)

### 2.1. Tạo Lịch Hẹn
**Endpoint:** `POST /appointments`

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "doctorId": "string (optional)",
  "appointmentDate": "ISO 8601 datetime (required)",
  "note": "string (optional)",
  
  // Nếu staff/admin tạo cho bệnh nhân:
  "patientId": "string (required nếu không phải patient tự tạo)"
}
```

**Response Success (200):**
```json
{
  "status": true,
  "data": {
    "_id": "...",
    "patientId": "...",
    "doctorId": "...",
    "appointmentDate": "...",
    "status": "pending",
    "note": "..."
  }
}
```

---

### 2.2. Danh Sách Lịch Hẹn
**Endpoint:** `GET /appointments`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Params:**
```
status=pending|confirmed|cancelled (optional)
```

**Response Success (200):**
```json
{
  "status": true,
  "data": [
    {
      "_id": "...",
      "patientId": { ... },
      "doctorId": { ... },
      "appointmentDate": "...",
      "status": "confirmed",
      "note": "..."
    }
  ]
}
```

---

### 2.3. Lấy Slots Có Sẵn
**Endpoint:** `GET /appointments/slots`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Params:**
```
date=YYYY-MM-DD (required)
doctorId=string (optional)
```

**Response Success (200):**
```json
{
  "status": true,
  "data": [
    {
      "time": "2025-12-03T08:00",
      "doctorId": "..."
    },
    {
      "time": "2025-12-03T08:30",
      "doctorId": "..."
    }
  ]
}
```

---

### 2.4. Xác Nhận Lịch Hẹn (Staff/Admin Only)
**Endpoint:** `POST /appointments/:id/confirm`

**Headers:**
```
Authorization: Bearer <token>
```

**Body:** (empty)

**Response Success (200):**
```json
{
  "status": true,
  "message": "Xác nhận lịch hẹn thành công",
  "data": { ... }
}
```

---

### 2.5. Hủy Lịch Hẹn
**Endpoint:** `POST /appointments/:id/cancel`

**Headers:**
```
Authorization: Bearer <token>
```

**Body:** (empty)

**Response Success (200):**
```json
{
  "status": true,
  "message": "Hủy lịch hẹn thành công",
  "data": { ... },
  "suggestedSlots": [ ... ] // optional
}
```

---

### 2.6. Từ Chối Lịch Hẹn (Staff/Admin Only)
**Endpoint:** `POST /appointments/:id/reject`

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "reason": "string (optional)"
}
```

**Response Success (200):**
```json
{
  "status": true,
  "message": "Từ chối lịch hẹn thành công",
  "data": { ... },
  "suggestedSlots": [ ... ]
}
```

---

### 2.7. Lấy Slots Gợi Ý Thay Thế
**Endpoint:** `GET /appointments/:id/suggested-slots`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Params:**
```
limit=number (optional, default: 5)
```

**Response Success (200):**
```json
{
  "status": true,
  "data": [
    {
      "time": "2025-12-04T08:00",
      "doctorId": "..."
    }
  ]
}
```

---

### 2.8. Danh Sách Bác Sĩ
**Endpoint:** `GET /appointments/doctors`

**Headers:**
```
Authorization: Bearer <token>
```

**Body:** (empty)

**Response Success (200):**
```json
{
  "status": true,
  "data": [
    {
      "_id": "...",
      "fullName": "BS. Nguyễn Văn A",
      "specialty": "Nội khoa"
    }
  ]
}
```

---

### 2.9. Ngày Trống Theo Bác Sĩ
**Endpoint:** `GET /appointments/doctors/available-dates`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Params:**
```
doctorId=string (required)
```

**Response Success (200):**
```json
{
  "status": true,
  "data": [
    "2025-12-03",
    "2025-12-04",
    "2025-12-05"
  ]
}
```

---

### 2.10. Slots Trống Theo Bác Sĩ và Ngày
**Endpoint:** `GET /appointments/doctors/available-slots`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Params:**
```
doctorId=string (required)
date=YYYY-MM-DD (required)
```

**Response Success (200):**
```json
{
  "status": true,
  "data": [
    {
      "time": "2025-12-03T08:00",
      "doctorId": "..."
    }
  ]
}
```

---

### 2.11. Tạo Lịch Hẹn Theo Bác Sĩ
**Endpoint:** `POST /appointments/doctors`

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "doctorId": "string (required)",
  "appointmentDate": "ISO 8601 datetime (required)",
  "note": "string (optional)",
  
  // Nếu staff/admin tạo cho bệnh nhân:
  "patientId": "string (required nếu không phải patient)"
}
```

**Response Success (200):**
```json
{
  "status": true,
  "data": { ... }
}
```

---

## 👥 3. DIRECTORY APIs (Danh Mục)

### 3.1. Tạo Bệnh Nhân Walk-in (Staff/Admin Only)
**Endpoint:** `POST /patients`

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "fullName": "string (required)",
  "gender": "male|female|other (required)",
  "dateOfBirth": "YYYY-MM-DD (required)",
  "address": "string (required)",
  "phone": "string (required)",
  "cccd": "string (required)",
  "email": "string (optional)",
  "password": "string (optional - nếu không có sẽ tự tạo)"
}
```

**Response Success (201):**
```json
{
  "status": true,
  "message": "Tạo hồ sơ bệnh nhân thành công",
  "data": {
    "user": { ... },
    "patient": { ... }
  }
}
```

---

### 3.2. Danh Sách Bệnh Nhân (Staff/Admin Only)
**Endpoint:** `GET /patients`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Params:**
```
search=string (optional - tìm theo tên, CCCD, hoặc số điện thoại)
```

**Response Success (200):**
```json
{
  "status": true,
  "data": [
    {
      "_id": "...",
      "fullName": "...",
      "phone": "...",
      "cccd": "...",
      "gender": "...",
      "dateOfBirth": "..."
    }
  ]
}
```

---

### 3.3. Danh Sách Bác Sĩ (Staff/Admin Only)
**Endpoint:** `GET /doctors`

**Headers:**
```
Authorization: Bearer <token>
```

**Body:** (empty)

**Response Success (200):**
```json
{
  "status": true,
  "data": [
    {
      "_id": "...",
      "fullName": "BS. Nguyễn Văn A",
      "specialty": "Nội khoa",
      "userId": "..."
    }
  ]
}
```

---

### 3.4. Danh Sách Nhân Viên (Staff/Admin Only)
**Endpoint:** `GET /staffs`

**Headers:**
```
Authorization: Bearer <token>
```

**Body:** (empty)

**Response Success (200):**
```json
{
  "status": true,
  "data": [
    {
      "_id": "...",
      "fullName": "Trần Thị B",
      "userId": "..."
    }
  ]
}
```

---

### 3.5. Danh Sách Y Tá (Staff/Admin Only)
**Endpoint:** `GET /nurses`

**Headers:**
```
Authorization: Bearer <token>
```

**Body:** (empty)

**Response Success (200):**
```json
{
  "status": true,
  "data": [
    {
      "_id": "...",
      "fullName": "Lê Thị C",
      "userId": "..."
    }
  ]
}
```

---

## 📋 4. MEDICAL PROFILE APIs (Hồ Sơ Khám Bệnh)

### 4.1. Tạo/Lấy Hồ Sơ Khám Bệnh (Patient)
**Endpoint:** `POST /medical-profile`

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "bloodType": "A|B|AB|O (optional)",
  "allergies": ["string"] (optional),
  "chronicDiseases": ["string"] (optional),
  "medications": ["string"] (optional),
  "surgeries": ["string"] (optional),
  "familyHistory": ["string"] (optional),
  "notes": "string (optional)"
}
```

**Response Success (200 or 201):**
```json
{
  "status": true,
  "data": {
    "_id": "...",
    "patientId": "...",
    "bloodType": "A",
    "allergies": ["Penicillin"],
    "chronicDiseases": [],
    "medications": [],
    "surgeries": [],
    "familyHistory": [],
    "notes": ""
  }
}
```

---

### 4.2. Tạo/Lấy Hồ Sơ Cho Bệnh Nhân (Staff/Admin)
**Endpoint:** `POST /patients/:patientId/medical-profile`

**Headers:**
```
Authorization: Bearer <token>
```

**Body:** (same as 4.1)

**Response Success (200 or 201):**
```json
{
  "status": true,
  "data": { ... }
}
```

---

## 🏥 5. EXAMINATION APIs (Ca Khám)

### 5.1. Bắt Đầu Ca Khám
**Endpoint:** `POST /api/examinations/start`

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "appointmentId": "string (required)",
  "staffId": "string (required)",
  "serviceId": "string (required)"
}
```

**Response Success (201):**
```json
{
  "status": true,
  "message": "Bắt đầu ca khám thành công",
  "data": {
    "_id": "...",
    "appointmentId": { ... },
    "doctorId": { ... },
    "staffId": { ... },
    "serviceId": { ... },
    "patientId": { ... },
    "examDate": "...",
    "status": "processing"
  }
}
```

---

### 5.2. Lấy Thông Tin Ca Khám
**Endpoint:** `GET /api/examinations/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Body:** (empty)

**Response Success (200):**
```json
{
  "status": true,
  "data": {
    "_id": "...",
    "patientId": { ... },
    "doctorId": { ... },
    "diagnosis": "...",
    "treatment": "...",
    "doctorNote": "...",
    "resultSummary": "...",
    "status": "processing|done"
  }
}
```

---

### 5.3. Lấy Ca Khám Theo Appointment
**Endpoint:** `GET /api/examinations/appointment/:appointmentId`

**Headers:**
```
Authorization: Bearer <token>
```

**Body:** (empty)

**Response:** (same as 5.2)

---

### 5.4. Danh Sách Ca Khám
**Endpoint:** `GET /api/examinations`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Params:**
```
status=processing|done (optional)
doctorId=string (optional)
patientId=string (optional)
fromDate=YYYY-MM-DD (optional)
toDate=YYYY-MM-DD (optional)
limit=number (optional, default: 50)
skip=number (optional, default: 0)
```

**Response Success (200):**
```json
{
  "status": true,
  "data": {
    "examinations": [ ... ],
    "total": 100,
    "limit": 50,
    "skip": 0
  }
}
```

---

### 5.5. Cập Nhật Ca Khám
**Endpoint:** `PUT /api/examinations/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "diagnosis": "string (optional)",
  "treatment": "string (optional)",
  "doctorNote": "string (optional)",
  "resultSummary": "string (optional)"
}
```

**Response Success (200):**
```json
{
  "status": true,
  "message": "Cập nhật ca khám thành công",
  "data": { ... }
}
```

---

### 5.6. Hoàn Thành Ca Khám
**Endpoint:** `PUT /api/examinations/:id/complete`

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "diagnosis": "string (optional)",
  "treatment": "string (optional)",
  "doctorNote": "string (optional)",
  "resultSummary": "string (optional)"
}
```

**Response Success (200):**
```json
{
  "status": true,
  "message": "Hoàn thành ca khám thành công",
  "data": {
    ...
    "status": "done"
  }
}
```

---

## 📊 Tổng Kết

| Module | Số Lượng API |
|--------|--------------|
| Authentication | 4 |
| Appointments | 11 |
| Directory | 5 |
| Medical Profile | 2 |
| Examinations | 6 |
| **TỔNG CỘNG** | **28 APIs** |

---

## 🔑 Authentication

Hầu hết các API đều yêu cầu authentication token trong header:
```
Authorization: Bearer <token>
```

Token được lấy từ response của API `/auth/login`.

---

## ⚠️ Error Responses

Tất cả API đều trả về error theo format:
```json
{
  "status": false,
  "message": "Mô tả lỗi"
}
```

Các HTTP status code phổ biến:
- `400` - Bad Request (dữ liệu không hợp lệ)
- `401` - Unauthorized (chưa đăng nhập)
- `403` - Forbidden (không có quyền)
- `404` - Not Found (không tìm thấy)
- `500` - Internal Server Error
