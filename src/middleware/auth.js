const jwt = require('jsonwebtoken');
const { SECRET } = require('../config');
const { User } = require('../models');

function getTokenFromRequest(req) {
    const header = req.headers && req.headers.authorization;
    if (header && header.startsWith('Bearer ')) return header.slice(7);
    if (req.cookies && req.cookies.token) return req.cookies.token;
    return null;
}

module.exports = {
    async authenticate(req, res, next) {
        const token = getTokenFromRequest(req);
        if (!token) return res.status(401).json({ status: false, message: 'Unauthorized' });

        try {
            const payload = jwt.verify(token, SECRET);
            const user = await User.findById(payload._id);
            if (!user) return res.status(401).json({ status: false, message: 'User not found' });

            req.user = user;
            req.token = token; // Lưu token để sử dụng cho chức năng đăng xuất
            return next();
        } catch (err) {
            return res.status(401).json({ status: false, message: 'Invalid token' });
        }
    },

    authorize(allowedRoles) {
        return (req, res, next) => {
            if (!req.user || !req.user.role) return res.status(403).json({ status: false, message: 'Forbidden' });
            if (!Array.isArray(allowedRoles) || allowedRoles.length === 0) return next();
            if (allowedRoles.includes(req.user.role)) return next();
            return res.status(403).json({ status: false, message: 'Forbidden' });
        }
    }
};
