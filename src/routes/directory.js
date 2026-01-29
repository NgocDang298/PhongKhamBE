const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const directory = require('../controllers/directory');

/**
 * @swagger
 * tags:
 *   name: Directory
 *   description: API danh bạ (Bệnh nhân, Bác sĩ, Nhân viên)
 */

/**
 * @swagger
 * /patients:
 *   post:
 *     summary: 3.1. Tạo Bệnh Nhân Walk-in
 *     tags: [Directory]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - gender
 *               - dateOfBirth
 *               - address
 *               - phone
 *               - cccd
 *             properties:
 *               fullName:
 *                 type: string
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               address:
 *                 type: string
 *               phone:
 *                 type: string
 *               cccd:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tạo thành công
 *   get:
 *     summary: 3.2. Danh Sách Bệnh Nhân
 *     tags: [Directory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Tìm theo tên, CCCD, SĐT
 *     responses:
 *       200:
 *         description: Danh sách bệnh nhân
 */


router.post('/patients', authenticate, authorize(['admin', 'staff']), directory.createPatient);
router.get('/patients', authenticate, authorize(['admin', 'staff']), directory.listPatients);

/**
 * @swagger
 * /doctors:
 *   get:
 *     summary: 3.3. Danh Sách Bác Sĩ
 *     tags: [Directory]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách bác sĩ
 * /doctors/{id}:
 *   put:
 *     summary: Cập Nhật Thông Tin Bác Sĩ
 *     tags: [Directory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Doctor ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               address:
 *                 type: string
 *               cccd:
 *                 type: string
 *               specialty:
 *                 type: string
 *               degree:
 *                 type: string
 *               birthYear:
 *                 type: integer
 *               workExperience:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
router.get('/doctors', authenticate, authorize(['admin', 'staff']), directory.listDoctors);
router.put('/doctors/:id', authenticate, authorize(['admin']), directory.updateDoctor);

/**
 * @swagger
 * /staffs:
 *   get:
 *     summary: 3.4. Danh Sách Nhân Viên
 *     tags: [Directory]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách nhân viên
 * /staffs/{id}:
 *   put:
 *     summary: Cập Nhật Thông Tin Nhân Viên
 *     tags: [Directory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Staff ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               address:
 *                 type: string
 *               cccd:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
router.get('/staffs', authenticate, authorize(['admin', 'staff']), directory.listStaffs);
router.put('/staffs/:id', authenticate, authorize(['admin']), directory.updateStaff);

/**
 * @swagger
 * /nurses:
 *   get:
 *     summary: 3.5. Danh Sách Y Tá
 *     tags: [Directory]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách y tá
 * /nurses/{id}:
 *   put:
 *     summary: Cập Nhật Thông Tin Y Tá
 *     tags: [Directory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Nurse ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               address:
 *                 type: string
 *               cccd:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
router.get('/nurses', authenticate, authorize(['admin', 'staff', 'doctor']), directory.listNurses);
router.put('/nurses/:id', authenticate, authorize(['admin']), directory.updateNurse);

/**
 * @swagger
 * /patients/{id}:
 *   put:
 *     summary: Cập Nhật Thông Tin Bệnh Nhân
 *     tags: [Directory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Patient ID
 *     requestBody:
 *       required: true
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
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               cccd:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *   delete:
 *     summary: Xóa Bệnh Nhân (Soft Delete)
 *     tags: [Directory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Patient ID
 *     responses:
 *       200:
 *         description: Xóa thành công
 */
router.put('/patients/:id', authenticate, authorize(['admin', 'staff']), directory.updatePatient);
router.delete('/patients/:id', authenticate, authorize(['admin']), directory.deletePatient);

module.exports = router;














