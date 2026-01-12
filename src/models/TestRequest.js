const { mongoose } = require('./mongoose');

const TestRequestSchema = new mongoose.Schema({
    examId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Examination',
        required: true,
        index: true
    },
    serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
        required: true,
        index: true
    },
    testType: {
        type: String,
        required: true
    },
    requestedAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: [
            'waiting',
            'processing',
            'completed'
        ],
        default: 'waiting',
        index: true
    },
    labNurseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LabNurse',
        required: true,
        index: true
    }
}, {
    collection: 'testrequests',
    timestamps: true
});

module.exports = mongoose.model('TestRequest', TestRequestSchema);


