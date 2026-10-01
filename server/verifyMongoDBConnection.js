/**
 * MongoDB Connection Verification Script
 * 
 * This script tests the MongoDB connection with different strategies.
 * It provides detailed diagnostics about connection issues.
 * 
 * Usage: node verifyMongoDBConnection.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const dns = require('dns');
const os = require('os');

// Load environment variables
dotenv.config();

console.log('=== MongoDB Connection Verification ===');
console.log('Node.js version:', process.version);
console.log('Operating System:', os.type(), os.release());

// Get MongoDB URI from environment
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error('❌ ERROR: MONGODB_URI environment variable is not set');
  console.error('Please set MONGODB_URI in your .env file');
  process.exit(1);
}

// Hide sensitive information in logs
const sanitizedUri = mongoUri.replace(/(mongodb(\+srv)?:\/\/)[^:]+:[^@]+@/, '$1*****:*****@');
console.log('MongoDB URI:', sanitizedUri);

// Check if it's an Atlas connection
const isAtlasConnection = mongoUri.includes('mongodb+srv://') || 
                          mongoUri.includes('.mongodb.net');

if (isAtlasConnection) {
  console.log('Connection type: MongoDB Atlas (cloud)');
} else if (mongoUri.includes('localhost') || mongoUri.includes('127.0.0.1')) {
  console.log('Connection type: Local MongoDB');
} else {
  console.log('Connection type: Remote MongoDB (non-Atlas)');
}

// Get hostname for DNS checks
let hostname = '';
try {
  if (mongoUri.includes('mongodb+srv://')) {
    hostname = mongoUri.match(/mongodb\+srv:\/\/[^:]+:[^@]+@([^\/]+)/)[1];
  } else if (mongoUri.includes('mongodb://')) {
    const hostPart = mongoUri.match(/mongodb:\/\/[^:]+:[^@]+@([^\/:\s]+)/);
    if (hostPart && hostPart[1]) {
      hostname = hostPart[1];
    }
  }
} catch (error) {
  console.error('Could not parse hostname from URI');
}

// Check DNS resolution if it's an Atlas connection
if (hostname && isAtlasConnection) {
  console.log('\n=== DNS Resolution Test ===');
  console.log('Testing DNS resolution for:', hostname);
  
  dns.lookup(hostname, (err, address) => {
    if (err) {
      console.error('❌ DNS resolution failed:', err.message);
      console.log('\nThis suggests a network or DNS issue on this PC.');
      console.log('Recommended solutions:');
      console.log('1. Configure your PC to use Google DNS (8.8.8.8 and 8.8.4.4)');
      console.log('2. Check if your firewall is blocking DNS lookups');
      console.log('3. Try connecting from a different network');
      
      // Continue with connection test anyway
      testConnection();
    } else {
      console.log('✅ DNS resolution successful:', hostname, '->', address);
      
      // If DNS works, check if we can ping the server
      const net = require('net');
      const socket = new net.Socket();
      const port = 27017; // MongoDB default port
      
      console.log(`Testing TCP connection to ${address}:${port}...`);
      
      // Set a timeout for the connection attempt
      socket.setTimeout(5000);
      
      socket.on('connect', () => {
        console.log(`✅ TCP connection to ${address}:${port} successful`);
        socket.destroy();
        testConnection();
      });
      
      socket.on('timeout', () => {
        console.log(`❌ TCP connection to ${address}:${port} timed out`);
        console.log('This suggests a firewall is blocking the connection');
        socket.destroy();
        testConnection();
      });
      
      socket.on('error', (err) => {
        console.log(`❌ TCP connection to ${address}:${port} failed:`, err.message);
        console.log('This suggests a network/firewall issue');
        socket.destroy();
        testConnection();
      });
      
      // Attempt to connect
      socket.connect(port, address);
    }
  });
} else {
  // Skip DNS test if not an Atlas connection
  testConnection();
}

// Test MongoDB connection
async function testConnection() {
  console.log('\n=== MongoDB Connection Test ===');
  
  try {
    // Connection options optimized for diagnostics
    const connectionOptions = {
      serverSelectionTimeoutMS: 10000, // Shorter timeout for quicker feedback
      socketTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      family: 4, // Force IPv4 (helps with some DNS issues)
    };

    console.log('Attempting connection with standard options...');
    await mongoose.connect(mongoUri, connectionOptions);
    
    console.log('✅ MongoDB connected successfully!');
    
    // Check if we can access a collection
    try {
      const collections = await mongoose.connection.db.listCollections().toArray();
      console.log(`\nDatabase contains ${collections.length} collections:`);
      collections.forEach(collection => {
        console.log(`- ${collection.name}`);
      });
    } catch (error) {
      console.error('Could not list collections:', error.message);
    }
    
    // Close the connection
    await mongoose.connection.close();
    console.log('Connection closed');
    
    console.log('\n=== SUMMARY ===');
    console.log('✅ MongoDB connection test PASSED');
    console.log('Your application should be able to connect to the database');
    process.exit(0);
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    
    // If this is a DNS error and we're using srv, try direct connection
    if (err.message.includes('ETIMEOUT') && mongoUri.includes('mongodb+srv://')) {
      try {
        console.log('\nDNS resolution failed. Attempting direct connection without SRV...');
        
        // Convert mongodb+srv:// to mongodb:// (simplified approach)
        const directUri = mongoUri
          .replace('mongodb+srv://', 'mongodb://')
          .replace(/mongodb:\/\/([^\/]+)\//, 'mongodb://$1:27017/');
        
        const sanitizedDirectUri = directUri.replace(/(mongodb:\/\/)[^:]+:[^@]+@/, '$1*****:*****@');
        console.log('Trying direct connection URI:', sanitizedDirectUri);
        
        await mongoose.connect(directUri, {
          serverSelectionTimeoutMS: 10000,
          socketTimeoutMS: 10000,
          connectTimeoutMS: 10000,
          family: 4
        });
        
        console.log('✅ MongoDB connected successfully with direct connection!');
        await mongoose.connection.close();
        
        console.log('\n=== SUMMARY ===');
        console.log('✅ MongoDB connection test PASSED with direct connection');
        console.log('Recommendation: Update your .env file to use this direct connection string instead of SRV');
        process.exit(0);
      } catch (directErr) {
        console.error('❌ Direct connection attempt also failed:', directErr.message);
      }
    }
    
    console.log('\n=== SUMMARY ===');
    console.log('❌ MongoDB connection test FAILED');
    console.log('\nPossible causes:');
    console.log('1. MongoDB Atlas IP whitelist does not include your current IP');
    console.log('2. DNS resolution issues - try using Google DNS (8.8.8.8)');
    console.log('3. Network/firewall blocking MongoDB connections');
    console.log('4. Incorrect MongoDB URI in .env file');
    
    console.log('\nTo fix IP whitelist issue:');
    console.log('1. Log in to MongoDB Atlas');
    console.log('2. Go to Network Access under Security');
    console.log('3. Add your current IP address or use 0.0.0.0/0 for testing');
    
    process.exit(1);
  }
}
