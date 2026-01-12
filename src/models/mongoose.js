const mongoose = require('mongoose');

const {
    DB_URL
} = process.env;

mongoose.set('strictQuery', true);

const connectMongoose = async () => {
    if (mongoose.connection.readyState === 1) return mongoose.connection;
    await mongoose.connect(DB_URL, {
        serverSelectionTimeoutMS: 10000
    });
    return mongoose.connection;
};

module.exports = {
    mongoose,
    connectMongoose
};


