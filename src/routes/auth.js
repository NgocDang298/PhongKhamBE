const router = require('express').Router();
const auth = require('../controllers/auth');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: API quản lý xác thực và tài khoản
 */

/**
 * @swagger
 * /auth/register/patient:
 *   post:
 *     summary: 1.1. Đăng Ký Tài Khoản (Bệnh nhân)
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *               - fullName
 *               - email
 *               - phone
 *               - gender
 *               - dateOfBirth
 *               - address
 *               - cccd
 *             properties:
 *               password:
 *                 type: string
 *               fullName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *                 example: 1990-01-01
 *               address:
 *                 type: string
 *               cccd:
 *                 type: string
 *     responses:
 *       200:
 *         description: Đăng ký thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 */
router.post('/register/patient', auth.registerPatient); // Bệnh nhân tự đăng ký

/**
 * @swagger
 * /auth/register/admin:
 *   post:
 *     summary: 1.5. Tạo Tài Khoản Admin (Public)
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *               - email
 *               - sdt
 *               - cccd
 *             properties:
 *               password:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               sdt:
 *                 type: string
 *               cccd:
 *                 type: string
 *     responses:
 *       200:
 *         description: Đăng ký admin thành công
 */
router.post('/register/admin', auth.registerAdmin); // Tạo admin (WARNING: Public endpoint - disable after first admin)

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: 1.2. Đăng Nhập
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cccd
 *               - password
 *             properties:
 *               cccd:
 *                 type: string
 *                 description: Số CCCD dùng để đăng nhập
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Đăng nhập thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *                 message:
 *                   type: string
 *                   example: "Đăng nhập thành công"
 */
router.post('/login', auth.login);


// Protected routes

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: 1.1. Đăng Ký Tài Khoản (Admin tạo Doctor/Staff/Nurse)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *               - fullName
 *               - email
 *               - phone
 *               - role
 *             properties:
 *               password:
 *                 type: string
 *               fullName:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               gender:
 *                 type: string
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               address:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [doctor, staff, labNurse]
 *               specialty:
 *                 type: string
 *                 description: For Doctor
 *               degree:
 *                 type: string
 *                 description: For Doctor
 *               cccd:
 *                 type: string
 *                 description: For Staff/Nurse
 *     responses:
 *       200:
 *         description: Tạo tài khoản thành công
 */
router.post('/register', authenticate, authorize(['admin']), auth.register); // Admin đăng ký cho staff/doctor/nurse

/**
 * @swagger
 * /auth/change-password:
 *   put:
 *     summary: 1.3. Đổi Mật Khẩu
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Đổi mật khẩu thành công
 */
router.put('/change-password', authenticate, auth.changePassword);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: 1.4. Đăng Xuất
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Đăng xuất thành công
 */
router.post('/logout', authenticate, auth.logout);

module.exports = router;
