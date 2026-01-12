const { Service } = require('../models');

/**
 * Tạo dịch vụ mới
 * @param {Object} params - { name, description, price, serviceType }
 * @returns {Object} - { ok, data, message, code }
 */
async function createService({ name, description, price, serviceType }) {
    // Validate required fields
    if (!name || !price || !serviceType) {
        return { ok: false, code: 400, message: 'name, price và serviceType là bắt buộc' };
    }

    // Validate serviceType
    const validTypes = ['examination', 'test', 'other'];
    if (!validTypes.includes(serviceType)) {
        return { ok: false, code: 400, message: 'serviceType phải là examination, test hoặc other' };
    }

    // Validate price
    if (price < 0) {
        return { ok: false, code: 400, message: 'Giá dịch vụ phải lớn hơn hoặc bằng 0' };
    }

    // Kiểm tra tên dịch vụ đã tồn tại chưa
    const existingService = await Service.findOne({ name: name.trim() }).lean();
    if (existingService) {
        return { ok: false, code: 400, message: 'Tên dịch vụ đã tồn tại' };
    }

    // Tạo dịch vụ mới
    const service = await Service.create({
        name: name.trim(),
        description: description?.trim() || '',
        price,
        serviceType,
        isActive: true
    });

    return {
        ok: true,
        data: service,
        message: 'Tạo dịch vụ thành công'
    };
}

/**
 * Lấy thông tin chi tiết dịch vụ
 * @param {String} serviceId
 * @returns {Object} - { ok, data, message, code }
 */
async function getServiceById(serviceId) {
    const service = await Service.findById(serviceId).lean();

    if (!service) {
        return { ok: false, code: 404, message: 'Không tìm thấy dịch vụ' };
    }

    return { ok: true, data: service };
}

/**
 * Danh sách dịch vụ với filter
 * @param {Object} filters - { serviceType, isActive, search, limit, skip }
 * @returns {Object} - { ok, data }
 */
async function listServices(filters = {}) {
    const { serviceType, isActive, search, limit = 50, skip = 0 } = filters;

    const query = {};

    // Filter by serviceType
    if (serviceType) {
        const validTypes = ['examination', 'test', 'other'];
        if (validTypes.includes(serviceType)) {
            query.serviceType = serviceType;
        }
    }

    // Filter by isActive
    if (isActive !== undefined) {
        query.isActive = isActive === 'true' || isActive === true;
    }

    // Search by name
    if (search) {
        query.name = { $regex: search, $options: 'i' };
    }

    const services = await Service.find(query)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(skip))
        .lean();

    const total = await Service.countDocuments(query);

    return {
        ok: true,
        data: {
            services,
            total,
            limit: parseInt(limit),
            skip: parseInt(skip)
        }
    };
}

/**
 * Cập nhật thông tin dịch vụ
 * @param {String} serviceId
 * @param {Object} updates - { name, description, price, isActive }
 * @returns {Object} - { ok, data, message, code }
 */
async function updateService(serviceId, updates) {
    const service = await Service.findById(serviceId);

    if (!service) {
        return { ok: false, code: 404, message: 'Không tìm thấy dịch vụ' };
    }

    // Validate price if provided
    if (updates.price !== undefined && updates.price < 0) {
        return { ok: false, code: 400, message: 'Giá dịch vụ phải lớn hơn hoặc bằng 0' };
    }

    // Check duplicate name if name is being updated
    if (updates.name && updates.name !== service.name) {
        const existingService = await Service.findOne({
            name: updates.name.trim(),
            _id: { $ne: serviceId }
        }).lean();

        if (existingService) {
            return { ok: false, code: 400, message: 'Tên dịch vụ đã tồn tại' };
        }
    }

    // Update fields
    if (updates.name) service.name = updates.name.trim();
    if (updates.description !== undefined) service.description = updates.description.trim();
    if (updates.price !== undefined) service.price = updates.price;
    if (updates.isActive !== undefined) service.isActive = updates.isActive;

    await service.save();

    return {
        ok: true,
        data: service,
        message: 'Cập nhật dịch vụ thành công'
    };
}

/**
 * Xóa dịch vụ hoàn toàn khỏi database (hard delete)
 * @param {String} serviceId
 * @returns {Object} - { ok, message, code }
 */
async function deactivateService(serviceId) {
    const service = await Service.findById(serviceId);

    if (!service) {
        return { ok: false, code: 404, message: 'Không tìm thấy dịch vụ' };
    }

    // Hard delete - xóa hoàn toàn khỏi database
    await Service.findByIdAndDelete(serviceId);

    return {
        ok: true,
        message: 'Xóa dịch vụ thành công'
    };
}

/**
 * Lấy danh sách dịch vụ đang hoạt động
 * @param {String} serviceType - Optional filter by type
 * @returns {Object} - { ok, data }
 */
async function getActiveServices(serviceType) {
    const query = { isActive: true };

    if (serviceType) {
        const validTypes = ['examination', 'test', 'other'];
        if (validTypes.includes(serviceType)) {
            query.serviceType = serviceType;
        }
    }

    const services = await Service.find(query)
        .sort({ name: 1 })
        .lean();

    return {
        ok: true,
        data: services
    };
}

module.exports = {
    createService,
    getServiceById,
    listServices,
    updateService,
    deactivateService,
    getActiveServices
};
