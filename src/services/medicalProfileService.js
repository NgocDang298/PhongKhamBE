const { MedicalProfile, Patient } = require('../models');

async function createOrGetMedicalProfile(user, payload) {
    if (!user || user.role !== 'patient') {
        return { ok: false, code: 403, message: 'Forbidden' };
    }

    try {
        const patient = await Patient.findOne({ userId: user._id }, '_id');
        if (!patient) {
            return { ok: false, code: 400, message: 'Patient profile not found for user' };
        }

        let profile = await MedicalProfile.findOne({ patientId: patient._id });
        if (profile) {
            return { ok: true, data: profile, message: 'Lấy thông tin hồ sơ y tế thành công' };
        }

        profile = await MedicalProfile.create({
            patientId: patient._id,
            bloodType: payload && payload.bloodType,
            allergies: payload && Array.isArray(payload.allergies) ? payload.allergies : undefined,
            chronicDiseases: payload && Array.isArray(payload.chronicDiseases) ? payload.chronicDiseases : undefined,
            medications: payload && Array.isArray(payload.medications) ? payload.medications : undefined,
            surgeries: payload && Array.isArray(payload.surgeries) ? payload.surgeries : undefined,
            familyHistory: payload && Array.isArray(payload.familyHistory) ? payload.familyHistory : undefined,
            notes: payload && payload.notes
        });

        return { ok: true, code: 201, data: profile, message: 'Tạo hồ sơ y tế thành công' };
    } catch (err) {
        if (err && err.code === 11000) {
            const patient = await Patient.findOne({ userId: user._id }, '_id');
            const profile = await MedicalProfile.findOne({ patientId: patient._id });
            if (profile) return { ok: true, data: profile, message: 'Lấy thông tin hồ sơ y tế thành công' };
        }
        return { ok: false, code: 500, message: 'Internal server error' };
    }
}

async function createOrGetMedicalProfileForPatient(actorUser, targetPatientId, payload) {
    if (!actorUser || (actorUser.role !== 'staff' && actorUser.role !== 'admin')) {
        return { ok: false, code: 403, message: 'Forbidden' };
    }

    if (!targetPatientId) {
        return { ok: false, code: 400, message: 'patientId is required' };
    }

    try {
        const patient = await Patient.findById(targetPatientId, '_id');
        if (!patient) {
            return { ok: false, code: 404, message: 'Patient not found' };
        }

        let profile = await MedicalProfile.findOne({ patientId: patient._id });
        if (profile) {
            return { ok: true, data: profile, message: 'Lấy thông tin hồ sơ y tế thành công' };
        }

        profile = await MedicalProfile.create({
            patientId: patient._id,
            bloodType: payload && payload.bloodType,
            allergies: payload && Array.isArray(payload.allergies) ? payload.allergies : undefined,
            chronicDiseases: payload && Array.isArray(payload.chronicDiseases) ? payload.chronicDiseases : undefined,
            medications: payload && Array.isArray(payload.medications) ? payload.medications : undefined,
            surgeries: payload && Array.isArray(payload.surgeries) ? payload.surgeries : undefined,
            familyHistory: payload && Array.isArray(payload.familyHistory) ? payload.familyHistory : undefined,
            notes: payload && payload.notes
        });

        return { ok: true, code: 201, data: profile, message: 'Tạo hồ sơ y tế thành công' };
    } catch (err) {
        if (err && err.code === 11000) {
            const profile = await MedicalProfile.findOne({ patientId: targetPatientId });
            if (profile) return { ok: true, data: profile, message: 'Lấy thông tin hồ sơ y tế thành công' };
        }
        return { ok: false, code: 500, message: 'Internal server error' };
    }
}

async function updateMedicalProfile(user, payload) {
    if (!user || user.role !== 'patient') {
        return { ok: false, code: 403, message: 'Forbidden' };
    }

    try {
        const patient = await Patient.findOne({ userId: user._id }, '_id');
        if (!patient) {
            return { ok: false, code: 400, message: 'Patient profile not found for user' };
        }

        let profile = await MedicalProfile.findOne({ patientId: patient._id });
        if (!profile) {
            return { ok: false, code: 404, message: 'Medical profile not found' };
        }

        // Update fields
        const allowedFields = ['bloodType', 'allergies', 'chronicDiseases', 'medications', 'surgeries', 'familyHistory', 'notes'];
        allowedFields.forEach(field => {
            if (payload[field] !== undefined) {
                profile[field] = payload[field];
            }
        });

        await profile.save();

        return { ok: true, data: profile, message: 'Cập nhật hồ sơ y tế thành công' };
    } catch (err) {
        return { ok: false, code: 500, message: 'Internal server error' };
    }
}

async function updateMedicalProfileForPatient(actorUser, targetPatientId, payload) {
    if (!actorUser || (actorUser.role !== 'staff' && actorUser.role !== 'admin')) {
        return { ok: false, code: 403, message: 'Forbidden' };
    }

    if (!targetPatientId) {
        return { ok: false, code: 400, message: 'patientId is required' };
    }

    try {
        const patient = await Patient.findById(targetPatientId, '_id');
        if (!patient) {
            return { ok: false, code: 404, message: 'Patient not found' };
        }

        let profile = await MedicalProfile.findOne({ patientId: patient._id });
        if (!profile) {
            return { ok: false, code: 404, message: 'Medical profile not found' };
        }

        // Update fields
        const allowedFields = ['bloodType', 'allergies', 'chronicDiseases', 'medications', 'surgeries', 'familyHistory', 'notes'];
        allowedFields.forEach(field => {
            if (payload[field] !== undefined) {
                profile[field] = payload[field];
            }
        });

        await profile.save();

        return { ok: true, data: profile, message: 'Cập nhật hồ sơ y tế thành công' };
    } catch (err) {
        return { ok: false, code: 500, message: 'Internal server error' };
    }
}

module.exports = {
    createOrGetMedicalProfile,
    createOrGetMedicalProfileForPatient,
    updateMedicalProfile,
    updateMedicalProfileForPatient
};


