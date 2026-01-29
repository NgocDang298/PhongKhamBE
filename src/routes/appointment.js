const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const appointment = require('../controllers/appointment');

/**
 * @swagger
 * tags:
 *   name: Appointments
 *   description: API quản lý lịch hẹn
 */

/**
 * @swagger
 * /appointments:
 *   post:
 *     summary: 2.1. Tạo Lịch Hẹn
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - appointmentDate
 *             properties:
 *               doctorId:
 *                 type: string
 *               appointmentDate:
 *                 type: string
 *                 format: date-time
 *                 example: 2024-12-17T09:00:00.000Z
 *               note:
 *                 type: string
 *               patientId:
 *                 type: string
 *                 description: Required if staff/admin creates for patient
 *     responses:
 *       200:
 *         description: Tạo lịch hẹn thành công
 *   get:
 *     summary: 2.2. Danh Sách Lịch Hẹn
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, cancelled]
 *         description: Trạng thái lịch hẹn
 *     responses:
 *       200:
 *         description: Danh sách lịch hẹn
 */
router.post('/appointments', authenticate, appointment.create);
router.get('/appointments', authenticate, appointment.list);

/**
 * @swagger
 * /appointments/slots:
 *   get:
 *     summary: 2.3. Lấy Slots Có Sẵn
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *           example: 2024-12-17
 *         required: true
 *       - in: query
 *         name: doctorId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Danh sách slots
 */
router.get('/appointments/slots', authenticate, appointment.getSlots);

/**
 * @swagger
 * /appointments/{id}/confirm:
 *   post:
 *     summary: 2.4. Xác Nhận Lịch Hẹn (Staff/Admin)
 *     tags: [Appointments]
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
 *         description: Xác nhận thành công
 */
router.post('/appointments/:id/confirm', authenticate, appointment.confirm);

/**
 * @swagger
 * /appointments/{id}/cancel:
 *   post:
 *     summary: 2.5. Hủy Lịch Hẹn
 *     tags: [Appointments]
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
 *         description: Hủy thành công
 */
router.post('/appointments/:id/cancel', authenticate, appointment.cancel);

/**
 * @swagger
 * /appointments/{id}/reject:
 *   post:
 *     summary: 2.6. Từ Chối Lịch Hẹn (Staff/Admin)
 *     tags: [Appointments]
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
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Từ chối thành công
 */
router.post('/appointments/:id/reject', authenticate, appointment.reject);

/**
 * @swagger
 * /appointments/{id}/suggested-slots:
 *   get:
 *     summary: 2.7. Lấy Slots Gợi Ý
 *     tags: [Appointments]
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
 *         description: Danh sách slots gợi ý
 */
router.get('/appointments/:id/suggested-slots', authenticate, appointment.getSuggestedSlots);

/**
 * @swagger
 * /appointments/doctors:
 *   get:
 *     summary: 2.8. Danh Sách Bác Sĩ
 *     tags: [Appointments]
 *     responses:
 *       200:
 *         description: Danh sách bác sĩ
 */
router.get('/appointments/doctors', authenticate, appointment.listDoctors);

/**
 * @swagger
 * /appointments/specialties:
 *   get:
 *     summary: 2.13. Lấy Danh Sách Chuyên Khoa
 *     tags: [Appointments]
 *     responses:
 *       200:
 *         description: Danh sách chuyên khoa bác sĩ
 */
router.get('/appointments/specialties', authenticate, appointment.listSpecialties);

/**
 * @swagger
 * /appointments/doctors/available-dates:
 *   get:
 *     summary: 2.9. Ngày Trống Theo Bác Sĩ
 *     tags: [Appointments]
 *     parameters:
 *       - in: query
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Danh sách ngày trống
 */
router.get('/appointments/doctors/available-dates', authenticate, appointment.getAvailableDatesByDoctor);

/**
 * @swagger
 * /appointments/doctors/available-slots:
 *   get:
 *     summary: 2.10. Slots Trống Theo Bác Sĩ và Ngày
 *     tags: [Appointments]
 *     parameters:
 *       - in: query
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Danh sách slots trống
 */
router.get('/appointments/doctors/available-slots', authenticate, appointment.getAvailableSlotsByDoctorAndDate);

/**
 * @swagger
 * /appointments/doctors:
 *   post:
 *     summary: 2.11. Tạo Lịch Hẹn Theo Bác Sĩ
 *     tags: [Appointments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - doctorId
 *               - appointmentDate
 *             properties:
 *               doctorId:
 *                 type: string
 *               appointmentDate:
 *                 type: string
 *                 format: date-time
 *               note:
 *                 type: string
 *     responses:
 *       200:
 *         description: Tạo lịch hẹn thành công
 */
router.post('/appointments/doctors', authenticate, appointment.createAppointmentByDoctor);

/**
 * @swagger
 * /appointments/auto-assign:
 *   post:
 *     summary: 2.12. Đặt Lịch Tự Động (Không Cần Chọn Bác Sĩ)
 *     description: Hệ thống sẽ tự động chọn bác sĩ có lịch làm việc, có slot trống và ít lịch hẹn nhất
 *     tags: [Appointments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - appointmentDate
 *               - specialty
 *             properties:
 *               appointmentDate:
 *                 type: string
 *                 format: date-time
 *                 example: 2024-12-17T09:00:00.000Z
 *               specialty:
 *                 type: string
 *                 example: Nội Khoa
 *               note:
 *                 type: string
 *                 description: Ghi chú (optional)
 *               patientId:
 *                 type: string
 *                 description: ID bệnh nhân (chỉ dành cho staff/admin)
 *     responses:
 *       200:
 *         description: Đặt lịch thành công, hệ thống đã tự động chọn bác sĩ
 *       404:
 *         description: Không tìm thấy bác sĩ phù hợp hoặc không có slot trống
 */
router.post('/appointments/auto-assign', authenticate, appointment.createAppointmentAutoAssign);

/**
 * @swagger
 * /appointments/{id}:
 *   put:
 *     summary: Cập Nhật Lịch Hẹn
 *     tags: [Appointments]
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
 *               appointmentDate:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, cancelled]
 *               note:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *   delete:
 *     summary: Xóa Lịch Hẹn
 *     tags: [Appointments]
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
router.put('/appointments/:id', authenticate, authorize(['admin', 'staff']), appointment.updateAppointment);
router.delete('/appointments/:id', authenticate, authorize(['admin', 'staff']), appointment.deleteAppointment);

module.exports = router;
