const testResultService = require('../services/testResultService');

module.exports = {
    /**
     * POST /test-results - Tạo kết quả xét nghiệm
     */
    async create(req, res) {
        const { testRequestId, resultData } = req.body;
        const result = await testResultService.createTestResult({
            testRequestId,
            labNurseId: req.user.labNurseId || req.user._id,
            resultData
        });
        if (!result.ok) return res.status(result.code || 400).json({ status: false, message: result.message });
        return res.status(201).json({ status: true, message: result.message, data: result.data });
    },

    /**
     * GET /test-results/:testRequestId - Lấy kết quả theo test request
     */
    async getByRequestId(req, res) {
        const result = await testResultService.getTestResultByRequestId(req.params.testRequestId);
        if (!result.ok) return res.status(result.code || 400).json({ status: false, message: result.message });
        return res.json({ status: true, data: result.data });
    },

    /**
     * PUT /test-results/:id - Cập nhật kết quả xét nghiệm
     */
    async update(req, res) {
        const result = await testResultService.updateTestResult(req.params.id, req.body.resultData);
        if (!result.ok) return res.status(result.code || 400).json({ status: false, message: result.message });
        return res.json({ status: true, message: result.message, data: result.data });
    },

    /**
     * GET /test-results/examination/:examId - Kết quả xét nghiệm của ca khám
     */
    async getByExamination(req, res) {
        const result = await testResultService.getExaminationTestResults(req.params.examId);
        if (!result.ok) return res.status(result.code || 400).json({ status: false, message: result.message });
        return res.json({ status: true, data: result.data });
    },

    /**
     * GET /test-results/patient/:patientId - Lịch sử xét nghiệm của bệnh nhân
     */
    async getPatientHistory(req, res) {
        const result = await testResultService.getPatientTestHistory(req.params.patientId, req.query);
        if (!result.ok) return res.status(result.code || 400).json({ status: false, message: result.message });
        return res.json({ status: true, data: result.data });
    },

    /**
     * DELETE /test-results/:id - Xóa kết quả xét nghiệm
     */
    async delete(req, res) {
        const result = await testResultService.deleteTestResult(req.params.id);
        if (!result.ok) return res.status(result.code || 400).json({ status: false, message: result.message });
        return res.json({ status: true, message: result.message });
    }
};
