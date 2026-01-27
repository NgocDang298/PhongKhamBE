const testResultService = require('../services/testResultService');

module.exports = {
    /**
     * POST /test-results - Tạo kết quả xét nghiệm
     */
    /**
     * POST /test-results - Tạo kết quả xét nghiệm
     */
    async create(req, res) {
        let { testRequestId, resultData, labNurseId, images: bodyImages } = req.body;

        // Lấy URLs từ Cloudinary (nếu có upload file qua multipart/form-data)
        const uploadedImages = req.files ? req.files.map(file => file.path) : [];

        // Kết hợp ảnh từ body (URLs) và ảnh upload (file)
        let images = [];
        if (Array.isArray(bodyImages)) {
            images = [...bodyImages];
        }
        if (uploadedImages.length > 0) {
            images = [...images, ...uploadedImages];
        }

        // Ưu tiên lấy labNurseId từ body (admin tạo cho nurse khác)
        // Nếu không có trong body, lấy từ user đang đăng nhập
        const nurseId = labNurseId || req.user.labNurseId || req.user._id;

        const result = await testResultService.createTestResult({
            testRequestId,
            labNurseId: nurseId,
            resultData: typeof resultData === 'string' ? JSON.parse(resultData) : resultData,
            images
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
        return res.json({ status: true, message: result.message || 'Lấy kết quả xét nghiệm thành công', data: result.data });
    },

    /**
     * PUT /test-results/:id - Cập nhật kết quả xét nghiệm
     */
    async update(req, res) {
        const { resultData } = req.body;
        const images = req.files ? req.files.map(file => file.path) : undefined;

        const result = await testResultService.updateTestResult(req.params.id, {
            resultData: resultData ? (typeof resultData === 'string' ? JSON.parse(resultData) : resultData) : undefined,
            images
        });
        if (!result.ok) return res.status(result.code || 400).json({ status: false, message: result.message });
        return res.json({ status: true, message: result.message, data: result.data });
    },

    /**
     * GET /test-results/examination/:examId - Kết quả xét nghiệm của ca khám
     */
    async getByExamination(req, res) {
        const result = await testResultService.getExaminationTestResults(req.params.examId);
        if (!result.ok) return res.status(result.code || 400).json({ status: false, message: result.message });
        return res.json({ status: true, message: result.message || 'Lấy kết quả xét nghiệm của ca khám thành công', data: result.data });
    },

    /**
     * GET /test-results/patient/:patientId - Lịch sử xét nghiệm của bệnh nhân
     */
    async getPatientHistory(req, res) {
        const result = await testResultService.getPatientTestHistory(req.params.patientId, req.query);
        if (!result.ok) return res.status(result.code || 400).json({ status: false, message: result.message });
        return res.json({ status: true, message: result.message || 'Lấy lịch sử xét nghiệm của bệnh nhân thành công', data: result.data });
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
