const testRequestService = require('../services/testRequestService');
const testResultService = require('../services/testResultService');

/**
 * Tạo yêu cầu xét nghiệm
 * POST /api/test-requests
 * Body: { examId, serviceId, testType, labNurseId }
 */
async function createTestRequest(req, res) {
    const { examId, serviceId, testType, labNurseId } = req.body;

    // Validate required fields
    if (!examId || !serviceId || !testType || !labNurseId) {
        return res.status(400).json({
            status: false,
            message: 'examId, serviceId, testType và labNurseId là bắt buộc'
        });
    }

    const result = await testRequestService.createTestRequest({
        examId,
        serviceId,
        testType,
        labNurseId
    });

    if (!result.ok) {
        return res.status(result.code || 400).json({
            status: false,
            message: result.message
        });
    }

    return res.status(201).json({
        status: true,
        message: result.message,
        data: result.data
    });
}

/**
 * Lấy danh sách yêu cầu xét nghiệm theo ca khám
 * GET /api/examinations/:examId/test-requests
 */
async function getTestRequestsByExam(req, res) {
    const { examId } = req.params;

    const result = await testRequestService.getTestRequestsByExam(examId);

    if (!result.ok) {
        return res.status(result.code || 404).json({
            status: false,
            message: result.message
        });
    }

    return res.json({
        status: true,
        message: result.message || 'Lấy danh sách yêu cầu xét nghiệm thành công',
        data: result.data
    });
}

/**
 * Lấy thông tin chi tiết yêu cầu xét nghiệm
 * GET /api/test-requests/:id
 */
async function getTestRequest(req, res) {
    const { id } = req.params;

    const result = await testRequestService.getTestRequestById(id);

    if (!result.ok) {
        return res.status(result.code || 404).json({
            status: false,
            message: result.message
        });
    }

    return res.json({
        status: true,
        message: result.message || 'Lấy thông tin yêu cầu xét nghiệm thành công',
        data: result.data
    });
}

/**
 * Cập nhật trạng thái yêu cầu xét nghiệm
 * PUT /api/test-requests/:id/status
 * Body: { status }
 */
async function updateStatus(req, res) {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
        return res.status(400).json({
            status: false,
            message: 'status là bắt buộc'
        });
    }

    const result = await testRequestService.updateTestRequestStatus(id, status);

    if (!result.ok) {
        return res.status(result.code || 400).json({
            status: false,
            message: result.message
        });
    }

    return res.json({
        status: true,
        message: result.message,
        data: result.data
    });
}

/**
 * Danh sách yêu cầu xét nghiệm
 * GET /api/test-requests
 * Query params: status, labNurseId, examId, fromDate, toDate, limit, skip
 */
async function listTestRequests(req, res) {
    const filters = {
        status: req.query.status,
        labNurseId: req.query.labNurseId,
        examId: req.query.examId,
        fromDate: req.query.fromDate,
        toDate: req.query.toDate,
        limit: req.query.limit,
        skip: req.query.skip
    };

    const result = await testRequestService.listTestRequests(filters);

    if (!result.ok) {
        return res.status(result.code || 400).json({
            status: false,
            message: result.message
        });
    }

    return res.json({
        status: true,
        message: result.message || 'Lấy danh sách yêu cầu xét nghiệm thành công',
        data: result.data
    });
}

/**
 * Tạo kết quả xét nghiệm
 * POST /test-results
 * Body: { testRequestId, resultData }
 */
async function createTestResult(req, res) {
    const { testRequestId, resultData } = req.body;
    const labNurseId = req.user._id; // Lấy từ authenticated user

    // Validate required fields
    if (!testRequestId || !resultData) {
        return res.status(400).json({
            status: false,
            message: 'testRequestId và resultData là bắt buộc'
        });
    }

    const result = await testResultService.createTestResult({
        testRequestId,
        labNurseId,
        resultData
    });

    if (!result.ok) {
        return res.status(result.code || 400).json({
            status: false,
            message: result.message
        });
    }

    return res.status(201).json({
        status: true,
        message: result.message,
        data: result.data
    });
}

/**
 * Lấy kết quả xét nghiệm theo test request
 * GET /test-results/:testRequestId
 */
async function getTestResult(req, res) {
    const { testRequestId } = req.params;

    const result = await testResultService.getTestResultByRequestId(testRequestId);

    if (!result.ok) {
        return res.status(result.code || 404).json({
            status: false,
            message: result.message
        });
    }

    return res.json({
        status: true,
        message: result.message || 'Lấy kết quả xét nghiệm thành công',
        data: result.data
    });
}

/**
 * Cập nhật kết quả xét nghiệm
 * PUT /test-results/:id
 * Body: { resultData }
 */
async function updateTestResult(req, res) {
    const { id } = req.params;
    const { resultData } = req.body;

    if (!resultData) {
        return res.status(400).json({
            status: false,
            message: 'resultData là bắt buộc'
        });
    }

    const result = await testResultService.updateTestResult(id, resultData);

    if (!result.ok) {
        return res.status(result.code || 400).json({
            status: false,
            message: result.message
        });
    }

    return res.json({
        status: true,
        message: result.message,
        data: result.data
    });
}

/**
 * Lấy tất cả kết quả xét nghiệm của ca khám
 * GET /test-results/examination/:examId
 */
async function getExaminationResults(req, res) {
    const { examId } = req.params;

    const result = await testResultService.getExaminationTestResults(examId);

    if (!result.ok) {
        return res.status(result.code || 404).json({
            status: false,
            message: result.message
        });
    }

    return res.json({
        status: true,
        message: result.message || 'Lấy danh sách kết quả xét nghiệm của ca khám thành công',
        data: result.data
    });
}

/**
 * Lấy lịch sử xét nghiệm của bệnh nhân
 * GET /test-results/patient/:patientId
 * Query params: limit, skip, fromDate, toDate
 */
async function getPatientTestHistory(req, res) {
    const { patientId } = req.params;
    const filters = {
        limit: req.query.limit,
        skip: req.query.skip,
        fromDate: req.query.fromDate,
        toDate: req.query.toDate
    };

    const result = await testResultService.getPatientTestHistory(patientId, filters);

    if (!result.ok) {
        return res.status(result.code || 404).json({
            status: false,
            message: result.message
        });
    }

    return res.json({
        status: true,
        message: result.message || 'Lấy lịch sử xét nghiệm của bệnh nhân thành công',
        data: result.data
    });
}

/**
 * Cập nhật yêu cầu xét nghiệm
 * PUT /api/test-requests/:id
 */
async function updateTestRequest(req, res) {
    const testRequestService = require('../services/testRequestService');
    const result = await testRequestService.updateTestRequest(req.params.id, req.body || {});
    if (!result.ok) return res.status(result.code || 400).json({ status: false, message: result.message });
    return res.json({ status: true, message: result.message, data: result.data });
}

/**
 * Xóa yêu cầu xét nghiệm
 * DELETE /api/test-requests/:id
 */
async function deleteTestRequest(req, res) {
    const testRequestService = require('../services/testRequestService');
    const result = await testRequestService.deleteTestRequest(req.params.id);
    if (!result.ok) return res.status(result.code || 400).json({ status: false, message: result.message });
    return res.json({ status: true, message: result.message });
}

module.exports = {
    createTestRequest,
    getTestRequestsByExam,
    getTestRequest,
    updateStatus,
    listTestRequests,
    createTestResult,
    getTestResult,
    updateTestResult,
    getExaminationResults,
    getPatientTestHistory,
    updateTestRequest,
    deleteTestRequest
};
