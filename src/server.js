

// Các bản vá lỗi
const { inject, errorHandler } = require('express-custom-error');
inject(); // Bản vá express để sử dụng cú pháp async / await

// Yêu cầu các phụ thuộc

const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');


const logger = require('./util/logger');

// Tải các biến môi trường .env vào process.env
require('./config');

const { PORT } = process.env;


// Khởi tạo ứng dụng Express
const app = express();


// Cấu hình instance ứng dụng Express
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cấu hình middleware logger tùy chỉnh
app.use(logger.dev, logger.combined);

app.use(cookieParser());
app.use(cors());
app.use(helmet());

// Middleware này thêm header json vào mọi response
app.use('*', (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    next();
})

// Khởi tạo kết nối cơ sở dữ liệu
const { connectMongoose } = require('./models/mongoose');

// Gán các route

app.use('/api/v1', require('./routes/router.js'));



// Swagger UI
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));


// Xử lý lỗi
app.use(errorHandler());

// Xử lý route không hợp lệ
app.use('*', (req, res) => {
    res
        .status(404)
        .json({ status: false, message: 'Endpoint Not Found' });
})

// Mở Server trên Port đã chọn sau khi DB kết nối
connectMongoose()
    .then(() => {
        app.listen(
            PORT,
            () => console.info('Server listening on port ', PORT)
        );
    })
    .catch((err) => {
        console.error('Failed to connect to MongoDB via Mongoose', err);
        process.exit(1);
    });