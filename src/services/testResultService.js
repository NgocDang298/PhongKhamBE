const { TestResult, TestRequest, Examination, LabNurse, Patient } = require('../models');

/**
 * Tạo kết quả xét nghiệm
 * @param {Object} params - { testRequestId, labNurseId, resultData }
 * @returns {Object} - { ok, data, message, code }
 */
async function createTestResult({ testRequestId, labNurseId, resultData, images }) {
    // Kiểm tra test request tồn tại
    const testRequest = await TestRequest.findById(testRequestId)
        .populate('examId')
        .lean();

    if (!testRequest) {
        return { ok: false, code: 404, message: 'Không tìm thấy yêu cầu xét nghiệm' };
    }

    // Kiểm tra test request đang ở trạng thái processing
    if (testRequest.status === 'completed') {
        return { ok: false, code: 400, message: 'Yêu cầu xét nghiệm đã có kết quả' };
    }

    if (testRequest.status === 'waiting') {
        return { ok: false, code: 400, message: 'Yêu cầu xét nghiệm chưa được xử lý' };
    }

    // Kiểm tra lab nurse tồn tại
    const labNurse = await LabNurse.findById(labNurseId).lean();
    if (!labNurse) {
        return { ok: false, code: 404, message: 'Không tìm thấy y tá xét nghiệm' };
    }

    // Kiểm tra xem đã có kết quả chưa
    const existingResult = await TestResult.findOne({ testRequestId }).lean();
    if (existingResult) {
        return { ok: false, code: 400, message: 'Yêu cầu xét nghiệm đã có kết quả. Vui lòng sử dụng API cập nhật' };
    }

    // Tạo kết quả xét nghiệm
    const testResult = await TestResult.create({
        testRequestId,
        labNurseId,
        resultData,
        images: Array.isArray(images) ? images : [],
        performedAt: new Date()
    });

    // Cập nhật trạng thái test request thành completed
    await TestRequest.findByIdAndUpdate(testRequestId, {
        status: 'completed'
    });

    // Populate để trả về đầy đủ thông tin
    const populatedResult = await TestResult.findById(testResult._id)
        .populate({
            path: 'testRequestId',
            populate: [
                {
                    path: 'examId',
                    select: 'patientId doctorId examDate',
                    populate: {
                        path: 'patientId',
                        select: 'fullName phone email gender dateOfBirth'
                    }
                },
                { path: 'serviceId', select: 'name price description' }
            ]
        })
        .populate('labNurseId', 'fullName')
        .lean();

    return {
        ok: true,
        data: populatedResult,
        message: 'Tạo kết quả xét nghiệm thành công'
    };
}

/**
 * Lấy kết quả xét nghiệm theo test request
 * @param {String} testRequestId
 * @returns {Object} - { ok, data, message, code }
 */
async function getTestResultByRequestId(testRequestId) {
    const testResult = await TestResult.findOne({ testRequestId })
        .populate({
            path: 'testRequestId',
            populate: [
                {
                    path: 'examId',
                    populate: [
                        {
                            path: 'patientId',
                            select: 'fullName phone email gender dateOfBirth'
                        },
                        { path: 'doctorId' }
                    ]
                },
                { path: 'serviceId', select: 'name price description' }
            ]
        })
        .populate('labNurseId', 'fullName')
        .lean();

    if (!testResult) {
        return { ok: false, code: 404, message: 'Không tìm thấy kết quả xét nghiệm' };
    }

    return { ok: true, data: testResult };
}

/**
 * Cập nhật kết quả xét nghiệm
 * @param {String} testResultId
 * @param {Object} data - { resultData, images }
 * @returns {Object} - { ok, data, message, code }
 */
async function updateTestResult(testResultId, { resultData, images }) {
    const testResult = await TestResult.findById(testResultId);

    if (!testResult) {
        return { ok: false, code: 404, message: 'Không tìm thấy kết quả xét nghiệm' };
    }

    // Cập nhật resultData
    if (resultData !== undefined) testResult.resultData = resultData;
    if (images !== undefined && Array.isArray(images)) testResult.images = images;

    testResult.performedAt = new Date();
    await testResult.save();

    // Populate để trả về đầy đủ thông tin
    const updatedResult = await TestResult.findById(testResultId)
        .populate({
            path: 'testRequestId',
            populate: [
                {
                    path: 'examId',
                    select: 'patientId doctorId examDate',
                    populate: {
                        path: 'patientId',
                        select: 'fullName phone email gender dateOfBirth'
                    }
                },
                { path: 'serviceId', select: 'name price description' }
            ]
        })
        .populate('labNurseId', 'fullName')
        .lean();

    return {
        ok: true,
        data: updatedResult,
        message: 'Cập nhật kết quả xét nghiệm thành công'
    };
}

/**
 * Lấy tất cả kết quả xét nghiệm của một ca khám
 * @param {String} examId
 * @returns {Object} - { ok, data, message, code }
 */
async function getExaminationTestResults(examId) {
    // Kiểm tra examination tồn tại
    const examination = await Examination.findById(examId).lean();
    if (!examination) {
        return { ok: false, code: 404, message: 'Không tìm thấy ca khám' };
    }

    // Lấy tất cả test requests của ca khám
    const testRequests = await TestRequest.find({ examId }).select('_id').lean();
    const testRequestIds = testRequests.map(tr => tr._id);

    // Lấy tất cả kết quả xét nghiệm
    const testResults = await TestResult.find({ testRequestId: { $in: testRequestIds } })
        .populate({
            path: 'testRequestId',
            populate: [
                {
                    path: 'examId',
                    select: 'patientId doctorId examDate',
                    populate: {
                        path: 'patientId',
                        select: 'fullName phone email gender dateOfBirth'
                    }
                },
                { path: 'serviceId', select: 'name price description' }
            ]
        })
        .populate('labNurseId', 'fullName')
        .sort({ performedAt: -1 })
        .lean();

    return {
        ok: true,
        data: testResults
    };
}

/**
 * Lấy lịch sử xét nghiệm của bệnh nhân
 * @param {String} patientId
 * @param {Object} filters - { limit, skip, fromDate, toDate }
 * @returns {Object} - { ok, data }
 */
async function getPatientTestHistory(patientId, filters = {}) {
    const { limit = 50, skip = 0, fromDate, toDate } = filters;

    // Kiểm tra patient tồn tại
    const patient = await Patient.findById(patientId).lean();
    if (!patient) {
        return { ok: false, code: 404, message: 'Không tìm thấy bệnh nhân' };
    }

    // Lấy tất cả examinations của bệnh nhân
    const examinations = await Examination.find({ patientId }).select('_id').lean();
    const examIds = examinations.map(exam => exam._id);

    // Lấy tất cả test requests của các ca khám
    const testRequests = await TestRequest.find({ examId: { $in: examIds } }).select('_id').lean();
    const testRequestIds = testRequests.map(tr => tr._id);

    // Build query cho test results
    const query = { testRequestId: { $in: testRequestIds } };

    // Filter by date range
    if (fromDate || toDate) {
        query.performedAt = {};
        if (fromDate) query.performedAt.$gte = new Date(fromDate);
        if (toDate) query.performedAt.$lte = new Date(toDate);
    }

    // Lấy kết quả xét nghiệm
    const testResults = await TestResult.find(query)
        .populate({
            path: 'testRequestId',
            populate: [
                { path: 'examId', select: 'examDate doctorId' },
                { path: 'serviceId', select: 'name price description' }
            ]
        })
        .populate('labNurseId', 'fullName')
        .sort({ performedAt: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(skip))
        .lean();

    const total = await TestResult.countDocuments(query);

    return {
        ok: true,
        data: {
            results: testResults,
            total,
            limit: parseInt(limit),
            skip: parseInt(skip)
        }
    };
}

/**
 * Xóa kết quả xét nghiệm và rollback trạng thái test request
 * @param {String} testResultId
 * @returns {Object} - { ok, message, code }
 */
async function deleteTestResult(testResultId) {
    const testResult = await TestResult.findById(testResultId);
    if (!testResult) {
        return { ok: false, code: 404, message: 'Không tìm thấy kết quả xét nghiệm' };
    }

    // Rollback test request status to processing
    await TestRequest.findByIdAndUpdate(testResult.testRequestId, {
        status: 'processing'
    });

    // Delete the test result
    await TestResult.findByIdAndDelete(testResultId);

    return {
        ok: true,
        message: 'Xóa kết quả xét nghiệm thành công'
    };
}

module.exports = {
    createTestResult,
    getTestResultByRequestId,
    updateTestResult,
    getExaminationTestResults,
    getPatientTestHistory,
    deleteTestResult
};
