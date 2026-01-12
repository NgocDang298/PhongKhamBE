const medicalProfileService = require('../services/medicalProfileService');

module.exports = {
    /**
     * POST /medical-profile - Tạo hồ sơ khám bệnh duy nhất cho bệnh nhân (idempotent)
     * headers: { Authorization: Bearer <token> }
     * role: patient
     * body: {
     *   bloodType?, allergies?[], chronicDiseases?[], medications?[], surgeries?[], familyHistory?[], notes?
     * }
     */
    async createOrGet(req, res) {
        const result = await medicalProfileService.createOrGetMedicalProfile(req.user, req.body || {});
        if (!result.ok) return res.status(result.code || 400).json({ status: false, message: result.message });
        return res.status(result.code || 200).json({ status: true, data: result.data });
    },

    /**
     * POST /patients/:patientId/medical-profile - Nhân viên tạo hồ sơ bệnh nhân tại quầy (idempotent)
     * role: staff/admin
     */
    async createOrGetForPatient(req, res) {
        const result = await medicalProfileService.createOrGetMedicalProfileForPatient(
            req.user,
            req.params.patientId,
            req.body || {}
        );
        if (!result.ok) return res.status(result.code || 400).json({ status: false, message: result.message });
        return res.status(result.code || 200).json({ status: true, data: result.data });
    },

    /**
     * PUT /medical-profile - Cập nhật hồ sơ y tế của bệnh nhân
     */
    async updateMyProfile(req, res) {
        const result = await medicalProfileService.updateMedicalProfile(req.user, req.body || {});
        if (!result.ok) return res.status(result.code || 400).json({ status: false, message: result.message });
        return res.json({ status: true, message: result.message, data: result.data });
    },

    /**
     * PUT /patients/:patientId/medical-profile - Cập nhật hồ sơ y tế cho bệnh nhân
     */
    async updatePatientProfile(req, res) {
        const result = await medicalProfileService.updateMedicalProfileForPatient(
            req.user,
            req.params.patientId,
            req.body || {}
        );
        if (!result.ok) return res.status(result.code || 400).json({ status: false, message: result.message });
        return res.json({ status: true, message: result.message, data: result.data });
    }
};


