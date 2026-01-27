const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const testResult = require('../controllers/testResult');
const upload = require('../middleware/upload');

/**
 * @swagger
 * tags:
 *   name: TestResults
 *   description: API kết quả xét nghiệm
 */

/**
 * @swagger
 * /test-results:
 *   post:
 *     summary: 7.1. Tạo Kết Quả Xét Nghiệm
 *     tags: [TestResults]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - testRequestId
 *               - resultData
 *             properties:
 *               testRequestId:
 *                 type: string
 *                 description: ID của yêu cầu xét nghiệm
 *               resultData:
 *                 type: object
 *                 description: Dữ liệu kết quả xét nghiệm
 *               labNurseId:
 *                 type: string
 *                 description: ID của y tá xét nghiệm (tùy chọn - nếu không cung cấp, sẽ lấy từ user đang đăng nhập)
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Mảng URLs của hình ảnh kết quả
 *     responses:
 *       201:
 *         description: Tạo thành công
 */
router.post('/test-results', authenticate, authorize(['lab_nurse', 'admin']), upload.array('images', 5), testResult.create);

/**
 * @swagger
 * /test-results/examination/{examId}:
 *   get:
 *     summary: 7.4. Kết Quả Xét Nghiệm Của Ca Khám
 *     tags: [TestResults]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: examId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Danh sách kết quả
 */
router.get('/test-results/examination/:examId', authenticate, testResult.getByExamination);

/**
 * @swagger
 * /test-results/patient/{patientId}:
 *   get:
 *     summary: 7.5. Lịch Sử Xét Nghiệm Của Bệnh Nhân
 *     tags: [TestResults]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
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
 *         description: Lịch sử xét nghiệm
 */
router.get('/test-results/patient/:patientId', authenticate, testResult.getPatientHistory);

/**
 * @swagger
 * /test-results/{testRequestId}:
 *   get:
 *     summary: 7.2. Lấy Kết Quả Theo Test Request
 *     tags: [TestResults]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: testRequestId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chi tiết kết quả
 */
router.get('/test-results/:testRequestId', authenticate, testResult.getByRequestId);

/**
 * @swagger
 * /test-results/{id}:
 *   put:
 *     summary: 7.3. Cập Nhật Kết Quả Xét Nghiệm
 *     tags: [TestResults]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               resultData:
 *                 type: object
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *   delete:
 *     summary: Xóa Kết Quả Xét Nghiệm
 *     tags: [TestResults]
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
router.put('/test-results/:id', authenticate, authorize(['admin', 'lab_nurse']), upload.array('images', 5), testResult.update);
router.delete('/test-results/:id', authenticate, authorize(['admin']), testResult.delete);



module.exports = router;
