const morgan = require('morgan');
const rfs = require('rotating-file-stream');
const path = require('path');
const fs = require('fs');

// đường dẫn thư mục log
const logDirectory = path.resolve(__dirname, '../../log');

// đảm bảo thư mục log tồn tại
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

// tạo một write stream xoay vòng
const accessLogStream = rfs('access.log', {
    interval: '1d',
    path: logDirectory
})

module.exports = {
    dev: morgan('dev'),
    combined: morgan('combined', { stream: accessLogStream })
}