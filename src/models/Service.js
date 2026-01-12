const { mongoose } = require('./mongoose');

const ServiceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    serviceType: {
        type: String,
        enum: ['examination', 'test', 'other'],
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    collection: 'services',
    timestamps: true
});

module.exports = mongoose.model('Service', ServiceSchema);


