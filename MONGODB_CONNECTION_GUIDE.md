# MongoDB Connection Guide

This guide provides solutions for MongoDB connection issues when deploying the Educational Platform to a new PC.

## Prerequisites

- The application requires a working MongoDB connection to function
- You need either:
  - MongoDB Atlas account (cloud-based)
  - Local MongoDB installation

## Connection Verification

First, verify your MongoDB connection:

```bash
cd server
node verifyMongoDBConnection.js
```

This script will:
1. Test DNS resolution for MongoDB Atlas domains
2. Attempt to connect to MongoDB
3. Provide detailed diagnostics about any connection issues
4. Suggest specific solutions based on the error

## Common Connection Issues and Solutions

### 1. DNS Resolution Errors

**Error:** `queryTxt ETIMEOUT cluster0.xxxx.mongodb.net`

This error indicates that your PC cannot resolve the DNS SRV records for MongoDB Atlas.

**Solutions:**

1. **Configure DNS Settings**:
   - Use Google's DNS servers (8.8.8.8 and 8.8.4.4)
   - Open Network Settings > Change adapter options
   - Right-click on your active connection > Properties
   - Select "Internet Protocol Version 4 (TCP/IPv4)" > Properties
   - Select "Use the following DNS server addresses"
   - Enter 8.8.8.8 and 8.8.4.4
   - Click OK and restart your PC

2. **Use Direct Connection**:
   - In MongoDB Atlas, click "Connect" on your cluster
   - Choose "Connect your application"
   - Select "Node.js" as the driver
   - Copy the connection string
   - Replace `mongodb+srv://` with `mongodb://` in your .env file
   - Add port 27017 if not specified

### 2. IP Whitelist Issues

**Error:** `MongooseServerSelectionError: Authentication failed`

This error often indicates that your IP address is not in the MongoDB Atlas whitelist.

**Solutions:**

1. **Add Your IP to MongoDB Atlas Whitelist**:
   - Log in to MongoDB Atlas
   - Go to Network Access under Security
   - Click "Add IP Address"
   - Add your current IP address or use "Allow Access from Anywhere" (0.0.0.0/0) for testing
   - Save changes

2. **Find Your IP Address**:
   - Visit [whatismyip.com](https://www.whatismyip.com)
   - Or run `ipconfig` in Command Prompt and look for "IPv4 Address"

### 3. Firewall Issues

**Error:** Connection timeouts or refused connections

**Solutions:**

1. **Check Windows Firewall**:
   - Open Windows Defender Firewall
   - Click "Allow an app or feature through Windows Defender Firewall"
   - Ensure Node.js is allowed on both Private and Public networks
   - If not, click "Change settings" > "Allow another app" and browse to node.exe

2. **Check Third-Party Firewalls**:
   - Temporarily disable any antivirus or security software
   - Test the connection again
   - If it works, add exceptions for Node.js in your security software

### 4. Connection String Issues

**Error:** Various authentication or connection errors

**Solutions:**

1. **Verify Connection String Format**:
   - Ensure your connection string follows this format:
     ```
     mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
     ```
   - Make sure to replace `username`, `password`, `cluster`, and `database` with your actual values

2. **Check for Special Characters**:
   - If your password contains special characters, ensure they are URL-encoded
   - For example, `@` should be `%40`, `#` should be `%23`, etc.

3. **Verify Database Name**:
   - Ensure the database name in your connection string is correct
   - The database name comes after the hostname and before the query parameters

## Using Local MongoDB

If you can't connect to MongoDB Atlas, you can use a local MongoDB installation:

1. **Install MongoDB Community Edition**:
   - Download from [MongoDB website](https://www.mongodb.com/try/download/community)
   - Follow the installation instructions

2. **Start MongoDB Service**:
   - Open Command Prompt as Administrator
   - Run: `net start MongoDB`

3. **Update Your .env File**:
   ```
   MONGODB_URI=mongodb://localhost:27017/educational_platform
   ```

4. **Verify Connection**:
   ```
   node verifyMongoDBConnection.js
   ```

## Need More Help?

If you've tried all these solutions and still can't connect:

1. **Get Detailed Diagnostics**:
   ```
   node verifyMongoDBConnection.js > mongodb_diagnostics.txt
   ```

2. **Check MongoDB Atlas Status**:
   - Visit [MongoDB Status Page](https://status.mongodb.com/)
   - Ensure there are no ongoing service disruptions

3. **Contact Your Network Administrator**:
   - In corporate environments, additional network restrictions may be in place
   - Ask about outbound access to MongoDB Atlas domains and port 27017
