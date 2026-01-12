const { mongoose } = require('./mongoose');

const MedicalProfileSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true,
        unique: true,
        index: true
    },
    bloodType: {
        type: String,
        trim: true
    },
    allergies: [
        {
            type: String,
            trim: true
        }
    ],
    chronicDiseases: [
        {
            type: String,
            trim: true
        }
    ],
    medications: [
        {
            type: String,
            trim: true
        }
    ],
    surgeries: [
        {
            type: String,
            trim: true
        }
    ],
    familyHistory: [
        {
            type: String,
            trim: true
        }
    ],
    notes: {
        type: String,
        trim: true
    }
}, {
    collection: 'medicalprofiles',
    timestamps: true
});

module.exports = mongoose.model('MedicalProfile', MedicalProfileSchema);













