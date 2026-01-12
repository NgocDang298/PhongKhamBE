require('mandatoryenv').load([
    'DB_URL',
    'PORT',
    'SECRET'
]);

module.exports = {
    DB_URL: process.env.DB_URL,
    PORT: process.env.PORT,
    SECRET: process.env.SECRET
};


