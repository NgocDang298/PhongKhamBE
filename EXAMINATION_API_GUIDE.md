# API Hướng Dẫn: Quản Lý Ca Khám (Examination APIs)

## Tổng Quan

Các API này cho phép quản lý ca khám bệnh từ lúc bắt đầu đến khi hoàn thành. Tất cả các endpoint đều yêu cầu xác thực (authentication token).

## Base URL
```
http://localhost:3000/api/examinations
```

---

## 1. Bắt đầu Ca Khám

Tạo ca khám mới từ lịch hẹn đã được xác nhận.

**Endpoint:** `POST /api/examinations/start`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "appointmentId": "64abc123def456789012",
  "staffId": "64abc456def789012345",
  "serviceId": "64abc789def012345678"
}
```

**Tham số:**
- `appointmentId` (required): ID của lịch hẹn đã confirmed
- `staffId` (required): ID của nhân viên tạo ca khám
- `serviceId` (required): ID của dịch vụ khám

**Response Success (201):**
```json
{
  "status": true,
  "message": "Bắt đầu ca khám thành công",
  "data": {
    "_id": "64abc901def234567890",
    "appointmentId": {
      "_id": "64abc123def456789012",
      "appointmentDate": "2025-12-03T08:00:00.000Z",
      "note": "Đau đầu"
    },
    "doctorId": {
      "_id": "64abc234def567890123",
      "fullName": "BS. Nguyễn Văn A",
      "specialty": "Nội khoa"
    },
    "staffId": {
      "_id": "64abc456def789012345",
      "fullName": "Trần Thị B"
    },
    "serviceId": {
      "_id": "64abc789def012345678",
      "name": "Khám tổng quát",
      "price": 200000
    },
    "patientId": {
      "_id": "64abc567def890123456",
      "fullName": "Lê Văn C",
      "phone": "0901234567",
      "gender": "male",
      "dateOfBirth": "1990-05-15T00:00:00.000Z"
    },
    "examDate": "2025-12-03T07:37:48.000Z",
    "status": "processing",
    "createdAt": "2025-12-03T07:37:48.000Z",
    "updatedAt": "2025-12-03T07:37:48.000Z"
  }
}
```

**Response Error (400):**
```json
{
  "status": false,
  "message": "Lịch hẹn chưa được xác nhận"
}
```

**Response Error (404):**
```json
{
  "status": false,
  "message": "Không tìm thấy lịch hẹn"
}
```

---

## 2. Lấy Thông Tin Ca Khám Theo ID

**Endpoint:** `GET /api/examinations/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
- `id`: ID của ca khám

**Response Success (200):**
```json
{
  "status": true,
  "data": {
    "_id": "64abc901def234567890",
    "appointmentId": {
      "_id": "64abc123def456789012",
      "appointmentDate": "2025-12-03T08:00:00.000Z",
      "note": "Đau đầu"
    },
    "doctorId": {
      "_id": "64abc234def567890123",
      "fullName": "BS. Nguyễn Văn A",
      "specialty": "Nội khoa"
    },
    "staffId": {
      "_id": "64abc456def789012345",
      "fullName": "Trần Thị B"
    },
    "serviceId": {
      "_id": "64abc789def012345678",
      "name": "Khám tổng quát",
      "price": 200000,
      "description": "Khám sức khỏe tổng quát"
    },
    "patientId": {
      "_id": "64abc567def890123456",
      "fullName": "Lê Văn C",
      "phone": "0901234567",
      "gender": "male",
      "dateOfBirth": "1990-05-15T00:00:00.000Z",
      "address": "123 Đường ABC, TP.HCM",
      "cccd": "079090001234"
    },
    "examDate": "2025-12-03T07:37:48.000Z",
    "diagnosis": "Đau đầu do stress",
    "treatment": "Nghỉ ngơi, uống thuốc giảm đau",
    "doctorNote": "Bệnh nhân cần theo dõi thêm",
    "resultSummary": "Tình trạng ổn định",
    "status": "processing",
    "previousExamId": null,
    "createdAt": "2025-12-03T07:37:48.000Z",
    "updatedAt": "2025-12-03T08:00:00.000Z"
  }
}
```

**Response Error (404):**
```json
{
  "status": false,
  "message": "Không tìm thấy ca khám"
}
```

---

## 3. Lấy Ca Khám Theo Appointment ID

**Endpoint:** `GET /api/examinations/appointment/:appointmentId`

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
- `appointmentId`: ID của lịch hẹn

**Response:** Giống như endpoint lấy theo ID

---

## 4. Danh Sách Ca Khám

Lấy danh sách ca khám với các bộ lọc.

**Endpoint:** `GET /api/examinations`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters (tất cả optional):**
- `status`: Trạng thái ca khám (`processing` hoặc `done`)
- `doctorId`: Lọc theo ID bác sĩ
- `patientId`: Lọc theo ID bệnh nhân
- `fromDate`: Lọc từ ngày (ISO format: `2025-12-01`)
- `toDate`: Lọc đến ngày (ISO format: `2025-12-31`)
- `limit`: Số lượng kết quả (mặc định: 50)
- `skip`: Bỏ qua số lượng kết quả (mặc định: 0)

**Example Request:**
```
GET /api/examinations?status=processing&doctorId=64abc234def567890123&limit=10&skip=0
```

**Response Success (200):**
```json
{
  "status": true,
  "data": {
    "examinations": [
      {
        "_id": "64abc901def234567890",
        "appointmentId": "64abc123def456789012",
        "doctorId": {
          "_id": "64abc234def567890123",
          "fullName": "BS. Nguyễn Văn A",
          "specialty": "Nội khoa"
        },
        "staffId": {
          "_id": "64abc456def789012345",
          "fullName": "Trần Thị B"
        },
        "serviceId": {
          "_id": "64abc789def012345678",
          "name": "Khám tổng quát",
          "price": 200000
        },
        "patientId": {
          "_id": "64abc567def890123456",
          "fullName": "Lê Văn C",
          "phone": "0901234567"
        },
        "examDate": "2025-12-03T07:37:48.000Z",
        "status": "processing",
        "createdAt": "2025-12-03T07:37:48.000Z",
        "updatedAt": "2025-12-03T08:00:00.000Z"
      }
    ],
    "total": 1,
    "limit": 10,
    "skip": 0
  }
}
```

---

## 5. Cập Nhật Thông Tin Ca Khám

Cập nhật thông tin chẩn đoán, điều trị, ghi chú của ca khám đang xử lý.

**Endpoint:** `PUT /api/examinations/:id`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**URL Parameters:**
- `id`: ID của ca khám

**Request Body (tất cả optional):**
```json
{
  "diagnosis": "Đau đầu do stress và thiếu ngủ",
  "treatment": "Nghỉ ngơi đầy đủ, uống thuốc giảm đau theo chỉ định",
  "doctorNote": "Bệnh nhân cần theo dõi thêm 1 tuần",
  "resultSummary": "Tình trạng ổn định, không có dấu hiệu nghiêm trọng"
}
```

**Response Success (200):**
```json
{
  "status": true,
  "message": "Cập nhật ca khám thành công",
  "data": {
    "_id": "64abc901def234567890",
    "diagnosis": "Đau đầu do stress và thiếu ngủ",
    "treatment": "Nghỉ ngơi đầy đủ, uống thuốc giảm đau theo chỉ định",
    "doctorNote": "Bệnh nhân cần theo dõi thêm 1 tuần",
    "resultSummary": "Tình trạng ổn định, không có dấu hiệu nghiêm trọng",
    "status": "processing",
    ...
  }
}
```

**Response Error (400):**
```json
{
  "status": false,
  "message": "Không thể cập nhật ca khám đã hoàn thành"
}
```

---

## 6. Hoàn Thành Ca Khám

Đánh dấu ca khám là hoàn thành và cập nhật thông tin cuối cùng.

**Endpoint:** `PUT /api/examinations/:id/complete`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**URL Parameters:**
- `id`: ID của ca khám

**Request Body (tất cả optional):**
```json
{
  "diagnosis": "Đau đầu do stress và thiếu ngủ",
  "treatment": "Nghỉ ngơi đầy đủ, uống thuốc giảm đau theo chỉ định",
  "doctorNote": "Bệnh nhân đã khỏi, không cần tái khám",
  "resultSummary": "Hoàn thành khám, tình trạng tốt"
}
```

**Response Success (200):**
```json
{
  "status": true,
  "message": "Hoàn thành ca khám thành công",
  "data": {
    "_id": "64abc901def234567890",
    "diagnosis": "Đau đầu do stress và thiếu ngủ",
    "treatment": "Nghỉ ngơi đầy đủ, uống thuốc giảm đau theo chỉ định",
    "doctorNote": "Bệnh nhân đã khỏi, không cần tái khám",
    "resultSummary": "Hoàn thành khám, tình trạng tốt",
    "status": "done",
    ...
  }
}
```

**Response Error (400):**
```json
{
  "status": false,
  "message": "Ca khám đã được hoàn thành trước đó"
}
```

---

## Quy Trình Sử Dụng

### 1. Bắt đầu ca khám
```bash
POST /api/examinations/start
Body: { appointmentId, staffId, serviceId }
```

### 2. Cập nhật thông tin trong quá trình khám (có thể gọi nhiều lần)
```bash
PUT /api/examinations/:id
Body: { diagnosis, treatment, doctorNote, resultSummary }
```

### 3. Hoàn thành ca khám
```bash
PUT /api/examinations/:id/complete
Body: { diagnosis, treatment, doctorNote, resultSummary }
```

### 4. Xem lại thông tin ca khám
```bash
GET /api/examinations/:id
```

---

## Lưu Ý Quan Trọng

1. **Xác thực**: Tất cả các endpoint đều yêu cầu token xác thực trong header
2. **Appointment phải confirmed**: Chỉ có thể bắt đầu ca khám từ lịch hẹn đã được xác nhận
3. **Một appointment - một examination**: Mỗi lịch hẹn chỉ có thể tạo một ca khám
4. **Không sửa ca khám đã hoàn thành**: Sau khi đánh dấu `done`, không thể cập nhật
5. **Phân quyền**: Cần kiểm tra quyền của user (doctor, staff, admin) khi gọi API

---

## Mã Lỗi Phổ Biến

- `400`: Dữ liệu không hợp lệ hoặc vi phạm quy tắc nghiệp vụ
- `401`: Chưa xác thực hoặc token không hợp lệ
- `403`: Không có quyền truy cập
- `404`: Không tìm thấy tài nguyên
- `500`: Lỗi server

---

## Example cURL Commands

### Bắt đầu ca khám
```bash
curl -X POST http://localhost:3000/api/examinations/start \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "appointmentId": "64abc123def456789012",
    "staffId": "64abc456def789012345",
    "serviceId": "64abc789def012345678"
  }'
```

### Cập nhật ca khám
```bash
curl -X PUT http://localhost:3000/api/examinations/64abc901def234567890 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "diagnosis": "Đau đầu do stress",
    "treatment": "Nghỉ ngơi, uống thuốc"
  }'
```

### Hoàn thành ca khám
```bash
curl -X PUT http://localhost:3000/api/examinations/64abc901def234567890/complete \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "diagnosis": "Đau đầu do stress",
    "treatment": "Nghỉ ngơi, uống thuốc",
    "resultSummary": "Hoàn thành khám"
  }'
```

### Lấy danh sách ca khám
```bash
curl -X GET "http://localhost:3000/api/examinations?status=processing&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```
