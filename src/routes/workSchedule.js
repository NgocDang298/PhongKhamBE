const router = require('express').Router();
const workScheduleController = require('../controllers/workSchedule');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: WorkSchedules
 *   description: API lịch làm việc
 */

/**
 * @swagger
 * /work-schedules:
 *   post:
 *     summary: 10.1. Tạo Lịch Làm Việc
 *     tags: [WorkSchedules]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               doctorId:
 *                 type: string
 *               labNurseId:
 *                 type: string
 *               dayOfWeek:
 *                 type: integer
 *                 description: 0-6 (Sunday-Saturday) or 1-7 depending on system? Docs say 1. Let's assume standard.
 *               shiftStart:
 *                 type: string
 *                 example: "08:00"
 *               shiftEnd:
 *                 type: string
 *                 example: "12:00"
 *               note:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tạo thành công
 */
router.post(
    '/work-schedules',
    authenticate,
    authorize(['admin']),
    workScheduleController.createWorkSchedule
);

/**
 * @swagger
 * /work-schedules/available:
 *   get:
 *     summary: 10.6. Tìm Nhân Viên Có Lịch Làm Việc
 *     tags: [WorkSchedules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: dayOfWeek
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: time
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: role
 *         required: true
 *         schema:
 *           type: string
 *           enum: [doctor, nurse]
 *     responses:
 *       200:
 *         description: Danh sách nhân viên
 */
router.get(
    '/work-schedules/available',
    authenticate,
    workScheduleController.findAvailableStaff
);

/**
 * @swagger
 * /work-schedules/doctor/{doctorId}:
 *   get:
 *     summary: 10.2. Lấy Lịch Làm Việc Của Bác Sĩ
 *     tags: [WorkSchedules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lịch làm việc
 */
router.get(
    '/work-schedules/doctor/:doctorId',
    authenticate,
    workScheduleController.getDoctorSchedule
);

/**
 * @swagger
 * /work-schedules/nurse/{nurseId}:
 *   get:
 *     summary: 10.3. Lấy Lịch Làm Việc Của Y Tá
 *     tags: [WorkSchedules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: nurseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lịch làm việc
 */
router.get(
    '/work-schedules/nurse/:nurseId',
    authenticate,
    workScheduleController.getNurseSchedule
);

/**
 * @swagger
 * /work-schedules/{id}:
 *   put:
 *     summary: 10.4. Cập Nhật Lịch Làm Việc
 *     tags: [WorkSchedules]
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
 *               dayOfWeek:
 *                 type: integer
 *               shiftStart:
 *                 type: string
 *               shiftEnd:
 *                 type: string
 *               note:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *   delete:
 *     summary: 10.5. Xóa Lịch Làm Việc
 *     tags: [WorkSchedules]
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
router.put(
    '/work-schedules/:id',
    authenticate,
    authorize(['admin']),
    workScheduleController.updateWorkSchedule
);

router.delete(
    '/work-schedules/:id',
    authenticate,
    authorize(['admin']),
    workScheduleController.deleteWorkSchedule
);

module.exports = router;
