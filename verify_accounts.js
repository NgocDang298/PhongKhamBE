
const axios = require('axios');

async function testApis() {
    const baseUrl = 'http://localhost:3000/api';
    console.log("To verify, please run the following curl commands in a separate terminal if you have a valid token:");
    console.log(`curl -H "Authorization: Bearer <TOKEN>" ${baseUrl}/doctors`);
    console.log(`curl -H "Authorization: Bearer <TOKEN>" ${baseUrl}/patients`);
    console.log("Verification via script requires auth token. Please manually verify using Postman or Curl.");
}

testApis();
