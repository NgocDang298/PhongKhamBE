const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const accountController = require('../controllers/account');

/**
 * @swagger
 * tags:
 *   name: AccountManagement
 *   description: API quản lý tài khoản (Admin)
 */

/**
 * @swagger
 * /accounts:
 *   get:
 *     summary: 12.1. Lấy Danh Sách Tất Cả Tài Khoản
 *     tags: [AccountManagement]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [patient, doctor, staff, lab_nurse, admin]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Danh sách tài khoản
 */
router.get('/accounts', authenticate, authorize(['admin']), accountController.getAllAccounts);

/**
 * @swagger
 * /accounts/{id}:
 *   get:
 *     summary: 12.2. Lấy Thông Tin Chi Tiết Một Tài Khoản
 *     tags: [AccountManagement]
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
 *         description: Chi tiết tài khoản
 */
router.get('/accounts/:id', authenticate, authorize(['admin']), accountController.getAccountById);

module.exports = router;
