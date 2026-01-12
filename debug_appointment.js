require('dotenv').config();
const { connectMongoose } = require('./src/models/mongoose');
const Appointment = require('./src/models/Appointment');

async function run() {
    try {
        console.log('Connecting to DB...');
        await connectMongoose();
        console.log('Connected.');

        const id = '6941e1271501620a7d86a1da';
        const appointment = await Appointment.findById(id);

        if (!appointment) {
            console.log('Appointment not found');
        } else {
            console.log('Appointment found:');
            console.log(JSON.stringify(appointment, null, 2));
            console.log('Stored patientId:', appointment.patientId);
        }
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}

run();
