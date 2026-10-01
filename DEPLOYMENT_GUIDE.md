# Deployment Guide

This guide will help you set up the Educational Platform on a new PC.

## Prerequisites

- Node.js (v16.0.0 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- Git

## Step 1: Clone the Repository

```bash
git clone <repository-url>
cd The-Platform
```

## Step 2: Install Dependencies

Install all dependencies for both client and server:

```bash
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

## Step 3: Set Up Environment Variables

1. Create a `.env` file in the `server` directory:

```bash
cd server
cp ../.env.example .env
```

2. Edit the `.env` file with your specific configuration:

```
# MongoDB Connection String
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
# Or for local MongoDB: MONGODB_URI=mongodb://localhost:27017/educational_platform

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=30d

# Server Port (only used in development)
PORT=5000

# Cloudinary Configuration (if using Cloudinary for file uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Step 4: Start the Application

### Development Mode

To run the application in development mode:

```bash
# Start the server (from the root directory)
npm run dev:server

# In a separate terminal, start the client
npm run dev:client
```

### Production Mode

To build and run the application in production mode:

1. Build the client:

```bash
npm run build
```

2. Start the server:

```bash
npm start
```

## Step 5: Access the Application

- Development mode: 
  - Client: http://localhost:5173 (or the port shown in the terminal)
  - Server: http://localhost:5000

- Production mode:
  - The application will be served from http://localhost:5000

## Troubleshooting

### Database Connection Issues

If you encounter database connection issues:

1. Verify your MongoDB connection string in the `.env` file
2. Ensure MongoDB is running if using a local installation
3. Check network connectivity if using MongoDB Atlas

### Node.js Version Issues

If you encounter Node.js compatibility issues:

1. Verify your Node.js version: `node -v`
2. Use nvm (Node Version Manager) to install the correct version if needed

### Port Conflicts

If port 5000 or 5173 is already in use:

1. Change the PORT value in the `.env` file for the server
2. For the client, you can specify a different port in the `client/vite.config.js` file

## Backup and Data Migration

If you need to migrate data from an existing installation:

1. Export data from the existing MongoDB database
2. Import the data into the new MongoDB database

For MongoDB Atlas:
```bash
# Export
mongodump --uri="mongodb+srv://username:password@cluster.mongodb.net/database"

# Import
mongorestore --uri="mongodb+srv://username:password@new-cluster.mongodb.net/database" dump/
```

For local MongoDB:
```bash
# Export
mongodump --db educational_platform --out ./backup

# Import
mongorestore --db educational_platform ./backup/educational_platform
```
