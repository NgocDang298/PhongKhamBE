const router = require("express").Router();
const testRequestController = require("../controllers/testRequest");
const { authenticate, authorize } = require("../middleware/auth");

// Tất cả các route test request đều yêu cầu xác thực
router.use("/test-requests", authenticate);

/**
 * @swagger
 * tags:
 *   - name: TestRequests
 *     description: API yêu cầu xét nghiệm
 *   - name: TestResults
 *     description: API kết quả xét nghiệm
 */

/**
 * @swagger
 * /test-requests:
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
router.post("/test-requests", testRequestController.createTestRequest);
router.get("/test-requests", testRequestController.listTestRequests);

/**
 * @swagger
 * /test-requests/{id}:
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
router.get("/test-requests/:id", testRequestController.getTestRequest);

/**
 * @swagger
 * /test-requests/{id}/status:
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
router.put("/test-requests/:id/status", testRequestController.updateStatus);

/**
 * @swagger
 * /examinations/{examId}/test-requests:
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
router.get(
  "/examinations/:examId/test-requests",
  testRequestController.getTestRequestsByExam
);



/**
 * @swagger
 * /test-requests/{id}:
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
router.put(
  "/test-requests/:id",
  authenticate,
  authorize(["doctor", "lab_nurse", "admin"]),
  testRequestController.updateTestRequest
);
router.delete(
  "/test-requests/:id",
  authenticate,
  authorize(["doctor", "admin"]),
  testRequestController.deleteTestRequest
);

module.exports = router;
