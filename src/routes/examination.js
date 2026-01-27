const router = require('express').Router();
const examinationController = require('../controllers/examination');
const { authenticate } = require('../middleware/auth');

/// Tất cả các route examination đều yêu cầu xác thực
router.use('/examinations', authenticate);

/**
 * @swagger
 * tags:
 *   name: Examinations
 *   description: API quản lý khám bệnh
 */

/**
 * @swagger
 * /examinations/start:
 *   post:
 *     summary: 5.1. Bắt Đầu Ca Khám
 *     description: |
 *       Tạo ca khám mới từ lịch hẹn đã được xác nhận.
 *       - Tự động cập nhật trạng thái appointment sang 'in-progress'
 *       - Sử dụng transaction để đảm bảo tính nhất quán dữ liệu
 *       - staffId là tùy chọn: nếu không cung cấp, sẽ lấy từ appointment
 *     tags: [Examinations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - appointmentId
 *               - serviceId
 *             properties:
 *               appointmentId:
 *                 type: string
 *                 description: ID của lịch hẹn (phải có status 'confirmed')
 *                 example: "507f1f77bcf86cd799439011"
 *               serviceId:
 *                 type: string
 *                 description: ID của dịch vụ khám (phải đang hoạt động)
 *                 example: "507f1f77bcf86cd799439012"
 *               staffId:
 *                 type: string
 *                 description: ID của nhân viên (tùy chọn - nếu không cung cấp, sẽ lấy từ appointment)
 *                 example: "507f1f77bcf86cd799439013"
 *     responses:
 *       201:
 *         description: Ca khám đã được tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Bắt đầu ca khám thành công"
 *                 data:
 *                   type: object
 *                   description: Thông tin ca khám đã được populate đầy đủ
 *       400:
 *         description: Dữ liệu không hợp lệ, lịch hẹn chưa được xác nhận, hoặc thiếu staffId
 *       404:
 *         description: Không tìm thấy appointment, service, staff, doctor hoặc patient
 *       500:
 *         description: Lỗi server
 */
router.post('/examinations/start', examinationController.startExam);

/**
 * @swagger
 * /examinations/appointment/{appointmentId}:
 *   get:
 *     summary: 5.3. Lấy Ca Khám Theo Appointment
 *     tags: [Examinations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appointmentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thông tin ca khám
 */
router.get('/examinations/appointment/:appointmentId', examinationController.getExamByAppointment);

/**
 * @swagger
 * /examinations/{id}:
 *   get:
 *     summary: 5.2. Lấy Thông Tin Ca Khám
 *     tags: [Examinations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chi tiết ca khám
 *   put:
 *     summary: 5.5. Cập Nhật Ca Khám
 *     tags: [Examinations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               diagnosis:
 *                 type: string
 *               treatment:
 *                 type: string
 *               doctorNote:
 *                 type: string
 *               resultSummary:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
router.get('/examinations/:id', examinationController.getExam);
router.put('/examinations/:id', examinationController.updateExam);

/**
 * @swagger
 * /examinations:
 *   get:
 *     summary: 5.4. Danh Sách Ca Khám
 *     tags: [Examinations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [processing, done]
 *       - in: query
 *         name: doctorId
 *         schema:
 *           type: string
 *       - in: query
 *         name: patientId
 *         schema:
 *           type: string
 *       - in: query
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Danh sách ca khám
 */
router.get('/examinations', examinationController.listExams);

/**
 * @swagger
 * /examinations/{id}/complete:
 *   put:
 *     summary: 5.6. Hoàn Thành Ca Khám
 *     tags: [Examinations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               diagnosis:
 *                 type: string
 *               treatment:
 *                 type: string
 *               doctorNote:
 *                 type: string
 *               resultSummary:
 *                 type: string
 *     responses:
 *       200:
 *         description: Hoàn thành thành công
 */
router.put('/examinations/:id/complete', examinationController.completeExam);

/**
 * @swagger
 * /examinations/{id}/follow-up:
 *   post:
 *     summary: Tạo lịch hẹn tái khám (Internal)
 *     tags: [Examinations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Created follow-up
 */
router.post('/examinations/:id/follow-up', examinationController.createFollowUpAppointment);

/**
 * @swagger
 * /examinations/{id}:
 *   delete:
 *     summary: Xóa Ca Khám (Chỉ Processing)
 *     tags: [Examinations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Xóa thành công
 */
router.delete('/examinations/:id', examinationController.deleteExam);

module.exports = router;
