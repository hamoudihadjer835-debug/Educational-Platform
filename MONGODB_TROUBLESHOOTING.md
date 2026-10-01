# MongoDB Connection Troubleshooting Guide

This guide will help you resolve MongoDB connection issues when deploying the Educational Platform to a new PC.

## Common MongoDB Connection Errors

### Error: "queryTxt ETIMEOUT cluster0.xxxx.mongodb.net"

This error indicates a DNS resolution timeout when trying to connect to MongoDB Atlas. The PC cannot resolve the DNS SRV records for the MongoDB Atlas cluster.

**Solutions:**

1. **Run the Connection Test Script**:
   ```bash
   cd server
   node testConnection.js
   ```
   This script will diagnose connection issues and provide specific recommendations.

2. **Check Internet Connection**:
   - Ensure the PC has a stable internet connection
   - Try accessing other websites to verify connectivity
   - Run `ping google.com` to check general internet connectivity

3. **Configure DNS Settings**:
   - Use Google's DNS servers (8.8.8.8 and 8.8.4.4)
   - Open Network Settings > Change adapter options
   - Right-click on your active connection > Properties
   - Select "Internet Protocol Version 4 (TCP/IPv4)" > Properties
   - Select "Use the following DNS server addresses"
   - Enter 8.8.8.8 and 8.8.4.4
   - Click OK and restart your PC

4. **Add Your IP to MongoDB Atlas Whitelist**:
   - Log in to MongoDB Atlas
   - Go to Network Access under Security
   - Click "Add IP Address"
   - Add your current IP address or use "Allow Access from Anywhere" (0.0.0.0/0) for testing
   - Save changes

5. **Check Firewall Settings**:
   - Temporarily disable Windows Firewall to test:
     - Open Windows Defender Firewall
     - Click "Turn Windows Defender Firewall on or off"
     - Select "Turn off Windows Defender Firewall" for both networks (temporarily)
   - If connection works with firewall off, add exceptions for Node.js and MongoDB

6. **Try a Direct Connection String**:
   - In MongoDB Atlas, click "Connect" on your cluster
   - Choose "Connect your application"
   - Select "Node.js" as the driver
   - Copy the connection string
   - Replace the existing MONGODB_URI in your .env file
   - Make sure to replace `<password>` with your actual password

7. **Use a Local MongoDB Installation**:
   - If you have MongoDB installed locally, update your .env file:
     ```
     MONGODB_URI=mongodb://localhost:27017/educational_platform
     ```
   - Start MongoDB locally:
     ```
     net start MongoDB
     ```

### Error: "MongoServerSelectionError: connection timed out"

This error indicates that the connection attempt to MongoDB timed out.

**Solutions:**

1. **Increase Connection Timeouts**:
   - The application already includes increased timeouts in the server.js file
   - If still experiencing issues, you can further increase them in the testConnection.js script

2. **Check Network Latency**:
   - High network latency can cause connection timeouts
   - Try using a different network connection if available

3. **Check for VPN or Proxy**:
   - If you're using a VPN, try disconnecting it
   - If your network uses a proxy, configure Node.js to use it:
     ```
     set HTTP_PROXY=http://proxy-server:port
     set HTTPS_PROXY=http://proxy-server:port
     ```

### Error: "MongoError: bad auth Authentication failed"

This error indicates incorrect credentials in your MongoDB connection string.

**Solutions:**

1. **Verify Username and Password**:
   - Double-check the username and password in your connection string
   - Ensure there are no special characters that need URL encoding
   - Try regenerating the password in MongoDB Atlas

2. **Check Database Name**:
   - Ensure the database name in the connection string is correct
   - The format should be: `mongodb+srv://username:password@cluster.xxxx.mongodb.net/database_name`

## Verifying a Successful Connection

After implementing the solutions, you can verify the connection is working by:

1. Running the test script:
   ```bash
   node server/testConnection.js
   ```

2. Starting the server and checking the logs:
   ```bash
   cd server
   npm run dev
   ```
   Look for the message "MongoDB connected successfully"

3. Testing a simple API endpoint:
   ```bash
   curl http://localhost:5000/api/auth/check
   ```

## Additional Resources

- [MongoDB Atlas Connection Troubleshooting](https://docs.atlas.mongodb.com/troubleshoot-connection/)
- [Node.js MongoDB Driver Documentation](https://mongodb.github.io/node-mongodb-native/)
- [Mongoose Connection Documentation](https://mongoosejs.com/docs/connections.html)

If you continue to experience issues after trying these solutions, please contact the development team for further assistance.
