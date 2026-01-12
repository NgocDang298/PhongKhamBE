const router = require('express').Router();
const testRequestController = require('../controllers/testRequest');
const { authenticate } = require('../middleware/auth');

// Tất cả các route test request đều yêu cầu xác thực
router.use('/api/test-requests', authenticate);

/**
 * @swagger
 * tags:
 *   name: TestRequests
 *   description: API yêu cầu xét nghiệm
 *   name: TestResults
 *   description: API kết quả xét nghiệm
 */

/**
 * @swagger
 * /api/test-requests:
 *   post:
 *     summary: 6.1. Tạo Yêu Cầu Xét Nghiệm
 *     tags: [TestRequests]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - examId
 *               - serviceId
 *               - testType
 *               - labNurseId
 *             properties:
 *               examId:
 *                 type: string
 *               serviceId:
 *                 type: string
 *               testType:
 *                 type: string
 *               labNurseId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tạo yêu cầu thành công
 *   get:
 *     summary: 6.5. Danh Sách Yêu Cầu Xét Nghiệm
 *     tags: [TestRequests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [waiting, processing, completed]
 *       - in: query
 *         name: labNurseId
 *         schema:
 *           type: string
 *       - in: query
 *         name: examId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Danh sách yêu cầu
 */
router.post('/api/test-requests', testRequestController.createTestRequest);
router.get('/api/test-requests', testRequestController.listTestRequests);

/**
 * @swagger
 * /api/test-requests/{id}:
 *   get:
 *     summary: 6.3. Lấy Chi Tiết Yêu Cầu Xét Nghiệm
 *     tags: [TestRequests]
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
 *         description: Chi tiết yêu cầu
 */
router.get('/api/test-requests/:id', testRequestController.getTestRequest);

/**
 * @swagger
 * /api/test-requests/{id}/status:
 *   put:
 *     summary: 6.4. Cập Nhật Trạng Thái Yêu Cầu
 *     tags: [TestRequests]
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
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [waiting, processing, completed]
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
router.put('/api/test-requests/:id/status', testRequestController.updateStatus);

/**
 * @swagger
 * /api/examinations/{examId}/test-requests:
 *   get:
 *     summary: 6.2. Lấy Yêu Cầu Xét Nghiệm Theo Ca Khám
 *     tags: [TestRequests]
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
 *         description: Danh sách yêu cầu theo ca khám
 */
router.get('/api/examinations/:examId/test-requests', testRequestController.getTestRequestsByExam);

// ===== TEST RESULTS ROUTES =====
const { authorize } = require('../middleware/auth');

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
 *               resultData:
 *                 type: object
 *                 properties:
 *                   hemoglobin:
 *                      type: number
 *                   whiteBloodCells:
 *                      type: number
 *                   platelets:
 *                      type: number
 *                   notes:
 *                      type: string
 *     responses:
 *       201:
 *         description: Tạo kết quả thành công
 */

router.post(
    '/test-results',
    authenticate,
    authorize(['labNurse']),
    testRequestController.createTestResult
);

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
router.get(
    '/test-results/:testRequestId',
    authenticate,
    testRequestController.getTestResult
);

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
 */
router.put(
    '/test-results/:id',
    authenticate,
    authorize(['labNurse']),
    testRequestController.updateTestResult
);

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
router.get(
    '/test-results/examination/:examId',
    authenticate,
    authorize(['doctor', 'labNurse', 'staff', 'admin']),
    testRequestController.getExaminationResults
);

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
 *     responses:
 *       200:
 *         description: Lịch sử xét nghiệm
 */
router.get(
    '/test-results/patient/:patientId',
    authenticate,
    testRequestController.getPatientTestHistory
);

/**
 * @swagger
 * /api/test-requests/{id}:
 *   put:
 *     summary: Cập Nhật Yêu Cầu Xét Nghiệm
 *     tags: [TestRequests]
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
 *               testType:
 *                 type: string
 *               labNurseId:
 *                 type: string
 *               serviceId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *   delete:
 *     summary: Xóa Yêu Cầu Xét Nghiệm (Chỉ Waiting)
 *     tags: [TestRequests]
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
router.put('/api/test-requests/:id', authenticate, authorize(['doctor', 'labNurse', 'admin']), testRequestController.updateTestRequest);
router.delete('/api/test-requests/:id', authenticate, authorize(['doctor', 'admin']), testRequestController.deleteTestRequest);

module.exports = router;

