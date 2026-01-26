const serviceService = require('../services/serviceService');

/**
 * Tạo dịch vụ mới
 * POST /services
 * Body: { name, description, price, serviceType }
 */
async function createService(req, res) {
    const { name, description, price, serviceType } = req.body;

    const result = await serviceService.createService({
        name,
        description,
        price,
        serviceType
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
 * Lấy thông tin chi tiết dịch vụ
 * GET /services/:id
 */
async function getService(req, res) {
    const { id } = req.params;

    const result = await serviceService.getServiceById(id);

    if (!result.ok) {
        return res.status(result.code || 404).json({
            status: false,
            message: result.message
        });
    }

    return res.json({
        status: true,
        message: result.message || 'Lấy thông tin dịch vụ thành công',
        data: result.data
    });
}

/**
 * Danh sách dịch vụ
 * GET /services
 * Query params: serviceType, isActive, search, limit, skip
 */
async function listServices(req, res) {
    const filters = {
        serviceType: req.query.serviceType,
        isActive: req.query.isActive,
        search: req.query.search,
        limit: req.query.limit,
        skip: req.query.skip
    };

    const result = await serviceService.listServices(filters);

    if (!result.ok) {
        return res.status(result.code || 400).json({
            status: false,
            message: result.message
        });
    }

    return res.json({
        status: true,
        message: result.message || 'Lấy danh sách dịch vụ thành công',
        data: result.data
    });
}

/**
 * Cập nhật dịch vụ
 * PUT /services/:id
 * Body: { name, description, price, isActive }
 */
async function updateService(req, res) {
    const { id } = req.params;
    const updates = req.body;

    const result = await serviceService.updateService(id, updates);

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
 * Vô hiệu hóa dịch vụ
 * DELETE /services/:id
 */
async function deactivateService(req, res) {
    const { id } = req.params;

    const result = await serviceService.deactivateService(id);

    if (!result.ok) {
        return res.status(result.code || 400).json({
            status: false,
            message: result.message
        });
    }

    return res.json({
        status: true,
        message: result.message
    });
}

/**
 * Lấy danh sách dịch vụ đang hoạt động
 * GET /services/active
 * Query params: serviceType (optional)
 */
async function getActiveServices(req, res) {
    const { serviceType } = req.query;

    const result = await serviceService.getActiveServices(serviceType);

    if (!result.ok) {
        return res.status(result.code || 400).json({
            status: false,
            message: result.message
        });
    }

    return res.json({
        status: true,
        message: result.message || 'Lấy danh sách dịch vụ đang hoạt động thành công',
        data: result.data
    });
}

module.exports = {
    createService,
    getService,
    listServices,
    updateService,
    deactivateService,
    getActiveServices
};
