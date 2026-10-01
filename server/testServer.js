/**
 * Server Test Script
 * 
 * This script tests the server's basic functionality without requiring a database connection.
 * Run this script to verify that the server is working correctly on a new PC.
 * 
 * Usage: node testServer.js
 */

const http = require('http');
const os = require('os');

console.log('=== Server Test Script ===');
console.log('Node.js version:', process.version);
console.log('Operating System:', os.type(), os.release());
console.log('Hostname:', os.hostname());
console.log('Network Interfaces:');

// Get all network interfaces
const networkInterfaces = os.networkInterfaces();
Object.keys(networkInterfaces).forEach(interfaceName => {
  const interfaces = networkInterfaces[interfaceName];
  interfaces.forEach(iface => {
    if (iface.family === 'IPv4') {
      console.log(`  ${interfaceName}: ${iface.address}`);
    }
  });
});

// Test server health endpoint
console.log('\nTesting server health endpoint...');
const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/health',
  method: 'GET'
};

const req = http.request(options, res => {
  console.log(`Status Code: ${res.statusCode}`);
  
  let data = '';
  res.on('data', chunk => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log('Response:', JSON.stringify(response, null, 2));
      
      if (response.status === 'ok') {
        console.log('\n✅ Server is running correctly!');
        
        if (response.database === 'disconnected') {
          console.log('\n⚠️ Database is disconnected, but the server is still operational.');
          console.log('This is expected if you have not configured the database connection.');
          console.log('The server will use mock data for API responses.');
        } else {
          console.log('\n✅ Database is connected!');
        }
      } else {
        console.log('\n❌ Server health check returned unexpected status.');
      }
    } catch (error) {
      console.error('\n❌ Error parsing response:', error.message);
    }
  });
});

req.on('error', error => {
  console.error('\n❌ Server test failed:', error.message);
  console.log('\nPossible reasons:');
  console.log('1. The server is not running. Start it with: node server.js');
  console.log('2. The server is running on a different port. Check the PORT in .env');
  console.log('3. There might be a firewall blocking the connection');
});

req.end();

// Print instructions for next steps
console.log('\n=== Next Steps ===');
console.log('1. If the server test passed, try starting the client:');
console.log('   cd client');
console.log('   npm run dev');
console.log('2. If you need database functionality, check MongoDB connection:');
console.log('   node testConnection.js');
console.log('3. For more detailed troubleshooting, refer to MONGODB_TROUBLESHOOTING.md');
