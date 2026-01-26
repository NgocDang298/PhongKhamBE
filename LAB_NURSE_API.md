# API Xét Nghiệm cho Lab Nurse

Tài liệu này mô tả chi tiết tất cả các API liên quan đến xét nghiệm mà role **`lab_nurse`** có thể sử dụng.

## 🔐 Authentication

Tất cả API đều yêu cầu header:
```
Authorization: Bearer <token>
```

---

## 📋 API Yêu Cầu Xét Nghiệm (Test Requests)

### 1. Tạo Yêu Cầu Xét Nghiệm

**Endpoint:** `POST /api/test-requests`

**Method:** `POST`

**Authorization:** Tất cả user đã xác thực

**Request Body:**
```json
{
  "examId": "507f1f77bcf86cd799439011",
  "serviceId": "507f1f77bcf86cd799439012",
  "testType": "Xét nghiệm máu",
  "labNurseId": "507f1f77bcf86cd799439013"
}
```

**Response Success (201):**
```json
{
  "status": true,
  "message": "Tạo yêu cầu xét nghiệm thành công",
  "data": {
    "_id": "507f1f77bcf86cd799439014",
    "examId": {
      "_id": "507f1f77bcf86cd799439011",
      "patientId": {...},
      "doctorId": {...}
    },
    "serviceId": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Xét nghiệm máu tổng quát",
      "price": 150000
    },
    "testType": "Xét nghiệm máu",
    "labNurseId": "507f1f77bcf86cd799439013",
    "status": "waiting",
    "createdAt": "2026-01-26T14:00:00.000Z"
  }
}
```

---

### 2. Lấy Danh Sách Yêu Cầu Xét Nghiệm

**Endpoint:** `GET /api/test-requests`

**Method:** `GET`

**Authorization:** Tất cả user đã xác thực

**Query Parameters:**
- `status` (optional): `waiting` | `processing` | `completed`
- `labNurseId` (optional): ID của lab nurse
- `examId` (optional): ID của ca khám
- `fromDate` (optional): Ngày bắt đầu (YYYY-MM-DD)
- `toDate` (optional): Ngày kết thúc (YYYY-MM-DD)
- `limit` (optional): Số lượng kết quả (default: 50)
- `skip` (optional): Bỏ qua số lượng (default: 0)

**Example Request:**
```
GET /api/test-requests?labNurseId=507f1f77bcf86cd799439013&status=waiting&limit=10
```

**Response Success (200):**
```json
{
  "status": true,
  "message": "Lấy danh sách yêu cầu xét nghiệm thành công",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "examId": {
        "_id": "507f1f77bcf86cd799439011",
        "patientId": {
          "fullName": "Nguyễn Văn A",
          "phone": "0123456789"
        }
      },
      "serviceId": {
        "name": "Xét nghiệm máu tổng quát",
        "price": 150000
      },
      "testType": "Xét nghiệm máu",
      "status": "waiting",
      "createdAt": "2026-01-26T14:00:00.000Z"
    }
  ]
}
```

---

### 3. Lấy Chi Tiết Yêu Cầu Xét Nghiệm

**Endpoint:** `GET /api/test-requests/:id`

**Method:** `GET`

**Authorization:** Tất cả user đã xác thực

**URL Parameters:**
- `id`: ID của yêu cầu xét nghiệm

**Example Request:**
```
GET /api/test-requests/507f1f77bcf86cd799439014
```

**Response Success (200):**
```json
{
  "status": true,
  "message": "Lấy thông tin yêu cầu xét nghiệm thành công",
  "data": {
    "_id": "507f1f77bcf86cd799439014",
    "examId": {
      "_id": "507f1f77bcf86cd799439011",
      "patientId": {
        "fullName": "Nguyễn Văn A",
        "phone": "0123456789",
        "dateOfBirth": "1990-01-01"
      },
      "doctorId": {
        "fullName": "BS. Trần Thị B",
        "specialty": "Nội khoa"
      }
    },
    "serviceId": {
      "name": "Xét nghiệm máu tổng quát",
      "price": 150000,
      "description": "Xét nghiệm các chỉ số máu cơ bản"
    },
    "testType": "Xét nghiệm máu",
    "labNurseId": {
      "_id": "507f1f77bcf86cd799439013",
      "fullName": "Y tá Lê Văn C"
    },
    "status": "waiting",
    "createdAt": "2026-01-26T14:00:00.000Z",
    "updatedAt": "2026-01-26T14:00:00.000Z"
  }
}
```

---

### 4. Cập Nhật Trạng Thái Yêu Cầu

**Endpoint:** `PUT /api/test-requests/:id/status`

**Method:** `PUT`

**Authorization:** Tất cả user đã xác thực

**URL Parameters:**
- `id`: ID của yêu cầu xét nghiệm

**Request Body:**
```json
{
  "status": "processing"
}
```

**Allowed Status Values:**
- `waiting`: Đang chờ xử lý
- `processing`: Đang xử lý
- `completed`: Đã hoàn thành

**Response Success (200):**
```json
{
  "status": true,
  "message": "Cập nhật trạng thái yêu cầu xét nghiệm thành công",
  "data": {
    "_id": "507f1f77bcf86cd799439014",
    "status": "processing",
    "updatedAt": "2026-01-26T14:30:00.000Z"
  }
}
```

---

### 5. Lấy Yêu Cầu Theo Ca Khám

**Endpoint:** `GET /api/examinations/:examId/test-requests`

**Method:** `GET`

**Authorization:** Tất cả user đã xác thực

**URL Parameters:**
- `examId`: ID của ca khám

**Example Request:**
```
GET /api/examinations/507f1f77bcf86cd799439011/test-requests
```

**Response Success (200):**
```json
{
  "status": true,
  "message": "Lấy danh sách yêu cầu xét nghiệm thành công",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "testType": "Xét nghiệm máu",
      "status": "waiting",
      "serviceId": {
        "name": "Xét nghiệm máu tổng quát",
        "price": 150000
      },
      "labNurseId": {
        "fullName": "Y tá Lê Văn C"
      }
    }
  ]
}
```

---

### 6. Cập Nhật Yêu Cầu Xét Nghiệm

**Endpoint:** `PUT /api/test-requests/:id`

**Method:** `PUT`

**Authorization:** `doctor`, `labNurse`, `admin`

**URL Parameters:**
- `id`: ID của yêu cầu xét nghiệm

**Request Body:**
```json
{
  "testType": "Xét nghiệm máu nâng cao",
  "labNurseId": "507f1f77bcf86cd799439015",
  "serviceId": "507f1f77bcf86cd799439016"
}
```

**Response Success (200):**
```json
{
  "status": true,
  "message": "Cập nhật yêu cầu xét nghiệm thành công",
  "data": {
    "_id": "507f1f77bcf86cd799439014",
    "testType": "Xét nghiệm máu nâng cao",
    "labNurseId": "507f1f77bcf86cd799439015",
    "serviceId": "507f1f77bcf86cd799439016",
    "updatedAt": "2026-01-26T15:00:00.000Z"
  }
}
```

---

### 7. Xóa Yêu Cầu Xét Nghiệm

**Endpoint:** `DELETE /api/test-requests/:id`

**Method:** `DELETE`

**Authorization:** `doctor`, `admin`

**URL Parameters:**
- `id`: ID của yêu cầu xét nghiệm

**Note:** Chỉ có thể xóa yêu cầu có status = `waiting`

**Response Success (200):**
```json
{
  "status": true,
  "message": "Xóa yêu cầu xét nghiệm thành công"
}
```

---

## 🧪 API Kết Quả Xét Nghiệm (Test Results)

### 8. Tạo Kết Quả Xét Nghiệm (Có Upload Hình Ảnh)

**Endpoint:** `POST /test-results`

**Method:** `POST`

**Authorization:** `labNurse`, `admin`

**Content-Type:** `multipart/form-data`

**Form Data:**
- `testRequestId` (string, required): ID của yêu cầu xét nghiệm
- `resultData` (string/JSON, required): Dữ liệu kết quả (có thể là JSON string)
- `images` (file[], optional): Tối đa 5 hình ảnh (jpg, png, jpeg, pdf)

**Example Request (using FormData):**
```javascript
const formData = new FormData();
formData.append('testRequestId', '507f1f77bcf86cd799439014');
formData.append('resultData', JSON.stringify({
  hemoglobin: 14.5,
  whiteBloodCells: 7500,
  platelets: 250000,
  notes: "Các chỉ số trong giới hạn bình thường"
}));
formData.append('images', file1); // File object
formData.append('images', file2); // File object
```

**Response Success (201):**
```json
{
  "status": true,
  "message": "Tạo kết quả xét nghiệm thành công",
  "data": {
    "_id": "507f1f77bcf86cd799439020",
    "testRequestId": {
      "_id": "507f1f77bcf86cd799439014",
      "testType": "Xét nghiệm máu",
      "examId": {
        "patientId": {
          "fullName": "Nguyễn Văn A"
        }
      }
    },
    "labNurseId": {
      "_id": "507f1f77bcf86cd799439013",
      "fullName": "Y tá Lê Văn C"
    },
    "resultData": {
      "hemoglobin": 14.5,
      "whiteBloodCells": 7500,
      "platelets": 250000,
      "notes": "Các chỉ số trong giới hạn bình thường"
    },
    "images": [
      "https://res.cloudinary.com/xxx/clinic/test-results/abc123.jpg",
      "https://res.cloudinary.com/xxx/clinic/test-results/def456.jpg"
    ],
    "performedAt": "2026-01-26T15:30:00.000Z",
    "createdAt": "2026-01-26T15:30:00.000Z"
  }
}
```

---

### 9. Lấy Kết Quả Theo Test Request

**Endpoint:** `GET /test-results/:testRequestId`

**Method:** `GET`

**Authorization:** Tất cả user đã xác thực

**URL Parameters:**
- `testRequestId`: ID của yêu cầu xét nghiệm

**Example Request:**
```
GET /test-results/507f1f77bcf86cd799439014
```

**Response Success (200):**
```json
{
  "status": true,
  "message": "Lấy kết quả xét nghiệm thành công",
  "data": {
    "_id": "507f1f77bcf86cd799439020",
    "testRequestId": {
      "_id": "507f1f77bcf86cd799439014",
      "testType": "Xét nghiệm máu",
      "examId": {
        "patientId": {
          "fullName": "Nguyễn Văn A",
          "phone": "0123456789"
        },
        "doctorId": {
          "fullName": "BS. Trần Thị B"
        }
      },
      "serviceId": {
        "name": "Xét nghiệm máu tổng quát",
        "price": 150000
      }
    },
    "labNurseId": {
      "fullName": "Y tá Lê Văn C"
    },
    "resultData": {
      "hemoglobin": 14.5,
      "whiteBloodCells": 7500,
      "platelets": 250000,
      "notes": "Các chỉ số trong giới hạn bình thường"
    },
    "images": [
      "https://res.cloudinary.com/xxx/clinic/test-results/abc123.jpg"
    ],
    "performedAt": "2026-01-26T15:30:00.000Z"
  }
}
```

---

### 10. Cập Nhật Kết Quả Xét Nghiệm (Có Upload Hình Ảnh)

**Endpoint:** `PUT /test-results/:id`

**Method:** `PUT`

**Authorization:** `labNurse`, `admin`

**Content-Type:** `multipart/form-data`

**URL Parameters:**
- `id`: ID của kết quả xét nghiệm

**Form Data:**
- `resultData` (string/JSON, optional): Dữ liệu kết quả mới
- `images` (file[], optional): Hình ảnh mới (sẽ thay thế hình ảnh cũ)

**Example Request:**
```javascript
const formData = new FormData();
formData.append('resultData', JSON.stringify({
  hemoglobin: 15.0,
  whiteBloodCells: 8000,
  platelets: 260000,
  notes: "Đã cập nhật kết quả"
}));
formData.append('images', newFile1);
```

**Response Success (200):**
```json
{
  "status": true,
  "message": "Cập nhật kết quả xét nghiệm thành công",
  "data": {
    "_id": "507f1f77bcf86cd799439020",
    "resultData": {
      "hemoglobin": 15.0,
      "whiteBloodCells": 8000,
      "platelets": 260000,
      "notes": "Đã cập nhật kết quả"
    },
    "images": [
      "https://res.cloudinary.com/xxx/clinic/test-results/new123.jpg"
    ],
    "performedAt": "2026-01-26T16:00:00.000Z",
    "updatedAt": "2026-01-26T16:00:00.000Z"
  }
}
```

---

### 11. Xóa Kết Quả Xét Nghiệm

**Endpoint:** `DELETE /test-results/:id`

**Method:** `DELETE`

**Authorization:** `labNurse`, `admin`

**URL Parameters:**
- `id`: ID của kết quả xét nghiệm

**Note:** Khi xóa kết quả, trạng thái của test request sẽ tự động rollback về `processing`

**Response Success (200):**
```json
{
  "status": true,
  "message": "Xóa kết quả xét nghiệm thành công"
}
```

---

### 12. Lấy Kết Quả Theo Ca Khám

**Endpoint:** `GET /test-results/examination/:examId`

**Method:** `GET`

**Authorization:** `doctor`, `labNurse`, `staff`, `admin`

**URL Parameters:**
- `examId`: ID của ca khám

**Example Request:**
```
GET /test-results/examination/507f1f77bcf86cd799439011
```

**Response Success (200):**
```json
{
  "status": true,
  "message": "Lấy danh sách kết quả xét nghiệm của ca khám thành công",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439020",
      "testRequestId": {
        "testType": "Xét nghiệm máu",
        "serviceId": {
          "name": "Xét nghiệm máu tổng quát"
        }
      },
      "labNurseId": {
        "fullName": "Y tá Lê Văn C"
      },
      "resultData": {
        "hemoglobin": 14.5,
        "whiteBloodCells": 7500,
        "platelets": 250000
      },
      "images": [
        "https://res.cloudinary.com/xxx/clinic/test-results/abc123.jpg"
      ],
      "performedAt": "2026-01-26T15:30:00.000Z"
    }
  ]
}
```

---

### 13. Lấy Lịch Sử Xét Nghiệm Của Bệnh Nhân

**Endpoint:** `GET /test-results/patient/:patientId`

**Method:** `GET`

**Authorization:** Tất cả user đã xác thực

**URL Parameters:**
- `patientId`: ID của bệnh nhân

**Query Parameters:**
- `limit` (optional): Số lượng kết quả (default: 50)
- `skip` (optional): Bỏ qua số lượng (default: 0)
- `fromDate` (optional): Ngày bắt đầu (YYYY-MM-DD)
- `toDate` (optional): Ngày kết thúc (YYYY-MM-DD)

**Example Request:**
```
GET /test-results/patient/507f1f77bcf86cd799439010?limit=10&fromDate=2026-01-01
```

**Response Success (200):**
```json
{
  "status": true,
  "message": "Lấy lịch sử xét nghiệm của bệnh nhân thành công",
  "data": {
    "results": [
      {
        "_id": "507f1f77bcf86cd799439020",
        "testRequestId": {
          "testType": "Xét nghiệm máu",
          "examId": {
            "examDate": "2026-01-26T14:00:00.000Z",
            "doctorId": {
              "fullName": "BS. Trần Thị B"
            }
          },
          "serviceId": {
            "name": "Xét nghiệm máu tổng quát",
            "price": 150000
          }
        },
        "labNurseId": {
          "fullName": "Y tá Lê Văn C"
        },
        "resultData": {
          "hemoglobin": 14.5,
          "whiteBloodCells": 7500,
          "platelets": 250000
        },
        "images": [
          "https://res.cloudinary.com/xxx/clinic/test-results/abc123.jpg"
        ],
        "performedAt": "2026-01-26T15:30:00.000Z"
      }
    ],
    "total": 15,
    "limit": 10,
    "skip": 0
  }
}
```

---

## �️ API Upload File (Common)

### 14. Upload Hình Ảnh/Tài Liệu

**Endpoint:** `POST /upload`

**Method:** `POST`

**Authorization:** Tất cả user đã xác thực

**Content-Type:** `multipart/form-data`

**Form Data:**
- `files` (file[], required): Danh sách file cần upload (tối đa 10 file)

**Response Success (200):**
```json
{
  "status": true,
  "message": "Upload file thành công",
  "data": {
    "urls": [
      "https://res.cloudinary.com/xxx/clinic/test-results/abc123.jpg",
      "https://res.cloudinary.com/xxx/clinic/test-results/def456.jpg"
    ]
  }
}
```

---

## �📊 Workflow Chuẩn cho Lab Nurse

### Quy trình xử lý yêu cầu xét nghiệm:

1. **Xem danh sách yêu cầu được giao:**
   ```
   GET /api/test-requests?labNurseId={myId}&status=waiting
   ```

2. **Bắt đầu xử lý yêu cầu:**
   ```
   PUT /api/test-requests/{id}/status
   Body: { "status": "processing" }
   ```

3. **Thực hiện xét nghiệm và tạo kết quả:**
   ```
   POST /test-results
   FormData: {
     testRequestId: "...",
     resultData: {...},
     images: [file1, file2]
   }
   ```
   → Trạng thái test request tự động chuyển sang `completed`

4. **Cập nhật kết quả nếu cần:**
   ```
   PUT /test-results/{id}
   FormData: {
     resultData: {...},
     images: [newFile]
   }
   ```

---

## ⚠️ Error Responses

Tất cả API đều có thể trả về các lỗi sau:

**400 Bad Request:**
```json
{
  "status": false,
  "message": "Thông tin không hợp lệ"
}
```

**401 Unauthorized:**
```json
{
  "status": false,
  "message": "Unauthorized"
}
```

**403 Forbidden:**
```json
{
  "status": false,
  "message": "Forbidden"
}
```

**404 Not Found:**
```json
{
  "status": false,
  "message": "Không tìm thấy yêu cầu xét nghiệm"
}
```

**500 Internal Server Error:**
```json
{
  "status": false,
  "message": "Internal server error"
}
```

---

## 📝 Notes

- **Upload hình ảnh**: Sử dụng Cloudinary, tự động lưu vào folder `clinic/test-results`
- **Định dạng hình ảnh**: jpg, png, jpeg, pdf
- **Số lượng hình ảnh**: Tối đa 5 ảnh mỗi lần upload
- **resultData**: Có thể là bất kỳ object JSON nào, tùy thuộc vào loại xét nghiệm
- **Trạng thái tự động**: Khi tạo kết quả, test request tự động chuyển sang `completed`
- **Xóa kết quả**: Khi xóa kết quả, test request tự động rollback về `processing`

---

## 🔗 Base URL

```
http://localhost:8000
```

hoặc URL production của bạn.
