const { mongoose } = require('./mongoose');

const TestResultSchema = new mongoose.Schema({
    testRequestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TestRequest',
        required: true,
        index: true
    },
    labNurseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LabNurse',
        required: true,
        index: true
    },
    resultData: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    images: [{
        type: String // URLs from Cloudinary
    }],
    performedAt: {
        type: Date,
        required: true
    }
}, {
    collection: 'testresults',
    timestamps: true
});

module.exports = mongoose.model('TestResult', TestResultSchema);
