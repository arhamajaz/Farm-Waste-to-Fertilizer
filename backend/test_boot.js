const http = require('http');
const { app, startServer } = require('./server');

async function testBoot() {
  console.log('--- STARTING SERVER BOOT VERIFICATION ---');
  let serverInstance;

  try {
    serverInstance = await startServer();
    console.log('✅ Server instance created successfully.');

    // Wait 500ms then probe /api/health
    await new Promise(resolve => setTimeout(resolve, 500));

    const options = {
      hostname: '127.0.0.1',
      port: process.env.PORT || 5000,
      path: '/api/health',
      method: 'GET'
    };

    const req = http.request(options, res => {
      let data = '';
      res.on('data', chunk => {
        data += chunk;
      });
      res.on('end', () => {
        console.log(`✅ Health check responded with status ${res.statusCode}:`);
        console.log('Response body:', JSON.parse(data));

        serverInstance.close(() => {
          console.log('✅ Server gracefully stopped after verification.');
          process.exit(0);
        });
      });
    });

    req.on('error', err => {
      console.error('❌ Request to /api/health failed:', err.message);
      if (serverInstance) serverInstance.close();
      process.exit(1);
    });

    req.end();
  } catch (err) {
    console.error('❌ Boot verification caught error:', err);
    if (serverInstance) serverInstance.close();
    process.exit(1);
  }
}

testBoot();
