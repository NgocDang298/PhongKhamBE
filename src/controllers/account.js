const accountService = require('../services/accountService');

/**
 * Lấy danh sách tất cả tài khoản
 * GET /accounts?role=patient&search=keyword
 */
async function getAllAccounts(req, res) {
    const filters = {
        role: req.query.role,
        search: req.query.search
    };

    const result = await accountService.getAllAccounts(filters);

    if (!result.ok) {
        return res.status(result.code || 500).json({
            status: false,
            message: result.message
        });
    }

    return res.json({
        status: true,
        message: result.message || 'Lấy danh sách tài khoản thành công',
        data: result.data
    });
}

/**
 * Lấy thông tin chi tiết một tài khoản
 * GET /accounts/:id
 */
async function getAccountById(req, res) {
    const userId = req.params.id;

    const result = await accountService.getAccountById(userId);

    if (!result.ok) {
        return res.status(result.code || 404).json({
            status: false,
            message: result.message
        });
    }

    return res.json({
        status: true,
        message: result.message || 'Lấy thông tin tài khoản thành công',
        data: result.data
    });
}

module.exports = {
    getAllAccounts,
    getAccountById
};
