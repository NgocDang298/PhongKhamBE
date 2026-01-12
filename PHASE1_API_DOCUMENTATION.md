# 📚 Phase 1 API Documentation

## Base URL
```
http://localhost:3000
```

---

## 🛠️ 1. SERVICES MANAGEMENT APIs

### 1.1. Tạo Dịch Vụ Mới
**Endpoint:** `POST /services`

**Headers:**
```
Authorization: Bearer <token>
```

**Roles:** Admin, Staff

**Body:**
```json
{
  "name": "Khám nội khoa",
  "description": "Khám và tư vấn các bệnh lý nội khoa",
  "price": 200000,
  "serviceType": "examination"
}
```

**Response Success (201):**
```json
{
  "status": true,
  "message": "Tạo dịch vụ thành công",
  "data": {
    "_id": "...",
    "name": "Khám nội khoa",
    "description": "Khám và tư vấn các bệnh lý nội khoa",
    "price": 200000,
    "serviceType": "examination",
    "isActive": true,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

### 1.2. Danh Sách Dịch Vụ
**Endpoint:** `GET /services`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Params:**
```
serviceType=examination|test|other (optional)
isActive=true|false (optional)
search=string (optional - tìm theo tên)
limit=number (optional, default: 50)
skip=number (optional, default: 0)
```

**Response Success (200):**
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

### 1.3. Chi Tiết Dịch Vụ
**Endpoint:** `GET /services/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Response Success (200):**
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

### 1.4. Cập Nhật Dịch Vụ
**Endpoint:** `PUT /services/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Roles:** Admin, Staff

**Body:**
```json
{
  "name": "Khám nội khoa tổng quát",
  "description": "...",
  "price": 250000,
  "isActive": true
}
```

**Response Success (200):**
```json
{
  "status": true,
  "message": "Cập nhật dịch vụ thành công",
  "data": { ... }
}
```

---

### 1.5. Vô Hiệu Hóa Dịch Vụ
**Endpoint:** `DELETE /services/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Roles:** Admin, Staff

**Response Success (200):**
```json
{
  "status": true,
  "message": "Vô hiệu hóa dịch vụ thành công"
}
```

---

### 1.6. Danh Sách Dịch Vụ Hoạt Động
**Endpoint:** `GET /services/active`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Params:**
```
serviceType=examination|test|other (optional)
```

**Response Success (200):**
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

## 🧪 2. TEST RESULTS APIs

### 2.1. Tạo Kết Quả Xét Nghiệm
**Endpoint:** `POST /test-results`

**Headers:**
```
Authorization: Bearer <token>
```

**Roles:** Lab Nurse only

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

**Response Success (201):**
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

### 2.2. Lấy Kết Quả Xét Nghiệm
**Endpoint:** `GET /test-results/:testRequestId`

**Headers:**
```
Authorization: Bearer <token>
```

**Response Success (200):**
```json
{
  "status": true,
  "data": {
    "_id": "...",
    "testRequestId": {
      "_id": "...",
      "testType": "Xét nghiệm máu",
      "serviceId": { ... },
      "examId": { ... }
    },
    "labNurseId": {
      "_id": "...",
      "fullName": "Y tá Nguyễn Văn A"
    },
    "resultData": { ... },
    "performedAt": "..."
  }
}
```

---

### 2.3. Cập Nhật Kết Quả Xét Nghiệm
**Endpoint:** `PUT /test-results/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Roles:** Lab Nurse only

**Body:**
```json
{
  "resultData": {
    "hemoglobin": 15.0,
    "whiteBloodCells": 7200,
    "platelets": 260000,
    "notes": "Đã cập nhật"
  }
}
```

**Response Success (200):**
```json
{
  "status": true,
  "message": "Cập nhật kết quả xét nghiệm thành công",
  "data": { ... }
}
```

---

### 2.4. Kết Quả Xét Nghiệm Của Ca Khám
**Endpoint:** `GET /test-results/examination/:examId`

**Headers:**
```
Authorization: Bearer <token>
```

**Roles:** Doctor, Lab Nurse, Staff, Admin

**Response Success (200):**
```json
{
  "status": true,
  "data": [
    {
      "_id": "...",
      "testRequestId": { ... },
      "labNurseId": { ... },
      "resultData": { ... },
      "performedAt": "..."
    }
  ]
}
```

---

### 2.5. Lịch Sử Xét Nghiệm Của Bệnh Nhân
**Endpoint:** `GET /test-results/patient/:patientId`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Params:**
```
limit=number (optional, default: 50)
skip=number (optional, default: 0)
fromDate=YYYY-MM-DD (optional)
toDate=YYYY-MM-DD (optional)
```

**Response Success (200):**
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

## 💰 3. INVOICE & PAYMENT APIs

### 3.1. Tạo Hóa Đơn
**Endpoint:** `POST /invoices`

**Headers:**
```
Authorization: Bearer <token>
```

**Roles:** Admin, Staff

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

**Response Success (201):**
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
        "referenceId": "...",
        "name": "Khám nội khoa",
        "price": 200000,
        "quantity": 1
      },
      {
        "type": "test",
        "referenceId": "...",
        "name": "Xét nghiệm máu",
        "price": 150000,
        "quantity": 1
      }
    ],
    "totalAmount": 350000,
    "status": "unpaid",
    "createdAt": "..."
  }
}
```

---

### 3.2. Danh Sách Hóa Đơn
**Endpoint:** `GET /invoices`

**Headers:**
```
Authorization: Bearer <token>
```

**Roles:** Admin, Staff

**Query Params:**
```
patientId=string (optional)
status=paid|unpaid (optional)
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
    "invoices": [ ... ],
    "total": 100,
    "limit": 50,
    "skip": 0
  }
}
```

---

### 3.3. Chi Tiết Hóa Đơn
**Endpoint:** `GET /invoices/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Note:** Patient chỉ xem được hóa đơn của mình

**Response Success (200):**
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
    "paidBy": {
      "_id": "...",
      "fullName": "Nhân viên A",
      "role": "staff"
    }
  }
}
```

---

### 3.4. Thanh Toán Hóa Đơn
**Endpoint:** `PUT /invoices/:id/pay`

**Headers:**
```
Authorization: Bearer <token>
```

**Roles:** Admin, Staff

**Response Success (200):**
```json
{
  "status": true,
  "message": "Thanh toán hóa đơn thành công",
  "data": {
    "_id": "...",
    "status": "paid",
    "paidAt": "2024-12-17T01:20:00Z",
    "paidBy": { ... }
  }
}
```

---

### 3.5. Lịch Sử Hóa Đơn Của Bệnh Nhân
**Endpoint:** `GET /invoices/patient/:patientId`

**Headers:**
```
Authorization: Bearer <token>
```

**Note:** Patient chỉ xem được hóa đơn của mình

**Query Params:**
```
status=paid|unpaid (optional)
limit=number (optional, default: 50)
skip=number (optional, default: 0)
```

**Response Success (200):**
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

### 3.6. Thống Kê Doanh Thu
**Endpoint:** `GET /invoices/statistics`

**Headers:**
```
Authorization: Bearer <token>
```

**Roles:** Admin, Staff

**Query Params:**
```
period=daily|monthly|yearly (optional, default: monthly)
fromDate=YYYY-MM-DD (optional)
toDate=YYYY-MM-DD (optional)
```

**Response Success (200):**
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
      },
      {
        "month": "2024-11",
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

## 📊 Tổng Kết Phase 1

| Module | Số Lượng API | Status |
|--------|--------------|--------|
| Services Management | 6 | ✅ Complete |
| Test Results | 5 | ✅ Complete |
| Invoice & Payment | 6 | ✅ Complete |
| **TỔNG CỘNG** | **17 APIs** | ✅ **Complete** |

---

## 🔑 Authentication & Authorization

### Authentication
Tất cả API đều yêu cầu authentication token trong header:
```
Authorization: Bearer <token>
```

### Authorization Rules

#### Services Management:
- **Create, Update, Delete**: Admin, Staff
- **Read**: All authenticated users

#### Test Results:
- **Create, Update**: Lab Nurse only
- **Read examination results**: Doctor, Lab Nurse, Staff, Admin
- **Read patient history**: All authenticated users (patient can only view own)

#### Invoice & Payment:
- **Create, Pay, List all, Statistics**: Admin, Staff
- **Read specific invoice**: Patient (own only), Staff, Admin, Doctor
- **Read patient invoices**: Patient (own only), Staff, Admin

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

---

## 💡 Ví Dụ Quy Trình Hoàn Chỉnh

### 1. Tạo Dịch Vụ (Admin/Staff)
```bash
POST /services
{
  "name": "Khám nội khoa",
  "price": 200000,
  "serviceType": "examination"
}
```

### 2. Bác Sĩ Tạo Yêu Cầu Xét Nghiệm
```bash
POST /api/test-requests
{
  "examId": "...",
  "serviceId": "...",
  "testType": "Xét nghiệm máu",
  "labNurseId": "..."
}
```

### 3. Y Tá Tạo Kết Quả Xét Nghiệm
```bash
POST /test-results
{
  "testRequestId": "...",
  "resultData": {
    "hemoglobin": 14.5,
    "whiteBloodCells": 7000
  }
}
```

### 4. Nhân Viên Tạo Hóa Đơn
```bash
POST /invoices
{
  "examinationId": "...",
  "items": [
    { "type": "service", "referenceId": "serviceId1", "quantity": 1 },
    { "type": "test", "referenceId": "serviceId2", "quantity": 1 }
  ]
}
```

### 5. Nhân Viên Thanh Toán
```bash
PUT /invoices/:id/pay
```

### 6. Xem Thống Kê Doanh Thu
```bash
GET /invoices/statistics?period=monthly&fromDate=2024-01-01&toDate=2024-12-31
```
