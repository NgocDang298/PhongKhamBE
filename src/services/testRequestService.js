const { TestRequest, Examination, Service, LabNurse } = require('../models');

/**
 * Tạo yêu cầu xét nghiệm từ ca khám
 * @param {Object} params - { examId, serviceId, testType, labNurseId, doctorNote }
 * @returns {Object} - { ok, data, message, code }
 */
async function createTestRequest({ examId, serviceId, testType, labNurseId, doctorNote }) {
    // Kiểm tra examination tồn tại
    const examination = await Examination.findById(examId).lean();
    if (!examination) {
        return { ok: false, code: 404, message: 'Không tìm thấy ca khám' };
    }

    // Kiểm tra examination đang processing (chưa hoàn thành)
    if (examination.status === 'done') {
        return { ok: false, code: 400, message: 'Không thể tạo yêu cầu xét nghiệm cho ca khám đã hoàn thành' };
    }

    // Kiểm tra service tồn tại và là loại test
    const service = await Service.findById(serviceId).lean();
    if (!service || !service.isActive) {
        return { ok: false, code: 404, message: 'Không tìm thấy dịch vụ hoặc dịch vụ không hoạt động' };
    }

    if (service.serviceType !== 'test') {
        return { ok: false, code: 400, message: 'Dịch vụ này không phải là dịch vụ xét nghiệm' };
    }

    // Kiểm tra lab nurse tồn tại
    const labNurse = await LabNurse.findById(labNurseId).lean();
    if (!labNurse) {
        return { ok: false, code: 404, message: 'Không tìm thấy y tá xét nghiệm' };
    }

    // Tạo test request
    const testRequest = await TestRequest.create({
        examId,
        serviceId,
        testType,
        labNurseId,
        requestedAt: new Date(),
        status: 'waiting'
    });

    // Populate để trả về đầy đủ thông tin
    const populatedTestRequest = await TestRequest.findById(testRequest._id)
        .populate({
            path: 'examId',
            select: 'patientId doctorId examDate',
            populate: {
                path: 'patientId',
                select: 'fullName phoneNumber email dateOfBirth'
            }
        })
        .populate('serviceId', 'name price description')
        .populate('labNurseId', 'fullName')
        .lean();

    return {
        ok: true,
        data: populatedTestRequest,
        message: 'Tạo yêu cầu xét nghiệm thành công'
    };
}

/**
 * Lấy danh sách yêu cầu xét nghiệm theo ca khám
 * @param {String} examId
 * @returns {Object} - { ok, data }
 */
async function getTestRequestsByExam(examId) {
    const examination = await Examination.findById(examId).lean();
    if (!examination) {
        return { ok: false, code: 404, message: 'Không tìm thấy ca khám' };
    }

    const testRequests = await TestRequest.find({ examId })
        .sort({ requestedAt: -1 })
        .populate({
            path: 'examId',
            populate: {
                path: 'patientId',
                select: 'fullName phoneNumber email dateOfBirth'
            }
        })
        .populate('serviceId', 'name price description serviceType')
        .populate('labNurseId', 'fullName')
        .lean();

    return { ok: true, data: testRequests };
}

/**
 * Cập nhật trạng thái yêu cầu xét nghiệm
 * @param {String} testRequestId
 * @param {String} status - 'waiting' | 'processing' | 'completed'
 * @returns {Object} - { ok, data, message, code }
 */
async function updateTestRequestStatus(testRequestId, status) {
    const validStatuses = ['waiting', 'processing', 'completed'];
    if (!validStatuses.includes(status)) {
        return { ok: false, code: 400, message: 'Trạng thái không hợp lệ' };
    }

    const testRequest = await TestRequest.findById(testRequestId);
    if (!testRequest) {
        return { ok: false, code: 404, message: 'Không tìm thấy yêu cầu xét nghiệm' };
    }

    testRequest.status = status;
    await testRequest.save();

    const updatedTestRequest = await TestRequest.findById(testRequestId)
        .populate({
            path: 'examId',
            select: 'patientId doctorId examDate',
            populate: {
                path: 'patientId',
                select: 'fullName phoneNumber email dateOfBirth'
            }
        })
        .populate('serviceId', 'name price')
        .populate('labNurseId', 'fullName')
        .lean();

    return {
        ok: true,
        data: updatedTestRequest,
        message: `Cập nhật trạng thái thành ${status} thành công`
    };
}

/**
 * Danh sách yêu cầu xét nghiệm với filter
 * @param {Object} filters - { status, labNurseId, examId, fromDate, toDate, limit, skip }
 * @returns {Object} - { ok, data }
 */
async function listTestRequests(filters = {}) {
    const { status, labNurseId, examId, fromDate, toDate, limit = 50, skip = 0 } = filters;

    const query = {};

    if (status) query.status = status;
    if (labNurseId) query.labNurseId = labNurseId;
    if (examId) query.examId = examId;

    if (fromDate || toDate) {
        query.requestedAt = {};
        if (fromDate) query.requestedAt.$gte = new Date(fromDate);
        if (toDate) query.requestedAt.$lte = new Date(toDate);
    }

    const testRequests = await TestRequest.find(query)
        .sort({ requestedAt: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(skip))
        .populate({
            path: 'examId',
            select: 'patientId doctorId examDate',
            populate: {
                path: 'patientId',
                select: 'fullName phoneNumber email dateOfBirth'
            }
        })
        .populate('serviceId', 'name price')
        .populate('labNurseId', 'fullName')
        .lean();

    const total = await TestRequest.countDocuments(query);

    return {
        ok: true,
        data: {
            testRequests,
            total,
            limit: parseInt(limit),
            skip: parseInt(skip)
        }
    };
}

/**
 * Lấy thông tin chi tiết yêu cầu xét nghiệm
 * @param {String} testRequestId
 * @returns {Object} - { ok, data, message, code }
 */
async function getTestRequestById(testRequestId) {
    const testRequest = await TestRequest.findById(testRequestId)
        .populate({
            path: 'examId',
            populate: {
                path: 'patientId',
                select: 'fullName phoneNumber email dateOfBirth'
            }
        })
        .populate('serviceId', 'name price description serviceType')
        .populate('labNurseId', 'fullName')
        .lean();

    if (!testRequest) {
        return { ok: false, code: 404, message: 'Không tìm thấy yêu cầu xét nghiệm' };
    }

    return { ok: true, data: testRequest };
}

/**
 * Cập nhật yêu cầu xét nghiệm
 * @param {String} testRequestId
 * @param {Object} updates - { testType, labNurseId, serviceId }
 * @returns {Object} - { ok, data, message, code }
 */
async function updateTestRequest(testRequestId, updates) {
    const testRequest = await TestRequest.findById(testRequestId);
    if (!testRequest) {
        return { ok: false, code: 404, message: 'Không tìm thấy yêu cầu xét nghiệm' };
    }

    // Only allow updating if not completed
    if (testRequest.status === 'completed') {
        return { ok: false, code: 400, message: 'Không thể cập nhật yêu cầu đã hoàn thành' };
    }

    // Update allowed fields
    if (updates.testType) testRequest.testType = updates.testType;
    if (updates.labNurseId) testRequest.labNurseId = updates.labNurseId;
    if (updates.serviceId) testRequest.serviceId = updates.serviceId;

    await testRequest.save();

    const updated = await TestRequest.findById(testRequestId)
        .populate({
            path: 'examId',
            select: 'patientId doctorId examDate',
            populate: {
                path: 'patientId',
                select: 'fullName phoneNumber email dateOfBirth'
            }
        })
        .populate('serviceId', 'name price description')
        .populate('labNurseId', 'fullName')
        .lean();

    return {
        ok: true,
        data: updated,
        message: 'Cập nhật yêu cầu xét nghiệm thành công'
    };
}

/**
 * Xóa yêu cầu xét nghiệm (chỉ xóa được yêu cầu đang waiting)
 * @param {String} testRequestId
 * @returns {Object} - { ok, message, code }
 */
async function deleteTestRequest(testRequestId) {
    const testRequest = await TestRequest.findById(testRequestId);
    if (!testRequest) {
        return { ok: false, code: 404, message: 'Không tìm thấy yêu cầu xét nghiệm' };
    }

    // Only allow deleting waiting test requests
    if (testRequest.status !== 'waiting') {
        return { ok: false, code: 400, message: 'Chỉ có thể xóa yêu cầu đang chờ xử lý' };
    }

    await TestRequest.findByIdAndDelete(testRequestId);

    return {
        ok: true,
        message: 'Xóa yêu cầu xét nghiệm thành công'
    };
}

module.exports = {
    createTestRequest,
    getTestRequestsByExam,
    updateTestRequestStatus,
    listTestRequests,
    getTestRequestById,
    updateTestRequest,
    deleteTestRequest
};
