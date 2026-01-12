const router = require('express').Router();
const profileController = require('../controllers/profile');
const { authenticate } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Profile
 *   description: API quản lý thông tin cá nhân
 */

/**
 * @swagger
 * /profile/me:
 *   get:
 *     summary: 11.1. Lấy Thông Tin Profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thông tin profile
 *   put:
 *     summary: 11.2. Cập Nhật Profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
router.get(
    '/profile/me',
    authenticate,
    profileController.getMyProfile
);

router.put(
    '/profile/me',
    authenticate,
    profileController.updateMyProfile
);

/**
 * @swagger
 * /profile/avatar:
 *   put:
 *     summary: 11.3. Upload Avatar
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       501:
 *         description: Chưa triển khai
 */
router.put(
    '/profile/avatar',
    authenticate,
    profileController.uploadAvatar
);

/**
 * @swagger
 * /profile/medical-history:
 *   get:
 *     summary: 11.4. Lấy Lịch Sử Khám Bệnh
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lịch sử khám bệnh
 */
router.get(
    '/profile/medical-history',
    authenticate,
    profileController.getMedicalHistory
);

/**
 * @swagger
 * /profile/appointments:
 *   get:
 *     summary: 11.5. Lấy Danh Sách Lịch Hẹn Của Mình
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, cancelled]
 *     responses:
 *       200:
 *         description: Danh sách lịch hẹn
 */
router.get(
    '/profile/appointments',
    authenticate,
    profileController.getMyAppointments
);

/**
 * @swagger
 * /profile/examinations:
 *   get:
 *     summary: 11.6. Lấy Danh Sách Ca Khám Của Mình (Doctor)
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
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
router.get(
    '/profile/examinations',
    authenticate,
    profileController.getMyExaminations
);

module.exports = router;
