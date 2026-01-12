const router = require('express').Router();
const serviceController = require('../controllers/service');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Services
 *   description: API quản lý dịch vụ
 */

/**
 * @swagger
 * /services:
 *   post:
 *     summary: 8.1. Tạo Dịch Vụ Mới
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - serviceType
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               serviceType:
 *                 type: string
 *                 enum: [examination, test, other]
 *     responses:
 *       201:
 *         description: Tạo thành công
 *   get:
 *     summary: 8.2. Danh Sách Dịch Vụ
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: serviceType
 *         schema:
 *           type: string
 *           enum: [examination, test, other]
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Danh sách dịch vụ
 */
router.post(
    '/services',
    authenticate,
    authorize(['admin']),
    serviceController.createService
);

/**
 * @swagger
 * /services/active:
 *   get:
 *     summary: 8.6. Danh Sách Dịch Vụ Hoạt Động
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: serviceType
 *         schema:
 *           type: string
 *           enum: [examination, test, other]
 *     responses:
 *       200:
 *         description: Danh sách dịch vụ hoạt động
 */
router.get(
    '/services/active',
    authenticate,
    serviceController.getActiveServices
);

router.get(
    '/services',
    authenticate,
    serviceController.listServices
);

/**
 * @swagger
 * /services/{id}:
 *   get:
 *     summary: 8.3. Chi Tiết Dịch Vụ
 *     tags: [Services]
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
 *         description: Chi tiết dịch vụ
 *   put:
 *     summary: 8.4. Cập Nhật Dịch Vụ
 *     tags: [Services]
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
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *   delete:
 *     summary: 8.5. Vô Hiệu Hóa Dịch Vụ
 *     tags: [Services]
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
 *         description: Vô hiệu hóa thành công
 */
router.get(
    '/services/:id',
    authenticate,
    serviceController.getService
);

router.put(
    '/services/:id',
    authenticate,
    authorize(['admin']),
    serviceController.updateService
);

router.delete(
    '/services/:id',
    authenticate,
    authorize(['admin']),
    serviceController.deactivateService
);

module.exports = router;
