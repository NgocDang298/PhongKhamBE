const { Invoice, Examination, TestRequest, Service, Patient } = require('../models');

/**
 * Tạo hóa đơn cho ca khám
 * @param {Object} params - { examinationId, items }
 * @returns {Object} - { ok, data, message, code }
 */
async function createInvoice({ examinationId, items }) {
    // Kiểm tra examination tồn tại
    const examination = await Examination.findById(examinationId)
        .populate('patientId')
        .populate('serviceId')
        .lean();

    if (!examination) {
        return { ok: false, code: 404, message: 'Không tìm thấy ca khám' };
    }

    // Kiểm tra đã có hóa đơn chưa
    const existingInvoice = await Invoice.findOne({ examinationId }).lean();
    if (existingInvoice) {
        return { ok: false, code: 400, message: 'Ca khám đã có hóa đơn' };
    }

    // Xử lý items
    const invoiceItems = [];
    let totalAmount = 0;

    for (const item of items) {
        // Validate referenceId
        if (!item.referenceId || item.referenceId.trim() === '') {
            return { ok: false, code: 400, message: 'referenceId là bắt buộc cho mỗi item' };
        }

        // Lấy thông tin service
        const service = await Service.findById(item.referenceId).lean();
        if (!service || !service.isActive) {
            return { ok: false, code: 404, message: `Không tìm thấy dịch vụ: ${item.referenceId}` };
        }

        const quantity = item.quantity || 1;
        const itemTotal = service.price * quantity;

        invoiceItems.push({
            type: item.type,
            referenceId: item.referenceId,
            name: service.name,
            price: service.price,
            quantity
        });

        totalAmount += itemTotal;
    }

    // Tạo hóa đơn
    const invoice = await Invoice.create({
        examinationId,
        patientId: examination.patientId._id,
        items: invoiceItems,
        totalAmount,
        status: 'unpaid'
    });

    // Populate để trả về đầy đủ thông tin
    const populatedInvoice = await Invoice.findById(invoice._id)
        .populate('examinationId')
        .populate('patientId', 'fullName phone cccd')
        .lean();

    return {
        ok: true,
        data: populatedInvoice,
        message: 'Tạo hóa đơn thành công'
    };
}

/**
 * Lấy thông tin chi tiết hóa đơn
 * @param {String} invoiceId
 * @returns {Object} - { ok, data, message, code }
 */
async function getInvoiceById(invoiceId) {
    const invoice = await Invoice.findById(invoiceId)
        .populate('examinationId')
        .populate('patientId', 'fullName phone cccd email')
        .populate('paidBy', 'fullName role')
        .lean();

    if (!invoice) {
        return { ok: false, code: 404, message: 'Không tìm thấy hóa đơn' };
    }

    return { ok: true, data: invoice };
}

/**
 * Danh sách hóa đơn với filter
 * @param {Object} filters - { patientId, status, fromDate, toDate, limit, skip }
 * @returns {Object} - { ok, data }
 */
async function listInvoices(filters = {}) {
    const { patientId, status, fromDate, toDate, limit = 50, skip = 0 } = filters;

    const query = {};

    if (patientId) query.patientId = patientId;
    if (status) query.status = status;

    if (fromDate || toDate) {
        query.createdAt = {};
        if (fromDate) query.createdAt.$gte = new Date(fromDate);
        if (toDate) query.createdAt.$lte = new Date(toDate);
    }

    const invoices = await Invoice.find(query)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(skip))
        .populate('examinationId', 'examDate')
        .populate('patientId', 'fullName phone cccd')
        .populate('paidBy', 'fullName')
        .lean();

    const total = await Invoice.countDocuments(query);

    return {
        ok: true,
        data: {
            invoices,
            total,
            limit: parseInt(limit),
            skip: parseInt(skip)
        }
    };
}

/**
 * Đánh dấu hóa đơn đã thanh toán
 * @param {String} invoiceId
 * @param {String} paidByUserId - ID của user thực hiện thanh toán
 * @returns {Object} - { ok, data, message, code }
 */
async function markAsPaid(invoiceId, paidByUserId) {
    const invoice = await Invoice.findById(invoiceId);

    if (!invoice) {
        return { ok: false, code: 404, message: 'Không tìm thấy hóa đơn' };
    }

    if (invoice.status === 'paid') {
        return { ok: false, code: 400, message: 'Hóa đơn đã được thanh toán' };
    }

    invoice.status = 'paid';
    invoice.paidAt = new Date();
    invoice.paidBy = paidByUserId;
    await invoice.save();

    const updatedInvoice = await Invoice.findById(invoiceId)
        .populate('examinationId')
        .populate('patientId', 'fullName phone cccd')
        .populate('paidBy', 'fullName role')
        .lean();

    return {
        ok: true,
        data: updatedInvoice,
        message: 'Thanh toán hóa đơn thành công'
    };
}

/**
 * Lấy lịch sử hóa đơn của bệnh nhân
 * @param {String} patientId
 * @param {Object} filters - { status, limit, skip }
 * @returns {Object} - { ok, data }
 */
async function getPatientInvoices(patientId, filters = {}) {
    // Kiểm tra patient tồn tại
    const patient = await Patient.findById(patientId).lean();
    if (!patient) {
        return { ok: false, code: 404, message: 'Không tìm thấy bệnh nhân' };
    }

    const { status, limit = 50, skip = 0 } = filters;

    const query = { patientId };
    if (status) query.status = status;

    const invoices = await Invoice.find(query)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(skip))
        .populate('examinationId', 'examDate diagnosis')
        .populate('paidBy', 'fullName')
        .lean();

    const total = await Invoice.countDocuments(query);

    return {
        ok: true,
        data: {
            invoices,
            total,
            limit: parseInt(limit),
            skip: parseInt(skip)
        }
    };
}

/**
 * Thống kê doanh thu
 * @param {Object} filters - { period, fromDate, toDate }
 * @returns {Object} - { ok, data }
 */
async function getRevenueStatistics(filters = {}) {
    const { period = 'monthly', fromDate, toDate } = filters;

    const query = {};

    // Filter by date range
    if (fromDate || toDate) {
        query.createdAt = {};
        if (fromDate) query.createdAt.$gte = new Date(fromDate);
        if (toDate) query.createdAt.$lte = new Date(toDate);
    }

    // Tổng doanh thu
    const allInvoices = await Invoice.find(query).lean();
    const totalRevenue = allInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);

    // Doanh thu đã thu
    const paidInvoices = allInvoices.filter(inv => inv.status === 'paid');
    const paidAmount = paidInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);

    // Doanh thu chưa thu
    const unpaidInvoices = allInvoices.filter(inv => inv.status === 'unpaid');
    const unpaidAmount = unpaidInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);

    // Thống kê theo period
    const byPeriod = [];

    if (period === 'daily') {
        // Group by day
        const grouped = {};
        allInvoices.forEach(inv => {
            const date = new Date(inv.createdAt).toISOString().split('T')[0];
            if (!grouped[date]) {
                grouped[date] = { date, total: 0, paid: 0, unpaid: 0, count: 0 };
            }
            grouped[date].total += inv.totalAmount;
            grouped[date].count += 1;
            if (inv.status === 'paid') {
                grouped[date].paid += inv.totalAmount;
            } else {
                grouped[date].unpaid += inv.totalAmount;
            }
        });
        byPeriod.push(...Object.values(grouped));
    } else if (period === 'monthly') {
        // Group by month
        const grouped = {};
        allInvoices.forEach(inv => {
            const date = new Date(inv.createdAt);
            const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (!grouped[month]) {
                grouped[month] = { month, total: 0, paid: 0, unpaid: 0, count: 0 };
            }
            grouped[month].total += inv.totalAmount;
            grouped[month].count += 1;
            if (inv.status === 'paid') {
                grouped[month].paid += inv.totalAmount;
            } else {
                grouped[month].unpaid += inv.totalAmount;
            }
        });
        byPeriod.push(...Object.values(grouped));
    } else if (period === 'yearly') {
        // Group by year
        const grouped = {};
        allInvoices.forEach(inv => {
            const year = new Date(inv.createdAt).getFullYear().toString();
            if (!grouped[year]) {
                grouped[year] = { year, total: 0, paid: 0, unpaid: 0, count: 0 };
            }
            grouped[year].total += inv.totalAmount;
            grouped[year].count += 1;
            if (inv.status === 'paid') {
                grouped[year].paid += inv.totalAmount;
            } else {
                grouped[year].unpaid += inv.totalAmount;
            }
        });
        byPeriod.push(...Object.values(grouped));
    }

    return {
        ok: true,
        data: {
            totalRevenue,
            paidAmount,
            unpaidAmount,
            totalInvoices: allInvoices.length,
            paidInvoices: paidInvoices.length,
            unpaidInvoices: unpaidInvoices.length,
            byPeriod: byPeriod.sort((a, b) => {
                const keyA = a.date || a.month || a.year;
                const keyB = b.date || b.month || b.year;
                return keyB.localeCompare(keyA);
            })
        }
    };
}

/**
 * Cập nhật hóa đơn (chỉ cập nhật được hóa đơn chưa thanh toán)
 * @param {String} invoiceId
 * @param {Object} updates - { items }
 * @returns {Object} - { ok, data, message, code }
 */
async function updateInvoice(invoiceId, updates) {
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
        return { ok: false, code: 404, message: 'Không tìm thấy hóa đơn' };
    }

    // Only allow updating unpaid invoices
    if (invoice.status === 'paid') {
        return { ok: false, code: 400, message: 'Không thể cập nhật hóa đơn đã thanh toán' };
    }

    // Update items if provided
    if (updates.items && Array.isArray(updates.items)) {
        // Recalculate total amount
        let totalAmount = 0;
        for (const item of updates.items) {
            // Validate referenceId
            if (!item.referenceId || item.referenceId.trim() === '') {
                return { ok: false, code: 400, message: 'referenceId là bắt buộc cho mỗi item' };
            }

            const service = await Service.findById(item.referenceId).lean();
            if (service) {
                totalAmount += service.price * (item.quantity || 1);
            }
        }
        invoice.items = updates.items;
        invoice.totalAmount = totalAmount;
    }

    await invoice.save();

    const updated = await Invoice.findById(invoiceId)
        .populate('examinationId', 'examDate')
        .populate('patientId', 'fullName phone')
        .populate('paidBy', 'fullName')
        .lean();

    return {
        ok: true,
        data: updated,
        message: 'Cập nhật hóa đơn thành công'
    };
}

/**
 * Xóa hóa đơn (soft delete, chỉ xóa được hóa đơn chưa thanh toán)
 * @param {String} invoiceId
 * @returns {Object} - { ok, message, code }
 */
async function deleteInvoice(invoiceId) {
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
        return { ok: false, code: 404, message: 'Không tìm thấy hóa đơn' };
    }

    // Only allow deleting unpaid invoices
    if (invoice.status === 'paid') {
        return { ok: false, code: 400, message: 'Không thể xóa hóa đơn đã thanh toán' };
    }

    // Soft delete - mark as cancelled
    invoice.status = 'cancelled';
    await invoice.save();

    return {
        ok: true,
        message: 'Xóa hóa đơn thành công'
    };
}

module.exports = {
    createInvoice,
    getInvoiceById,
    listInvoices,
    markAsPaid,
    getPatientInvoices,
    getRevenueStatistics,
    updateInvoice,
    deleteInvoice
};
