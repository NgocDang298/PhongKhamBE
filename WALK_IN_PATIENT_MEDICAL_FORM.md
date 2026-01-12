# 📋 FORM THU THẬP THÔNG TIN Y TẾ - BỆNH NHÂN WALK-IN

## 🎯 Mục đích
Thu thập thông tin y tế cơ bản để đảm bảo an toàn khi khám bệnh và kê đơn thuốc.

## ⏱️ Thời gian: 2-3 phút

## 📝 Câu hỏi bắt buộc:

### 1. 💊 Dị ứng thuốc
**Hỏi:** "Anh/chị có bị dị ứng thuốc gì không?"
- ✅ Không có → `["Không có"]`
- ❌ Có → Ghi rõ tên thuốc: `["Penicillin", "Aspirin"]`

### 2. 💉 Thuốc đang sử dụng
**Hỏi:** "Anh/chị đang uống thuốc gì thường xuyên không?"
- ✅ Không có → `["Không có"]`
- ❌ Có → Ghi tên + liều: `["Metformin 500mg", "Amlodipine 5mg"]`

### 3. 🏥 Bệnh mãn tính
**Hỏi:** "Anh/chị có bị tiểu đường, cao huyết áp, tim mạch không?"
- ✅ Không có → `["Không có"]`
- ❌ Có → `["Diabetes Type 2", "Hypertension"]`

### 4. 🩸 Nhóm máu (tùy chọn)
**Hỏi:** "Anh/chị có biết nhóm máu của mình không?"
- ✅ Biết → `"A+"`, `"B-"`, `"O+"`, `"AB-"`
- ❌ Không biết → `null`

## 🔧 API Request Example:

### Trường hợp 1: Bệnh nhân khỏe mạnh
```json
POST /patients/with-medical-profile
{
  "fullName": "Nguyễn Văn A",
  "gender": "male",
  "dateOfBirth": "1990-01-01",
  "address": "123 ABC Street",
  "phone": "0901234567",
  "cccd": "001234567890",
  "medicalInfo": {
    "allergies": ["Không có"],
    "medications": ["Không có"],
    "chronicDiseases": ["Không có"],
    "bloodType": null,
    "notes": "Bệnh nhân tự báo không có vấn đề sức khỏe đặc biệt"
  }
}
```

### Trường hợp 2: Bệnh nhân có bệnh nền
```json
POST /patients/with-medical-profile
{
  "fullName": "Trần Thị B",
  "gender": "female",
  "dateOfBirth": "1975-05-15",
  "address": "456 XYZ Street",
  "phone": "0901234568",
  "cccd": "001234567891",
  "medicalInfo": {
    "allergies": ["Penicillin"],
    "medications": ["Metformin 500mg sáng tối", "Amlodipine 5mg sáng"],
    "chronicDiseases": ["Diabetes Type 2", "Hypertension"],
    "bloodType": "A+",
    "notes": "Bệnh nhân kiểm soát đường huyết tốt, huyết áp ổn định"
  }
}
```

## ⚠️ Lưu ý quan trọng:

1. **Luôn hỏi về dị ứng thuốc** - Rất quan trọng cho an toàn
2. **Ghi rõ tên thuốc** - Không viết tắt
3. **Xác nhận lại** - "Vậy anh/chị chỉ dị ứng Penicillin thôi đúng không?"
4. **Ghi chú thêm** - Nếu bệnh nhân cung cấp thông tin bổ sung

## 🎯 Kết quả:
- ✅ Patient record được tạo
- ✅ Medical Profile cơ bản được tạo
- ✅ Bác sĩ có thông tin an toàn để khám bệnh
- ✅ Có thể cập nhật thêm thông tin sau