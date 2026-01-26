const router = require('express').Router();

// Các route xác thực
router.use(require('./auth'));

// Các route lịch hẹn
router.use(require('./appointment'));

// Các route danh mục người dùng (bệnh nhân, bác sĩ, nhân viên, y tá)
router.use(require('./directory'));

// Hồ sơ khám bệnh của bệnh nhân
router.use(require('./medicalProfile'));

// Các route ca khám
router.use(require('./examination'));

// Các route yêu cầu xét nghiệm
router.use(require('./testRequest'));

// Các route kết quả xét nghiệm
router.use(require('./testResult'));

// Các route quản lý dịch vụ
router.use(require('./service'));

// Các route hóa đơn và thanh toán
router.use(require('./invoice'));

// Các route lịch làm việc
router.use(require('./workSchedule'));

// Các route quản lý profile
router.use(require('./profile'));

// Các route quản lý tài khoản
router.use(require('./account'));

// Route upload file
router.use(require('./upload'));

module.exports = router;