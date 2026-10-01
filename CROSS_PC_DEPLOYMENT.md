# Cross-PC Deployment Guide

This guide provides detailed instructions for deploying the Educational Platform to any PC, even with limited network connectivity or database access.

## Prerequisites

- Node.js (v14.0.0 or higher)
- npm (v6.0.0 or higher)
- Git (optional, for cloning the repository)

## Step 1: Get the Code

### Option 1: Clone the Repository
```bash
git clone <repository-url>
cd educational-platform
```

### Option 2: Copy the Files
Transfer all project files to the target PC using a USB drive or other means.

## Step 2: Install Dependencies

```bash
# Install all dependencies (server and client)
npm run install:all

# Or install them separately
cd server
npm install
cd ../client
npm install
```

## Step 3: Configure Environment Variables

1. Create a `.env` file in the server directory:

```bash
cd server
cp .env.example .env
```

2. Edit the `.env` file with appropriate values:

```
# MongoDB Connection String (use your actual connection string)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
# Or for local MongoDB: MONGODB_URI=mongodb://localhost:27017/educational_platform

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=30d

# Server Port
PORT=5000
```

## Step 4: Test the Server Without Database

The server is designed to work even without a database connection. To test this:

```bash
cd server
node testServer.js
```

This script will check if the server can start and respond to basic requests without requiring a database connection.

## Step 5: Test Database Connectivity (Optional)

If you want to use the database features, test the MongoDB connection:

```bash
cd server
node testConnection.js
```

This script will attempt to connect to MongoDB using different strategies and provide detailed diagnostics.

## Step 6: Start the Server

```bash
cd server
npm run dev
```

The server should start successfully, even if it can't connect to the database. You'll see output indicating whether the database connection was successful.

## Step 7: Start the Client

```bash
cd client
npm run dev
```

The client should start and connect to the server. You can access it at http://localhost:5173 (or the port shown in the console).

## Troubleshooting

### Server Starts but Database Doesn't Connect

This is expected if:
- You don't have MongoDB installed locally
- You don't have internet access to connect to MongoDB Atlas
- Your MongoDB Atlas IP whitelist doesn't include your current IP

The server will run in "offline mode" with mock data. Most features will work, but data won't be persisted.

To fix database connectivity issues:

1. **Check MongoDB Atlas IP Whitelist**:
   - Log in to MongoDB Atlas
   - Go to Network Access under Security
   - Add your current IP address

2. **Try Using Google DNS**:
   - Configure your PC to use Google's DNS servers (8.8.8.8 and 8.8.4.4)
   - This often resolves DNS resolution issues with MongoDB Atlas

3. **Check Firewall Settings**:
   - Ensure your firewall allows outbound connections on port 27017

For more detailed MongoDB troubleshooting, see [MONGODB_TROUBLESHOOTING.md](MONGODB_TROUBLESHOOTING.md).

### Client Can't Connect to Server

If the client starts but can't connect to the server:

1. **Check Server Logs**:
   - Ensure the server is running and listening on the expected port
   - Look for any error messages

2. **Check CORS Settings**:
   - The server is configured with permissive CORS settings
   - If you're still having issues, check the browser console for CORS errors

3. **Check Network Configuration**:
   - Ensure there's no firewall blocking connections between client and server
   - If running on different machines, ensure they can reach each other

## Running in Production Mode

For production deployment:

```bash
# Build the client
cd client
npm run build

# Start the server in production mode
cd ../server
npm start
```

## Offline Mode Features

When running without a database connection:

- The server will generate mock data for API responses
- You can still navigate the UI and test most features
- Data won't be persisted between server restarts
- The server will clearly indicate when it's using mock data

This allows you to demonstrate and test the application even without a working database connection.

## Need More Help?

If you encounter issues not covered in this guide:

1. Check the server logs for specific error messages
2. Run the diagnostic scripts (`testServer.js` and `testConnection.js`)
3. Refer to the MongoDB troubleshooting guide
4. Contact the development team for assistance
