const router = require('express').Router();
const invoiceController = require('../controllers/invoice');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Invoices
 *   description: API hóa đơn và thanh toán
 */

/**
 * @swagger
 * /invoices:
 *   post:
 *     summary: 9.1. Tạo Hóa Đơn
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - examinationId
 *             properties:
 *               examinationId:
 *                 type: string
 *               items:
 *                 type: array
 *                 description: "Danh sách dịch vụ (Tùy chọn. Nếu trống, hệ thống tự động lấy từ ca khám và xét nghiệm)"
 *                 items:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                       enum: [service, test]
 *                     referenceId:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *     responses:
 *       201:
 *         description: Tạo hóa đơn thành công
 *   get:
 *     summary: 9.2. Danh Sách Hóa Đơn
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [paid, unpaid]
 *       - in: query
 *         name: patientId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Danh sách hóa đơn
 */
router.post(
    '/invoices',
    authenticate,
    authorize(['admin', 'staff']),
    invoiceController.createInvoice
);

/**
 * @swagger
 * /invoices/statistics:
 *   get:
 *     summary: 9.6. Thống Kê Doanh Thu
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [daily, monthly, yearly]
 *           default: monthly
 *     responses:
 *       200:
 *         description: Thống kê
 */
router.get(
    '/invoices/statistics',
    authenticate,
    authorize(['admin']),
    invoiceController.getStatistics
);

/**
 * @swagger
 * /invoices/patient/{patientId}:
 *   get:
 *     summary: 9.5. Lịch Sử Hóa Đơn Của Bệnh Nhân
 *     tags: [Invoices]
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
 *         description: Lịch sử hóa đơn
 */
router.get(
    '/invoices/patient/:patientId',
    authenticate,
    invoiceController.getPatientInvoices
);

router.get(
    '/invoices',
    authenticate,
    authorize(['admin', 'staff']),
    invoiceController.listInvoices
);

/**
 * @swagger
 * /invoices/{id}:
 *   get:
 *     summary: 9.3. Chi Tiết Hóa Đơn
 *     tags: [Invoices]
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
 *         description: Chi tiết hóa đơn
 */
router.get(
    '/invoices/:id',
    authenticate,
    invoiceController.getInvoice
);

/**
 * @swagger
 * /invoices/{id}/pay:
 *   put:
 *     summary: 9.4. Thanh Toán Hóa Đơn
 *     tags: [Invoices]
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
 *         description: Thanh toán thành công
 */
router.put(
    '/invoices/:id/pay',
    authenticate,
    authorize(['admin', 'staff']),
    invoiceController.markAsPaid
);

/**
 * @swagger
 * /invoices/{id}:
 *   put:
 *     summary: Cập Nhật Hóa Đơn (Chỉ Unpaid)
 *     tags: [Invoices]
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
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *   delete:
 *     summary: Xóa Hóa Đơn (Chỉ Unpaid)
 *     tags: [Invoices]
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
router.put('/invoices/:id', authenticate, authorize(['admin', 'staff']), invoiceController.updateInvoice);
router.delete('/invoices/:id', authenticate, authorize(['admin', 'staff']), invoiceController.deleteInvoice);

module.exports = router;
