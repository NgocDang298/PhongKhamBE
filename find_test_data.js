const config = require('./src/config');
const { connectMongoose } = require('./src/models/mongoose');
const { LabNurse, TestRequest } = require('./src/models');

async function findData() {
    await connectMongoose();

    console.log('--- Lab Nurses ---');
    const nurses = await LabNurse.find().limit(5).lean();
    nurses.forEach(n => console.log(`ID: ${n._id}, Name: ${n.fullName}`));

    console.log('\n--- Test Requests (Waiting/Processing) ---');
    const requests = await TestRequest.find({ status: { $ne: 'completed' } }).limit(5).lean();
    requests.forEach(r => console.log(`ID: ${r._id}, Status: ${r.status}`));

    process.exit(0);
}

findData().catch(err => {
    console.error(err);
    process.exit(1);
});
