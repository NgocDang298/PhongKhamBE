const { mongoose } = require('./mongoose');

const InvoiceSchema = new mongoose.Schema({
    examinationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Examination',
        required: true,
        index: true
    },
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true,
        index: true
    },
    items: [{
        type: {
            type: String,
            enum: ['service', 'test'],
            required: true
        },
        referenceId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true,
            min: 0
        },
        quantity: {
            type: Number,
            default: 1,
            min: 1
        }
    }],
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: [
            'unpaid',
            'paid',
            'cancelled'
        ],
        default: 'unpaid',
        index: true
    },
    paidAt: {
        type: Date
    },
    paidBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    collection: 'invoices',
    timestamps: true
});

module.exports = mongoose.model('Invoice', InvoiceSchema);


