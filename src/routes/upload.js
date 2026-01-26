const router = require('express').Router();
const uploadController = require('../controllers/upload');
const upload = require('../middleware/upload');
const { authenticate } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Upload
 *   description: API Upload file
 */

/**
 * @swagger
 * /upload:
 *   post:
 *     summary: Upload hình ảnh lên Cloudinary
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Trả về danh sách URL hình ảnh
 */
router.post('/upload', authenticate, upload.array('files', 10), uploadController.uploadFiles);

module.exports = router;
