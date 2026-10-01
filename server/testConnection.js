/**
 * MongoDB Connection Test Script
 * 
 * This script tests the MongoDB connection with different options.
 * Run this script to diagnose connection issues on a new PC.
 * 
 * Usage: node testConnection.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config();

console.log('=== MongoDB Connection Test ===');
console.log('Node.js version:', process.version);
console.log('Mongoose version:', mongoose.version);
console.log('Current directory:', process.cwd());

// Check if .env file exists
const envPath = path.join(process.cwd(), '.env');
const envExists = fs.existsSync(envPath);
console.log('.env file exists:', envExists);

// Get MongoDB URI from environment or use default
let mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  mongoUri = 'mongodb://localhost:27017/educational_platform';
  console.log('No MONGODB_URI found in environment, using default:', mongoUri);
} else {
  // Hide sensitive information in logs
  const sanitizedUri = mongoUri.replace(/(mongodb(\+srv)?:\/\/)[^:]+:[^@]+@/, '$1*****:*****@');
  console.log('Found MONGODB_URI in environment:', sanitizedUri);
}

// Test DNS resolution for MongoDB Atlas domain (if applicable)
if (mongoUri.includes('mongodb+srv')) {
  const domain = mongoUri.match(/mongodb\+srv:\/\/[^:]+:[^@]+@([^\/]+)/)[1];
  console.log('Testing DNS resolution for MongoDB Atlas domain:', domain);
  
  const dns = require('dns');
  dns.lookup(domain, (err, address) => {
    if (err) {
      console.error('DNS resolution failed:', err.message);
      console.log('This suggests a network or DNS issue on this PC.');
      console.log('Try the following:');
      console.log('1. Check internet connection');
      console.log('2. Try using Google DNS (8.8.8.8)');
      console.log('3. Check firewall settings');
    } else {
      console.log('DNS resolution successful:', domain, '->', address);
    }
  });
}

// Test MongoDB connection with different options
async function testConnection() {
  console.log('\nTesting MongoDB connection...');
  
  try {
    // Test with default options
    console.log('Attempt 1: Connecting with default options...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connection successful!');
    await mongoose.disconnect();
    
    return true;
  } catch (error) {
    console.error('❌ Connection failed with default options:', error.message);
    
    // If the first attempt failed, try with increased timeouts
    try {
      console.log('\nAttempt 2: Connecting with increased timeouts...');
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 30000,
        socketTimeoutMS: 45000,
        connectTimeoutMS: 30000,
        bufferTimeoutMS: 30000
      });
      console.log('✅ Connection successful with increased timeouts!');
      await mongoose.disconnect();
      
      return true;
    } catch (error) {
      console.error('❌ Connection failed with increased timeouts:', error.message);
      
      // If using MongoDB Atlas, try with a direct connection string
      if (mongoUri.includes('mongodb+srv')) {
        try {
          console.log('\nAttempt 3: Converting srv URL to direct connection...');
          // This is a simplified conversion and might not work for all cases
          const directUri = mongoUri.replace('mongodb+srv://', 'mongodb://');
          console.log('Using direct connection URI (simplified)');
          
          await mongoose.connect(directUri, {
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
            connectTimeoutMS: 30000,
            bufferTimeoutMS: 30000
          });
          console.log('✅ Connection successful with direct connection!');
          await mongoose.disconnect();
          
          return true;
        } catch (error) {
          console.error('❌ Connection failed with direct connection:', error.message);
        }
      }
      
      return false;
    }
  }
}

// Run the test
testConnection()
  .then(success => {
    if (success) {
      console.log('\n=== Connection Test Summary ===');
      console.log('MongoDB connection was successful!');
      console.log('Your application should be able to connect to the database.');
    } else {
      console.log('\n=== Connection Test Summary ===');
      console.log('All connection attempts failed.');
      console.log('\nPossible solutions:');
      console.log('1. Check if MongoDB Atlas IP whitelist includes this PC\'s IP address');
      console.log('2. Check network/firewall settings on this PC');
      console.log('3. Try using a local MongoDB installation instead');
      console.log('4. Create a new .env file with the correct MongoDB URI');
    }
    process.exit(0);
  })
  .catch(error => {
    console.error('Test script error:', error);
    process.exit(1);
  });
