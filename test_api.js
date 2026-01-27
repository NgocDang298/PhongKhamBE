const http = require('http');

async function run() {
    console.log('--- Step 1: Login ---');
    const loginData = JSON.stringify({ cccd: '555555555555', password: 'labnurse123!' });
    const token = await new Promise((resolve, reject) => {
        const req = http.request({
            hostname: 'localhost', port: 8000, path: '/api/v1/auth/login', method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(loginData) }
        }, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const json = JSON.parse(data);
                if (json.token) resolve(json.token);
                else reject(new Error('Login failed: ' + data));
            });
        });
        req.on('error', reject);
        req.write(loginData);
        req.end();
    });

    console.log('Login successful.');

    console.log('\n--- Step 2: Test POST /api/v1/test-results ---');
    const payload = JSON.stringify({
        testRequestId: "694b539a4c719e010203fa3e",
        resultData: {
            value: "fdfd",
            notes: "fdfd"
        },
        labNurseId: "694b56eb4c719e010203fb9c",
        images: [
            "https://res.cloudinary.com/drqbhj6ft/image/upload/v1769482953/clinic/test-results/mvsxkgut2psxcb33el5k.jpg"
        ]
    });

    const result = await new Promise((resolve, reject) => {
        const req = http.request({
            hostname: 'localhost', port: 8000, path: '/api/v1/test-results', method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload),
                'Authorization': `Bearer ${token}`
            }
        }, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                console.log('Status Code:', res.statusCode);
                console.log('Response Body:', data);
                resolve(data);
            });
        });
        req.on('error', reject);
        req.write(payload);
        req.end();
    });
}

run().catch(console.error);
