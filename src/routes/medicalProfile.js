const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const medicalProfile = require('../controllers/medicalProfile');

/**
 * @swagger
 * tags:
 *   name: MedicalProfile
 *   description: API hồ sơ y tế
 */

/**
 * @swagger
 * /medical-profile:
 *   post:
 *     summary: 4.1. Tạo/Lấy Hồ Sơ Khám Bệnh (Patient)
 *     tags: [MedicalProfile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bloodType:
 *                 type: string
 *                 enum: [A, B, AB, O]
 *               allergies:
 *                 type: array
 *                 items:
 *                   type: string
 *               chronicDiseases:
 *                 type: array
 *                 items:
 *                   type: string
 *               medications:
 *                 type: array
 *                 items:
 *                   type: string
 *               surgeries:
 *                 type: array
 *                 items:
 *                   type: string
 *               familyHistory:
 *                 type: array
 *                 items:
 *                   type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Chi tiết hồ sơ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 */
router.post('/medical-profile', authenticate, authorize(['patient']), medicalProfile.createOrGet);

/**
 * @swagger
 * /patients/{patientId}/medical-profile:
 *   post:
 *     summary: 4.2. Tạo/Lấy Hồ Sơ Cho Bệnh Nhân (Staff/Admin)
 *     tags: [MedicalProfile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bloodType:
 *                 type: string
 *                 enum: [A, B, AB, O]
 *               allergies:
 *                 type: array
 *                 items:
 *                   type: string
 *               chronicDiseases:
 *                 type: array
 *                 items:
 *                   type: string
 *               medications:
 *                 type: array
 *                 items:
 *                   type: string
 *               surgeries:
 *                 type: array
 *                 items:
 *                   type: string
 *               familyHistory:
 *                 type: array
 *                 items:
 *                   type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Chi tiết hồ sơ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 */
router.post('/patients/:patientId/medical-profile', authenticate, authorize(['staff', 'admin']), medicalProfile.createOrGetForPatient);

/**
 * @swagger
 * /medical-profile:
 *   put:
 *     summary: Cập Nhật Hồ Sơ Y Tế (Patient)
 *     tags: [MedicalProfile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bloodType:
 *                 type: string
 *                 enum: [A, B, AB, O]
 *               allergies:
 *                 type: array
 *                 items:
 *                   type: string
 *               chronicDiseases:
 *                 type: array
 *                 items:
 *                   type: string
 *               medications:
 *                 type: array
 *                 items:
 *                   type: string
 *               surgeries:
 *                 type: array
 *                 items:
 *                   type: string
 *               familyHistory:
 *                 type: array
 *                 items:
 *                   type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
router.put('/medical-profile', authenticate, authorize(['patient']), medicalProfile.updateMyProfile);

/**
 * @swagger
 * /patients/{patientId}/medical-profile:
 *   put:
 *     summary: Cập Nhật Hồ Sơ Y Tế Cho Bệnh Nhân (Staff/Admin)
 *     tags: [MedicalProfile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bloodType:
 *                 type: string
 *                 enum: [A, B, AB, O]
 *               allergies:
 *                 type: array
 *                 items:
 *                   type: string
 *               chronicDiseases:
 *                 type: array
 *                 items:
 *                   type: string
 *               medications:
 *                 type: array
 *                 items:
 *                   type: string
 *               surgeries:
 *                 type: array
 *                 items:
 *                   type: string
 *               familyHistory:
 *                 type: array
 *                 items:
 *                   type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
router.put('/patients/:patientId/medical-profile', authenticate, authorize(['staff', 'admin']), medicalProfile.updatePatientProfile);

module.exports = router;


