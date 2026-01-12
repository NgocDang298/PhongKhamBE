# 📚 API Documentation - Clinic Management System

## Base URL
```
http://localhost:3000
```

## 🔑 Authentication
Hầu hết các API yêu cầu authentication token trong header:
```
Authorization: Bearer <token>
```

Token được lấy từ response của API `/auth/login`.

---

## 📋 Table of Contents

1. [Authentication APIs](#1-authentication-apis) (5 APIs)
2. [Appointment APIs](#2-appointment-apis) (11 APIs)
3. [Directory APIs](#3-directory-apis) (5 APIs)
4. [Medical Profile APIs](#4-medical-profile-apis) (2 APIs)
5. [Examination APIs](#5-examination-apis) (6 APIs)
6. [Test Request APIs](#6-test-request-apis) (5 APIs)
7. [Test Result APIs](#7-test-result-apis) (5 APIs)
8. [Service Management APIs](#8-service-management-apis) (6 APIs)
9. [Invoice & Payment APIs](#9-invoice--payment-apis) (6 APIs)
10. [Work Schedule APIs](#10-work-schedule-apis) (6 APIs)
11. [Profile Management APIs](#11-profile-management-apis) (6 APIs)
12. [Account Management APIs](#12-account-management-apis) (2 APIs)
13. [Additional Update & Delete APIs](#13-additional-update--delete-apis) (12 APIs)

**Total: 77 APIs**

---

## 1. Authentication APIs

### 1.1. Đăng Ký Tài Khoản
```
POST /auth/register
```

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
  "cccd": "string (required)",
  
  // Nếu role = "doctor":
  "specialty": "string (required)",
  "degree": "string (optional)",
  "birthYear": "number (optional)",
  "workExperience": "number (optional)",
  
  // Nếu role = "staff" hoặc "labNurse":
  "cccd": "string (optional)"
}
```

**Response (200):**
```json
{
  "status": true,
  "data": {
    "user": { "_id": "...", "email": "...", "role": "patient" },
    "profile": { "_id": "...", "fullName": "...", "phone": "..." }
  }
}
```

---

### 1.2. Đăng Nhập
```
POST /auth/login
```

**Body:**
```json
{
  "cccd": "string (required)",
  "password": "string (required)"
}
```

**Response (200):**
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
```
PUT /auth/change-password
Auth: Required
```

**Body:**
```json
{
  "currentPassword": "string (required)",
  "newPassword": "string (required)"
}
```

**Response (200):**
```json
{
  "status": true,
  "message": "Đổi mật khẩu thành công"
}
```

---

### 1.4. Đăng Xuất
```
POST /auth/logout
Auth: Required
```

**Body:** (empty)

**Response (200):**
```json
{
  "status": true,
  "message": "Đăng xuất thành công"
}
---

### 1.5. Tạo Tài Khoản Admin
```
POST /auth/register/admin
Auth: Public (No authentication required)
```

> **⚠️ CẢNH BÁO BẢO MẬT:**
> - Đây là endpoint PUBLIC để tạo admin đầu tiên khi khởi tạo hệ thống
> - Sau khi tạo admin đầu tiên, nên disable hoặc bảo vệ endpoint này
> - Chỉ sử dụng trong môi trường development hoặc khi cần thiết

**Body:**
```json
{
  "cccd": "string (required)",
  "password": "string (required, min 8 chars, phải có chữ hoa, chữ thường, số)",
  "email": "string (required)",
  "sdt": "string (required)"
}
```

**Yêu cầu mật khẩu:**
- Tối thiểu 8 ký tự
- Phải chứa ít nhất một chữ hoa (A-Z)
- Phải chứa ít nhất một chữ thường (a-z)
- Phải chứa ít nhất một số (0-9)

**Response (200):**
```json
{
  "status": true,
  "data": {
    "user": {
      "_id": "...",
      "cccd": "admin123",
      "email": "admin@clinic.com",
      "sdt": "0900000000",
      "role": "admin",
      "createdAt": "2025-12-17T03:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "message": "Tài khoản admin đã được tạo thành công. Vui lòng bảo mật thông tin đăng nhập."
  }
}
```

**Error Responses:**

*400 Bad Request - Thiếu thông tin:*
```json
{
  "status": false,
  "message": "CCCD là bắt buộc"
}
```

*400 Bad Request - Mật khẩu yếu:*
```json
{
  "status": false,
  "message": "Mật khẩu admin phải chứa ít nhất một chữ hoa, một chữ thường và một số"
}
```

*409 Conflict - Trùng lặp:*
```json
{
  "status": false,
  "message": "Email đã được sử dụng"
}
```

**Ví dụ sử dụng:**
```bash
curl -X POST http://localhost:3000/api/auth/register/admin \
  -H "Content-Type: application/json" \
  -d '{
    "cccd": "admin123",
    "password": "Admin@123456",
    "email": "admin@clinic.com",
    "sdt": "0900000000"
  }'
```

---


## 2. Appointment APIs

### 2.1. Tạo Lịch Hẹn
```
POST /appointments
Auth: Required
```

**Body:**
```json
{
  "doctorId": "string (optional)",
  "appointmentDate": "ISO 8601 datetime (required)",
  "note": "string (optional)",
  "patientId": "string (required nếu staff/admin tạo cho bệnh nhân)"
}
```

**Response (200):**
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
```
GET /appointments?status=pending
Auth: Required
```

**Query Params:**
- `status`: pending|confirmed|cancelled (optional)

**Response (200):**
```json
{
  "status": true,
  "data": [
    {
      "_id": "...",
      "patientId": { "fullName": "...", "phone": "..." },
      "doctorId": { "fullName": "...", "specialty": "..." },
      "appointmentDate": "...",
      "status": "confirmed"
    }
  ]
}
```

---

### 2.3. Lấy Slots Có Sẵn
```
GET /appointments/slots?date=2024-12-17&doctorId=...
Auth: Required
```

**Query Params:**
- `date`: YYYY-MM-DD (required)
- `doctorId`: string (optional)

**Response (200):**
```json
{
  "status": true,
  "data": [
    { "time": "2024-12-17T08:00", "doctorId": "..." },
    { "time": "2024-12-17T08:30", "doctorId": "..." }
  ]
}
```

---

### 2.4. Xác Nhận Lịch Hẹn
```
POST /appointments/:id/confirm
Auth: Required (Admin, Staff)
```

**Body:** (empty)

**Response (200):**
```json
{
  "status": true,
  "message": "Xác nhận lịch hẹn thành công",
  "data": { "_id": "...", "status": "confirmed" }
}
```

---

### 2.5. Hủy Lịch Hẹn
```
POST /appointments/:id/cancel
Auth: Required
```

**Body:** (empty)

**Response (200):**
```json
{
  "status": true,
  "message": "Hủy lịch hẹn thành công",
  "data": { "_id": "...", "status": "cancelled" },
  "suggestedSlots": [ ... ]
}
```

---

### 2.6. Từ Chối Lịch Hẹn
```
POST /appointments/:id/reject
Auth: Required (Admin, Staff)
```

**Body:**
```json
{
  "reason": "string (optional)"
}
```

**Response (200):**
```json
{
  "status": true,
  "message": "Từ chối lịch hẹn thành công",
  "data": { "_id": "...", "status": "cancelled" },
  "suggestedSlots": [ ... ]
}
```

---

### 2.7. Lấy Slots Gợi Ý
```
GET /appointments/:id/suggested-slots?limit=5
Auth: Required
```

**Query Params:**
- `limit`: number (optional, default: 5)

**Response (200):**
```json
{
  "status": true,
  "data": [
    { "time": "2024-12-18T08:00", "doctorId": "..." }
  ]
}
```

---

### 2.8. Danh Sách Bác Sĩ
```
GET /appointments/doctors
Auth: Required
```

**Response (200):**
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
```
GET /appointments/doctors/available-dates?doctorId=...
Auth: Required
```

**Query Params:**
- `doctorId`: string (required)

**Response (200):**
```json
{
  "status": true,
  "data": ["2024-12-17", "2024-12-18", "2024-12-19"]
}
```

---

### 2.10. Slots Trống Theo Bác Sĩ và Ngày
```
GET /appointments/doctors/available-slots?doctorId=...&date=2024-12-17
Auth: Required
```

**Query Params:**
- `doctorId`: string (required)
- `date`: YYYY-MM-DD (required)

**Response (200):**
```json
{
  "status": true,
  "data": [
    { "time": "2024-12-17T08:00", "doctorId": "..." }
  ]
}
```

---

### 2.11. Tạo Lịch Hẹn Theo Bác Sĩ
```
POST /appointments/doctors
Auth: Required
```

**Body:**
```json
{
  "doctorId": "string (required)",
  "appointmentDate": "ISO 8601 datetime (required)",
  "note": "string (optional)",
  "patientId": "string (required nếu không phải patient)"
}
```

**Response (200):**
```json
{
  "status": true,
  "data": { "_id": "...", "doctorId": "...", "appointmentDate": "..." }
}
```

---

## 3. Directory APIs

### 3.1. Tạo Bệnh Nhân Walk-in
```
POST /patients
Auth: Required (Admin, Staff)
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
  "password": "string (optional)"
}
```

**Response (201):**
```json
{
  "status": true,
  "message": "Tạo hồ sơ bệnh nhân thành công",
  "data": {
    "user": { "_id": "...", "cccd": "..." },
    "patient": { "_id": "...", "fullName": "..." }
  }
}
```

---

### 3.2. Danh Sách Bệnh Nhân
```
GET /patients?search=Nguyễn
Auth: Required (Admin, Staff)
```

**Query Params:**
- `search`: string (optional - tìm theo tên, CCCD, SĐT)

**Response (200):**
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

### 3.3. Danh Sách Bác Sĩ
```
GET /doctors
Auth: Required (Admin, Staff)
```

**Response (200):**
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

### 3.4. Danh Sách Nhân Viên
```
GET /staffs
Auth: Required (Admin, Staff)
```

**Response (200):**
```json
{
  "status": true,
  "data": [
    { "_id": "...", "fullName": "Trần Thị B", "userId": "..." }
  ]
}
```

---

### 3.5. Danh Sách Y Tá
```
GET /nurses
Auth: Required (Admin, Staff)
```

**Response (200):**
```json
{
  "status": true,
  "data": [
    { "_id": "...", "fullName": "Lê Thị C", "userId": "..." }
  ]
}
```

---

## 4. Medical Profile APIs

### 4.1. Tạo/Lấy Hồ Sơ Khám Bệnh (Patient)
```
POST /medical-profile
Auth: Required (Patient)
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

**Response (200/201):**
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
```
POST /patients/:patientId/medical-profile
Auth: Required (Admin, Staff)
```

**Body:** (same as 4.1)

**Response (200/201):**
```json
{
  "status": true,
  "data": { ... }
}
```

---

## 5. Examination APIs

### 5.1. Bắt Đầu Ca Khám
```
POST /api/examinations/start
Auth: Required (Doctor)
```

**Body:**
```json
{
  "appointmentId": "string (required)",
  "staffId": "string (required)",
  "serviceId": "string (required)"
}
```

**Response (201):**
```json
{
  "status": true,
  "message": "Bắt đầu ca khám thành công",
  "data": {
    "_id": "...",
    "appointmentId": { ... },
    "doctorId": { ... },
    "patientId": { ... },
    "examDate": "...",
    "status": "processing"
  }
}
```

---

### 5.2. Lấy Thông Tin Ca Khám
```
GET /api/examinations/:id
Auth: Required
```

**Response (200):**
```json
{
  "status": true,
  "data": {
    "_id": "...",
    "patientId": { ... },
    "doctorId": { ... },
    "diagnosis": "...",
    "treatment": "...",
    "status": "processing|done"
  }
}
```

---

### 5.3. Lấy Ca Khám Theo Appointment
```
GET /api/examinations/appointment/:appointmentId
Auth: Required
```

**Response (200):**
```json
{
  "status": true,
  "data": { ... }
}
```

---

### 5.4. Danh Sách Ca Khám
```
GET /api/examinations?status=done&limit=50
Auth: Required
```

**Query Params:**
- `status`: processing|done (optional)
- `doctorId`: string (optional)
- `patientId`: string (optional)
- `fromDate`: YYYY-MM-DD (optional)
- `toDate`: YYYY-MM-DD (optional)
- `limit`: number (optional, default: 50)
- `skip`: number (optional, default: 0)

**Response (200):**
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
```
PUT /api/examinations/:id
Auth: Required (Doctor)
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

**Response (200):**
```json
{
  "status": true,
  "message": "Cập nhật ca khám thành công",
  "data": { ... }
}
```

---

### 5.6. Hoàn Thành Ca Khám
```
PUT /api/examinations/:id/complete
Auth: Required (Doctor)
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

**Response (200):**
```json
{
  "status": true,
  "message": "Hoàn thành ca khám thành công",
  "data": { "status": "done", ... }
}
```

---

## 6. Test Request APIs

### 6.1. Tạo Yêu Cầu Xét Nghiệm
```
POST /api/test-requests
Auth: Required (Doctor)
```

**Body:**
```json
{
  "examId": "string (required)",
  "serviceId": "string (required)",
  "testType": "string (required)",
  "labNurseId": "string (required)"
}
```

**Response (201):**
```json
{
  "status": true,
  "message": "Tạo yêu cầu xét nghiệm thành công",
  "data": {
    "_id": "...",
    "examId": { ... },
    "serviceId": { ... },
    "testType": "...",
    "status": "waiting"
  }
}
```

---

### 6.2. Lấy Yêu Cầu Xét Nghiệm Theo Ca Khám
```
GET /api/examinations/:examId/test-requests
Auth: Required
```

**Response (200):**
```json
{
  "status": true,
  "data": [ ... ]
}
```

---

### 6.3. Lấy Chi Tiết Yêu Cầu Xét Nghiệm
```
GET /api/test-requests/:id
Auth: Required
```

**Response (200):**
```json
{
  "status": true,
  "data": {
    "_id": "...",
    "examId": { ... },
    "serviceId": { ... },
    "testType": "...",
    "status": "waiting|processing|completed"
  }
}
```

---

### 6.4. Cập Nhật Trạng Thái Yêu Cầu
```
PUT /api/test-requests/:id/status
Auth: Required (Lab Nurse)
```

**Body:**
```json
{
  "status": "waiting|processing|completed (required)"
}
```

**Response (200):**
```json
{
  "status": true,
  "message": "Cập nhật trạng thái thành công",
  "data": { ... }
}
```

---

### 6.5. Danh Sách Yêu Cầu Xét Nghiệm
```
GET /api/test-requests?status=waiting&limit=50
Auth: Required
```

**Query Params:**
- `status`: waiting|processing|completed (optional)
- `labNurseId`: string (optional)
- `examId`: string (optional)
- `fromDate`: YYYY-MM-DD (optional)
- `toDate`: YYYY-MM-DD (optional)
- `limit`: number (optional, default: 50)
- `skip`: number (optional, default: 0)

**Response (200):**
```json
{
  "status": true,
  "data": {
    "testRequests": [ ... ],
    "total": 20,
    "limit": 50,
    "skip": 0
  }
}
```

---

## 7. Test Result APIs

### 7.1. Tạo Kết Quả Xét Nghiệm
```
POST /test-results
Auth: Required (Lab Nurse)
```

**Body:**
```json
{
  "testRequestId": "string (required)",
  "resultData": {
    "hemoglobin": 14.5,
    "whiteBloodCells": 7000,
    "platelets": 250000,
    "notes": "Kết quả bình thường"
  }
}
```

**Response (201):**
```json
{
  "status": true,
  "message": "Tạo kết quả xét nghiệm thành công",
  "data": {
    "_id": "...",
    "testRequestId": { ... },
    "labNurseId": { ... },
    "resultData": { ... },
    "performedAt": "..."
  }
}
```

---

### 7.2. Lấy Kết Quả Theo Test Request
```
GET /test-results/:testRequestId
Auth: Required
```

**Response (200):**
```json
{
  "status": true,
  "data": {
    "_id": "...",
    "testRequestId": { ... },
    "resultData": { ... },
    "performedAt": "..."
  }
}
```

---

### 7.3. Cập Nhật Kết Quả Xét Nghiệm
```
PUT /test-results/:id
Auth: Required (Lab Nurse)
```

**Body:**
```json
{
  "resultData": {
    "hemoglobin": 15.0,
    "whiteBloodCells": 7200,
    "notes": "Đã cập nhật"
  }
}
```

**Response (200):**
```json
{
  "status": true,
  "message": "Cập nhật kết quả xét nghiệm thành công",
  "data": { ... }
}
```

---

### 7.4. Kết Quả Xét Nghiệm Của Ca Khám
```
GET /test-results/examination/:examId
Auth: Required (Doctor, Lab Nurse, Staff, Admin)
```

**Response (200):**
```json
{
  "status": true,
  "data": [
    {
      "_id": "...",
      "testRequestId": { ... },
      "resultData": { ... },
      "performedAt": "..."
    }
  ]
}
```

---

### 7.5. Lịch Sử Xét Nghiệm Của Bệnh Nhân
```
GET /test-results/patient/:patientId?limit=50
Auth: Required
```

**Query Params:**
- `limit`: number (optional, default: 50)
- `skip`: number (optional, default: 0)
- `fromDate`: YYYY-MM-DD (optional)
- `toDate`: YYYY-MM-DD (optional)

**Response (200):**
```json
{
  "status": true,
  "data": {
    "results": [ ... ],
    "total": 10,
    "limit": 50,
    "skip": 0
  }
}
```

---

## 8. Service Management APIs

### 8.1. Tạo Dịch Vụ Mới
```
POST /services
Auth: Required (Admin only)
```

**Body:**
```json
{
  "name": "Khám nội khoa",
  "description": "Khám và tư vấn các bệnh lý nội khoa",
  "price": 200000,
  "serviceType": "examination|test|other (required)"
}
```

**Response (201):**
```json
{
  "status": true,
  "message": "Tạo dịch vụ thành công",
  "data": {
    "_id": "...",
    "name": "Khám nội khoa",
    "price": 200000,
    "serviceType": "examination",
    "isActive": true
  }
}
```

---

### 8.2. Danh Sách Dịch Vụ
```
GET /services?serviceType=examination&isActive=true&search=khám
Auth: Required
```

**Query Params:**
- `serviceType`: examination|test|other (optional)
- `isActive`: true|false (optional)
- `search`: string (optional)
- `limit`: number (optional, default: 50)
- `skip`: number (optional, default: 0)

**Response (200):**
```json
{
  "status": true,
  "data": {
    "services": [
      {
        "_id": "...",
        "name": "Khám nội khoa",
        "price": 200000,
        "serviceType": "examination",
        "isActive": true
      }
    ],
    "total": 10,
    "limit": 50,
    "skip": 0
  }
}
```

---

### 8.3. Chi Tiết Dịch Vụ
```
GET /services/:id
Auth: Required
```

**Response (200):**
```json
{
  "status": true,
  "data": {
    "_id": "...",
    "name": "Khám nội khoa",
    "description": "...",
    "price": 200000,
    "serviceType": "examination",
    "isActive": true
  }
}
```

---

### 8.4. Cập Nhật Dịch Vụ
```
PUT /services/:id
Auth: Required (Admin only)
```

**Body:**
```json
{
  "name": "Khám nội khoa tổng quát",
  "description": "...",
  "price": 250000,
  "isActive": true
}
```

**Response (200):**
```json
{
  "status": true,
  "message": "Cập nhật dịch vụ thành công",
  "data": { ... }
}
```

---


### 8.5. Xóa Dịch Vụ
```
DELETE /services/:id
Auth: Required (Admin only)
```

**Response (200):**
```json
{
  "status": true,
  "message": "Xóa dịch vụ thành công"
}
```

> **Warning:** Đây là hard delete - dịch vụ sẽ bị xóa hoàn toàn khỏi database. Hãy cẩn thận khi sử dụng API này.


---

### 8.6. Danh Sách Dịch Vụ Hoạt Động
```
GET /services/active?serviceType=examination
Auth: Required
```

**Query Params:**
- `serviceType`: examination|test|other (optional)

**Response (200):**
```json
{
  "status": true,
  "data": [
    {
      "_id": "...",
      "name": "Khám nội khoa",
      "price": 200000,
      "serviceType": "examination"
    }
  ]
}
```

---

## 9. Invoice & Payment APIs

### 9.1. Tạo Hóa Đơn
```
POST /invoices
Auth: Required (Admin, Staff)
```

**Body:**
```json
{
  "examinationId": "string (required)",
  "items": [
    {
      "type": "service",
      "referenceId": "serviceId",
      "quantity": 1
    },
    {
      "type": "test",
      "referenceId": "serviceId",
      "quantity": 1
    }
  ]
}
```

**Response (201):**
```json
{
  "status": true,
  "message": "Tạo hóa đơn thành công",
  "data": {
    "_id": "...",
    "examinationId": { ... },
    "patientId": { ... },
    "items": [
      {
        "type": "service",
        "name": "Khám nội khoa",
        "price": 200000,
        "quantity": 1
      }
    ],
    "totalAmount": 350000,
    "status": "unpaid"
  }
}
```

---

### 9.2. Danh Sách Hóa Đơn
```
GET /invoices?status=paid&patientId=...&limit=50
Auth: Required (Admin, Staff)
```

**Query Params:**
- `patientId`: string (optional)
- `status`: paid|unpaid (optional)
- `fromDate`: YYYY-MM-DD (optional)
- `toDate`: YYYY-MM-DD (optional)
- `limit`: number (optional, default: 50)
- `skip`: number (optional, default: 0)

**Response (200):**
```json
{
  "status": true,
  "data": {
    "invoices": [ ... ],
    "total": 100,
    "limit": 50,
    "skip": 0
  }
}
```

---

### 9.3. Chi Tiết Hóa Đơn
```
GET /invoices/:id
Auth: Required (Patient can view own, Staff/Admin view all)
```

**Response (200):**
```json
{
  "status": true,
  "data": {
    "_id": "...",
    "examinationId": { ... },
    "patientId": { ... },
    "items": [ ... ],
    "totalAmount": 350000,
    "status": "paid",
    "paidAt": "...",
    "paidBy": { ... }
  }
}
```

---

### 9.4. Thanh Toán Hóa Đơn
```
PUT /invoices/:id/pay
Auth: Required (Admin, Staff)
```

**Body:** (empty)

**Response (200):**
```json
{
  "status": true,
  "message": "Thanh toán hóa đơn thành công",
  "data": {
    "_id": "...",
    "status": "paid",
    "paidAt": "...",
    "paidBy": { ... }
  }
}
```

---

### 9.5. Lịch Sử Hóa Đơn Của Bệnh Nhân
```
GET /invoices/patient/:patientId?status=unpaid
Auth: Required (Patient can view own, Staff/Admin view all)
```

**Query Params:**
- `status`: paid|unpaid (optional)
- `limit`: number (optional, default: 50)
- `skip`: number (optional, default: 0)

**Response (200):**
```json
{
  "status": true,
  "data": {
    "invoices": [ ... ],
    "total": 5,
    "limit": 50,
    "skip": 0
  }
}
```

---

### 9.6. Thống Kê Doanh Thu
```
GET /invoices/statistics?period=monthly&fromDate=2024-01-01
Auth: Required (Admin only)
```

**Query Params:**
- `period`: daily|monthly|yearly (optional, default: monthly)
- `fromDate`: YYYY-MM-DD (optional)
- `toDate`: YYYY-MM-DD (optional)

**Response (200):**
```json
{
  "status": true,
  "data": {
    "totalRevenue": 10000000,
    "paidAmount": 8000000,
    "unpaidAmount": 2000000,
    "totalInvoices": 50,
    "paidInvoices": 40,
    "unpaidInvoices": 10,
    "byPeriod": [
      {
        "month": "2024-12",
        "total": 5000000,
        "paid": 4000000,
        "unpaid": 1000000,
        "count": 25
      }
    ]
  }
}
```

---

## 10. Work Schedule APIs

### 10.1. Tạo Lịch Làm Việc
```
POST /work-schedules
Auth: Required (Admin only)
```

**Body:**
```json
{
  "doctorId": "string (required if no labNurseId)",
  "labNurseId": "string (required if no doctorId)",
  "dayOfWeek": 1,
  "shiftStart": "08:00",
  "shiftEnd": "12:00",
  "note": "Ca sáng"
}
```

**Response (201):**
```json
{
  "status": true,
  "message": "Tạo lịch làm việc thành công",
  "data": {
    "_id": "...",
    "doctorId": { "fullName": "...", "specialty": "..." },
    "dayOfWeek": 1,
    "shiftStart": "08:00",
    "shiftEnd": "12:00",
    "note": "Ca sáng"
  }
}
```

---

### 10.2. Lấy Lịch Làm Việc Của Bác Sĩ
```
GET /work-schedules/doctor/:doctorId
Auth: Required
```

**Response (200):**
```json
{
  "status": true,
  "data": [
    {
      "_id": "...",
      "dayOfWeek": 1,
      "shiftStart": "08:00",
      "shiftEnd": "12:00",
      "note": "Ca sáng"
    }
  ]
}
```

---

### 10.3. Lấy Lịch Làm Việc Của Y Tá
```
GET /work-schedules/nurse/:nurseId
Auth: Required
```

**Response (200):**
```json
{
  "status": true,
  "data": [ ... ]
}
```

---

### 10.4. Cập Nhật Lịch Làm Việc
```
PUT /work-schedules/:id
Auth: Required (Admin only)
```

**Body:**
```json
{
  "dayOfWeek": 2,
  "shiftStart": "09:00",
  "shiftEnd": "13:00",
  "note": "Updated shift"
}
```

**Response (200):**
```json
{
  "status": true,
  "message": "Cập nhật lịch làm việc thành công",
  "data": { ... }
}
```

---

### 10.5. Xóa Lịch Làm Việc
```
DELETE /work-schedules/:id
Auth: Required (Admin only)
```

**Response (200):**
```json
{
  "status": true,
  "message": "Xóa lịch làm việc thành công"
}
```

---

### 10.6. Tìm Nhân Viên Có Lịch Làm Việc
```
GET /work-schedules/available?dayOfWeek=1&time=09:00&role=doctor
Auth: Required
```

**Query Params:**
- `dayOfWeek`: 0-6 (required, 0=Sunday)
- `time`: HH:mm (required)
- `role`: doctor|nurse (required)

**Response (200):**
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

## 11. Profile Management APIs

### 11.1. Lấy Thông Tin Profile
```
GET /profile/me
Auth: Required
```

**Response (200):**
```json
{
  "status": true,
  "data": {
    "user": {
      "_id": "...",
      "email": "...",
      "cccd": "...",
      "role": "patient"
    },
    "profile": {
      "_id": "...",
      "fullName": "...",
      "phone": "...",
      "address": "..."
    },
    "stats": {
      "totalAppointments": 5,
      "totalExaminations": 3
    }
  }
}
```

---

### 11.2. Cập Nhật Profile
```
PUT /profile/me
Auth: Required
```

**Body:**
```json
{
  "fullName": "Nguyễn Văn A",
  "phone": "0987654321",
  "address": "123 Đường ABC",
  "email": "email@example.com"
}
```

**Response (200):**
```json
{
  "status": true,
  "message": "Cập nhật profile thành công",
  "data": { ... }
}
```

---

### 11.3. Upload Avatar
```
PUT /profile/avatar
Auth: Required
```

**Body:** FormData with image file

**Response (501):**
```json
{
  "status": false,
  "message": "Tính năng upload avatar chưa được triển khai"
}
```

---

### 11.4. Lấy Lịch Sử Khám Bệnh
```
GET /profile/medical-history
Auth: Required (Patient only)
```

**Response (200):**
```json
{
  "status": true,
  "data": {
    "medicalProfile": {
      "bloodType": "A",
      "allergies": ["Penicillin"],
      "chronicDiseases": []
    },
    "examinations": [
      {
        "examDate": "...",
        "diagnosis": "...",
        "treatment": "...",
        "doctorId": { "fullName": "...", "specialty": "..." }
      }
    ],
    "patientInfo": {
      "fullName": "...",
      "dateOfBirth": "...",
      "gender": "..."
    }
  }
}
```

---

### 11.5. Lấy Danh Sách Lịch Hẹn Của Mình
```
GET /profile/appointments?status=confirmed&limit=20
Auth: Required
```

**Query Params:**
- `status`: pending|confirmed|cancelled (optional)
- `limit`: number (optional, default: 50)
- `skip`: number (optional, default: 0)

**Response (200):**
```json
{
  "status": true,
  "data": {
    "appointments": [ ... ],
    "total": 10,
    "limit": 20,
    "skip": 0
  }
}
```

---

### 11.6. Lấy Danh Sách Ca Khám Của Mình
```
GET /profile/examinations?status=done&fromDate=2024-01-01
Auth: Required (Doctor only)
```

**Query Params:**
- `status`: processing|done (optional)
- `fromDate`: YYYY-MM-DD (optional)
- `toDate`: YYYY-MM-DD (optional)
- `limit`: number (optional, default: 50)
- `skip`: number (optional, default: 0)

**Response (200):**
```json
{
  "status": true,
  "data": {
    "examinations": [ ... ],
    "total": 50,
    "limit": 50,
    "skip": 0
  }
}
```

---

## 🔐 Authorization Summary

| Role | Permissions |
|------|-------------|
| **Admin** | Full system access, manage services, work schedules, view statistics |
| **Staff** | Daily operations: appointments, invoices, walk-in patients |
| **Doctor** | Examinations, test requests, view own examinations |
| **Lab Nurse** | Test results creation and updates |
| **Patient** | View own data, book appointments, update profile |

---

## ⚠️ Error Responses

All APIs return errors in this format:
```json
{
  "status": false,
  "message": "Error description"
}
```

**Common HTTP Status Codes:**
- `400` - Bad Request (invalid data)
- `401` - Unauthorized (not logged in)
- `403` - Forbidden (no permission)
- `404` - Not Found
- `500` - Internal Server Error

---

## 📝 Notes

1. **Date Format**: Use ISO 8601 format for dates (YYYY-MM-DD or full datetime)
2. **Time Format**: Use HH:mm format (24-hour)
3. **Pagination**: Default limit is 50, max recommended is 100
4. **Authentication**: Token expires after 7 days (configurable)
5. **CCCD**: Used as username for login (12 digits)

---

## 12. Account Management APIs

### 12.1. Lấy Danh Sách Tất Cả Tài Khoản
```
GET /accounts?role=patient&search=keyword
Auth: Required (Admin only)
```

**Query Params:**
- `role`: patient|doctor|staff|lab_nurse|admin (optional)
- `search`: string (optional - tìm theo CCCD, email, hoặc số điện thoại)

**Response (200):**
```json
{
  "status": true,
  "data": [
    {
      "_id": "...",
      "cccd": "123456789012",
      "email": "patient@example.com",
      "sdt": "0901234567",
      "role": "patient",
      "createdAt": "2024-12-17T03:00:00.000Z",
      "updatedAt": "2024-12-17T03:00:00.000Z",
      "profile": {
        "_id": "...",
        "fullName": "Nguyễn Văn A",
        "phone": "0901234567",
        "gender": "male",
        "dateOfBirth": "1990-01-01",
        "address": "123 Đường ABC, Quận 1, TP.HCM",
        "cccd": "123456789012"
      }
    },
    {
      "_id": "...",
      "cccd": "987654321098",
      "email": "doctor@example.com",
      "sdt": "0909876543",
      "role": "doctor",
      "createdAt": "2024-12-17T03:00:00.000Z",
      "updatedAt": "2024-12-17T03:00:00.000Z",
      "profile": {
        "_id": "...",
        "fullName": "BS. Trần Thị B",
        "specialty": "Nội khoa",
        "degree": "Tiến sĩ",
        "birthYear": 1985,
        "workExperience": 10
      }
    },
    {
      "_id": "...",
      "cccd": "admin123",
      "email": "admin@clinic.com",
      "sdt": "0900000000",
      "role": "admin",
      "createdAt": "2024-12-17T03:00:00.000Z",
      "updatedAt": "2024-12-17T03:00:00.000Z",
      "profile": {
        "fullName": "Administrator",
        "role": "admin"
      }
    }
  ]
}
```

**Error Responses:**

*401 Unauthorized:*
```json
{
  "status": false,
  "message": "Token không hợp lệ"
}
```

*403 Forbidden:*
```json
{
  "status": false,
  "message": "Bạn không có quyền truy cập"
}
```

*500 Internal Server Error:*
```json
{
  "status": false,
  "message": "Lỗi khi lấy danh sách tài khoản"
}
```

**Ví dụ sử dụng:**

```bash
# Lấy tất cả tài khoản
curl -X GET http://localhost:3000/api/accounts \
  -H "Authorization: Bearer YOUR_TOKEN"

# Lọc theo role
curl -X GET "http://localhost:3000/api/accounts?role=doctor" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Tìm kiếm theo keyword
curl -X GET "http://localhost:3000/api/accounts?search=0901234567" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Kết hợp filter và search
curl -X GET "http://localhost:3000/api/accounts?role=patient&search=Nguyễn" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 12.2. Lấy Thông Tin Chi Tiết Một Tài Khoản
```
GET /accounts/:id
Auth: Required (Admin only)
```

**Path Params:**
- `id`: User ID (required)

**Response (200):**
```json
{
  "status": true,
  "data": {
    "_id": "675e1234567890abcdef1234",
    "cccd": "123456789012",
    "email": "patient@example.com",
    "sdt": "0901234567",
    "role": "patient",
    "createdAt": "2024-12-17T03:00:00.000Z",
    "updatedAt": "2024-12-17T03:00:00.000Z",
    "profile": {
      "_id": "...",
      "userId": "675e1234567890abcdef1234",
      "fullName": "Nguyễn Văn A",
      "phone": "0901234567",
      "gender": "male",
      "dateOfBirth": "1990-01-01T00:00:00.000Z",
      "address": "123 Đường ABC, Quận 1, TP.HCM",
      "cccd": "123456789012",
      "createdAt": "2024-12-17T03:00:00.000Z",
      "updatedAt": "2024-12-17T03:00:00.000Z"
    }
  }
}
```

**Error Responses:**

*404 Not Found:*
```json
{
  "status": false,
  "message": "Không tìm thấy tài khoản"
}
```

*401 Unauthorized:*
```json
{
  "status": false,
  "message": "Token không hợp lệ"
}
```

*403 Forbidden:*
```json
{
  "status": false,
  "message": "Bạn không có quyền truy cập"
}
```

**Ví dụ sử dụng:**

```bash
curl -X GET http://localhost:3000/api/accounts/675e1234567890abcdef1234 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 13. Additional Update & Delete APIs

### 13.1. Cập Nhật Thông Tin Bệnh Nhân
```
PUT /patients/:id
Auth: Required (Admin, Staff)
```

**Body:**
```json
{
  "fullName": "string (optional)",
  "phone": "string (optional)",
  "address": "string (optional)",
  "gender": "male|female|other (optional)",
  "dateOfBirth": "YYYY-MM-DD (optional)",
  "cccd": "string (optional)",
  "email": "string (optional)"
}
```

**Response (200):**
```json
{
  "status": true,
  "message": "Cập nhật thông tin bệnh nhân thành công",
  "data": { ... }
}
```

---

### 13.2. Xóa Bệnh Nhân
```
DELETE /patients/:id
Auth: Required (Admin only)
```

**Response (200):**
```json
{
  "status": true,
  "message": "Xóa bệnh nhân thành công"
}
```

> **Note:** Soft delete - bệnh nhân được đánh dấu `isActive = false`

---

### 13.3. Cập Nhật Hồ Sơ Y Tế (Patient)
```
PUT /medical-profile
Auth: Required (Patient)
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

**Response (200):**
```json
{
  "status": true,
  "message": "Cập nhật hồ sơ y tế thành công",
  "data": { ... }
}
```

---

### 13.4. Cập Nhật Hồ Sơ Y Tế Cho Bệnh Nhân (Staff/Admin)
```
PUT /patients/:patientId/medical-profile
Auth: Required (Admin, Staff)
```

**Body:** (same as 13.3)

**Response (200):**
```json
{
  "status": true,
  "message": "Cập nhật hồ sơ y tế thành công",
  "data": { ... }
}
```

---

### 13.5. Cập Nhật Lịch Hẹn
```
PUT /appointments/:id
Auth: Required (Admin, Staff)
```

**Body:**
```json
{
  "appointmentDate": "ISO 8601 datetime (optional)",
  "note": "string (optional)",
  "doctorId": "string (optional)"
}
```

**Response (200):**
```json
{
  "status": true,
  "message": "Cập nhật lịch hẹn thành công",
  "data": { ... }
}
```

> **Note:** Không thể cập nhật lịch hẹn đã hủy

---

### 13.6. Xóa Lịch Hẹn
```
DELETE /appointments/:id
Auth: Required (Admin, Staff)
```

**Response (200):**
```json
{
  "status": true,
  "message": "Xóa lịch hẹn thành công"
}
```

> **Note:** Chỉ xóa được lịch hẹn có status = 'pending'

---

### 13.7. Xóa Ca Khám
```
DELETE /api/examinations/:id
Auth: Required (Admin only)
```

**Response (200):**
```json
{
  "status": true,
  "message": "Xóa ca khám thành công"
}
```

> **Note:** Chỉ xóa được ca khám đang processing, soft delete thành status = 'cancelled'

---

### 13.8. Cập Nhật Yêu Cầu Xét Nghiệm
```
PUT /api/test-requests/:id
Auth: Required (Doctor, Lab Nurse, Admin)
```

**Body:**
```json
{
  "testType": "string (optional)",
  "labNurseId": "string (optional)",
  "serviceId": "string (optional)"
}
```

**Response (200):**
```json
{
  "status": true,
  "message": "Cập nhật yêu cầu xét nghiệm thành công",
  "data": { ... }
}
```

> **Note:** Không thể cập nhật yêu cầu đã hoàn thành

---

### 13.9. Xóa Yêu Cầu Xét Nghiệm
```
DELETE /api/test-requests/:id
Auth: Required (Doctor, Admin)
```

**Response (200):**
```json
{
  "status": true,
  "message": "Xóa yêu cầu xét nghiệm thành công"
}
```

> **Note:** Chỉ xóa được yêu cầu có status = 'waiting'

---

### 13.10. Xóa Kết Quả Xét Nghiệm
```
DELETE /test-results/:id
Auth: Required (Lab Nurse, Admin)
```

**Response (200):**
```json
{
  "status": true,
  "message": "Xóa kết quả xét nghiệm thành công"
}
```

> **Note:** Tự động rollback status của test request từ 'completed' về 'processing'

---

### 13.11. Cập Nhật Hóa Đơn
```
PUT /invoices/:id
Auth: Required (Admin, Staff)
```

**Body:**
```json
{
  "items": [
    {
      "type": "service|test",
      "referenceId": "string",
      "quantity": 1
    }
  ]
}
```

**Response (200):**
```json
{
  "status": true,
  "message": "Cập nhật hóa đơn thành công",
  "data": { ... }
}
```

> **Note:** Chỉ cập nhật được hóa đơn chưa thanh toán, tự động tính lại tổng tiền

---

### 13.12. Xóa Hóa Đơn
```
DELETE /invoices/:id
Auth: Required (Admin only)
```

**Response (200):**
```json
{
  "status": true,
  "message": "Xóa hóa đơn thành công"
}
```

> **Note:** Chỉ xóa được hóa đơn chưa thanh toán, soft delete thành status = 'cancelled'

---

**Total APIs: 77** (65 original + 12 new)
**Last Updated: 2024-12-24**
