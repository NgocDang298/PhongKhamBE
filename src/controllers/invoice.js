const invoiceService = require('../services/invoiceService');

/**
 * Tạo hóa đơn
 * POST /invoices
 * Body: { examinationId, items: [{ type, referenceId, quantity }] }
 */
async function createInvoice(req, res) {
    const { examinationId, items } = req.body;

    // Validate required fields
    if (!examinationId || !items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
            status: false,
            message: 'examinationId và items (array) là bắt buộc'
        });
    }

    const result = await invoiceService.createInvoice({
        examinationId,
        items
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
 * Lấy thông tin chi tiết hóa đơn
 * GET /invoices/:id
 */
async function getInvoice(req, res) {
    const { id } = req.params;

    const result = await invoiceService.getInvoiceById(id);

    if (!result.ok) {
        return res.status(result.code || 404).json({
            status: false,
            message: result.message
        });
    }

    // Kiểm tra quyền: patient chỉ xem được hóa đơn của mình
    if (req.user.role === 'patient') {
        if (result.data.patientId._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                status: false,
                message: 'Bạn không có quyền xem hóa đơn này'
            });
        }
    }

    return res.json({
        status: true,
        message: result.message || 'Lấy thông tin hóa đơn thành công',
        data: result.data
    });
}

/**
 * Danh sách hóa đơn
 * GET /invoices
 * Query params: patientId, status, fromDate, toDate, limit, skip
 */
async function listInvoices(req, res) {
    const filters = {
        patientId: req.query.patientId,
        status: req.query.status,
        fromDate: req.query.fromDate,
        toDate: req.query.toDate,
        limit: req.query.limit,
        skip: req.query.skip
    };

    const result = await invoiceService.listInvoices(filters);

    if (!result.ok) {
        return res.status(result.code || 400).json({
            status: false,
            message: result.message
        });
    }

    return res.json({
        status: true,
        message: result.message || 'Lấy danh sách hóa đơn thành công',
        data: result.data
    });
}

/**
 * Thanh toán hóa đơn
 * PUT /invoices/:id/pay
 */
async function markAsPaid(req, res) {
    const { id } = req.params;
    const paidByUserId = req.user._id;

    const result = await invoiceService.markAsPaid(id, paidByUserId);

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
 * Lịch sử hóa đơn của bệnh nhân
 * GET /invoices/patient/:patientId
 * Query params: status, limit, skip
 */
async function getPatientInvoices(req, res) {
    const { patientId } = req.params;
    const filters = {
        status: req.query.status,
        limit: req.query.limit,
        skip: req.query.skip
    };

    // Kiểm tra quyền: patient chỉ xem được hóa đơn của mình
    if (req.user.role === 'patient') {
        if (patientId !== req.user._id.toString()) {
            return res.status(403).json({
                status: false,
                message: 'Bạn không có quyền xem hóa đơn của bệnh nhân khác'
            });
        }
    }

    const result = await invoiceService.getPatientInvoices(patientId, filters);

    if (!result.ok) {
        return res.status(result.code || 404).json({
            status: false,
            message: result.message
        });
    }

    return res.json({
        status: true,
        message: result.message || 'Lấy danh sách hóa đơn của bệnh nhân thành công',
        data: result.data
    });
}

/**
 * Thống kê doanh thu
 * GET /invoices/statistics
 * Query params: period (daily|monthly|yearly), fromDate, toDate
 */
async function getStatistics(req, res) {
    const filters = {
        period: req.query.period || 'monthly',
        fromDate: req.query.fromDate,
        toDate: req.query.toDate
    };

    const result = await invoiceService.getRevenueStatistics(filters);

    if (!result.ok) {
        return res.status(result.code || 400).json({
            status: false,
            message: result.message
        });
    }

    return res.json({
        status: true,
        message: result.message || 'Lấy thống kê doanh thu thành công',
        data: result.data
    });
}

/**
 * Cập nhật hóa đơn
 * PUT /invoices/:id
 */
async function updateInvoice(req, res) {
    const result = await invoiceService.updateInvoice(req.params.id, req.body || {});
    if (!result.ok) return res.status(result.code || 400).json({ status: false, message: result.message });
    return res.json({ status: true, message: result.message, data: result.data });
}

/**
 * Xóa hóa đơn
 * DELETE /invoices/:id
 */
async function deleteInvoice(req, res) {
    const result = await invoiceService.deleteInvoice(req.params.id);
    if (!result.ok) return res.status(result.code || 400).json({ status: false, message: result.message });
    return res.json({ status: true, message: result.message });
}

module.exports = {
    createInvoice,
    getInvoice,
    listInvoices,
    markAsPaid,
    getPatientInvoices,
    getStatistics,
    updateInvoice,
    deleteInvoice
};
