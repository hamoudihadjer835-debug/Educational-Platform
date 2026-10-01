const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
// Configure CORS - extremely permissive to work on any PC
app.use(cors({
  // Allow all origins by default for maximum compatibility
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  exposedHeaders: ['Content-Disposition'] // For file downloads
}));

// Log CORS configuration
console.log('CORS configured with permissive settings for cross-PC compatibility');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Request headers:', req.headers);
  console.log('Request body:', req.body);

  // Add response logging
  const originalSend = res.send;
  res.send = function(data) {
    console.log(`Response for ${req.method} ${req.url} - Status: ${res.statusCode}`);
    console.log('Response data:', typeof data === 'string' ? data.substring(0, 200) : data);
    return originalSend.apply(res, arguments);
  };

  next();
});

// Serve uploaded files with proper content types
const uploadsDir = path.join(__dirname, 'uploads');
const mime = require('mime-types');
const fs = require('fs');

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory:', uploadsDir);
}

// Custom middleware to serve files with proper content types
app.use('/uploads', (req, res, next) => {
  const filePath = path.join(uploadsDir, req.path);

  // Check if file exists
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    // Get file extension and determine content type
    const ext = path.extname(filePath).toLowerCase();
    let contentType = mime.lookup(filePath) || 'application/octet-stream';

    // Set more specific content types for common file types
    if (ext === '.pdf') {
      contentType = 'application/pdf';
    } else if (['.mp4', '.webm', '.mov'].includes(ext)) {
      contentType = `video/${ext.substring(1)}`;
    } else if (['.mp3', '.wav'].includes(ext)) {
      contentType = `audio/${ext.substring(1)}`;
    } else if (['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) {
      contentType = `image/${ext === '.jpg' ? 'jpeg' : ext.substring(1)}`;
    } else if (['.doc', '.docx'].includes(ext)) {
      contentType = 'application/msword';
    } else if (['.ppt', '.pptx'].includes(ext)) {
      contentType = 'application/vnd.ms-powerpoint';
    }

    res.setHeader('Content-Type', contentType);

    // Set CORS headers to ensure files can be accessed from the frontend
    // Use permissive CORS settings for cross-PC compatibility
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Determine if the file should be viewed inline or downloaded
    // Files that can be viewed in browser should be inline
    const fileName = path.basename(filePath);
    const viewableTypes = [
      'application/pdf',
      'image/jpeg', 'image/png', 'image/gif',
      'video/mp4', 'video/webm',
      'audio/mp3', 'audio/wav'
    ];

    // Check if the request specifically asks for download
    const forceDownload = req.query.download === 'true';

    if (viewableTypes.includes(contentType) && !forceDownload) {
      // For viewable files, set to inline for browser viewing
      res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
    } else {
      // For other files or when download is requested, force download
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    }

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } else {
    next();
  }
});

// Fallback to static file serving
app.use('/uploads', express.static(uploadsDir));

// Create a route to check if a file exists
app.get('/api/check-file/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(uploadsDir, filename);

  const fs = require('fs');
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    res.json({
      exists: true,
      size: stats.size,
      path: `/uploads/${filename}`,
      lastModified: stats.mtime
    });
  } else {
    res.json({ exists: false });
  }
});

// Skip environment variables logging

// Global flag to track database connection status
global.dbConnected = false;

// Connect to MongoDB - mandatory connection
console.log('Connecting to MongoDB...');

// Validate MongoDB URI
if (!process.env.MONGODB_URI) {
  console.error('ERROR: MONGODB_URI environment variable is not set');
  console.error('Please set MONGODB_URI in your .env file');
  process.exit(1); // Exit with error code
} else {
  // Hide sensitive information in logs
  const sanitizedUri = process.env.MONGODB_URI.replace(/(mongodb(\+srv)?:\/\/)[^:]+:[^@]+@/, '$1*****:*****@');
  console.log('Using MongoDB URI:', sanitizedUri);
}

// Connect to MongoDB with retry logic
const connectToMongoDB = async (retryCount = 0, maxRetries = 5) => {
  try {
    // Connection options optimized for cross-PC compatibility
    const connectionOptions = {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      family: 4, // Force IPv4 (helps with DNS issues)
      readPreference: 'primaryPreferred'
    };

    console.log(`MongoDB connection attempt ${retryCount + 1}/${maxRetries + 1}...`);

    // Try to connect with the provided URI
    await mongoose.connect(process.env.MONGODB_URI, connectionOptions);

    console.log('✅ MongoDB connected successfully');
    global.dbConnected = true;

    // Verify connection by accessing users collection
    try {
      const User = require('./models/User');
      const userCount = await User.countDocuments();
      console.log(`Database contains ${userCount} users`);
    } catch (error) {
      console.error('Error accessing users collection:', error);
      throw new Error('Database connection verified but could not access collections');
    }

    return true;
  } catch (err) {
    console.error(`❌ MongoDB connection attempt ${retryCount + 1} failed:`, err.message);

    // If this is a DNS error and we're using srv, try direct connection
    if (err.message.includes('ETIMEOUT') && process.env.MONGODB_URI.includes('mongodb+srv://')) {
      try {
        console.log('DNS resolution failed. Attempting direct connection without SRV...');

        // Convert mongodb+srv:// to mongodb:// (simplified approach)
        const directUri = process.env.MONGODB_URI
          .replace('mongodb+srv://', 'mongodb://')
          .replace(/mongodb:\/\/([^\/]+)\//, 'mongodb://$1:27017/');

        const sanitizedDirectUri = directUri.replace(/(mongodb:\/\/)[^:]+:[^@]+@/, '$1*****:*****@');
        console.log('Trying direct connection URI:', sanitizedDirectUri);

        await mongoose.connect(directUri, {
          serverSelectionTimeoutMS: 30000,
          socketTimeoutMS: 45000,
          connectTimeoutMS: 30000,
          family: 4
        });

        console.log('✅ MongoDB connected successfully with direct connection');
        global.dbConnected = true;
        return true;
      } catch (directErr) {
        console.error('Direct connection attempt failed:', directErr.message);
      }
    }

    // If we haven't reached max retries, try again
    if (retryCount < maxRetries) {
      const delay = Math.min(5000 * (retryCount + 1), 15000); // Exponential backoff with max 15 seconds
      console.log(`Retrying connection in ${delay/1000} seconds... (Attempt ${retryCount + 2}/${maxRetries + 1})`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return connectToMongoDB(retryCount + 1, maxRetries);
    } else {
      // All connection attempts failed
      console.error('❌ All MongoDB connection attempts failed');
      console.error('The server requires a database connection to function.');
      console.error('\nPossible causes:');
      console.error('1. MongoDB Atlas IP whitelist does not include your current IP');
      console.error('2. DNS resolution issues - try using Google DNS (8.8.8.8)');
      console.error('3. Network/firewall blocking MongoDB connections');
      console.error('4. Incorrect MongoDB URI in .env file');

      // Exit the process with error code
      process.exit(1);
    }
  }
};

// Start connection process - this must succeed for the server to start
connectToMongoDB().catch(err => {
  console.error('Fatal database connection error:', err);
  process.exit(1);
});

// Import routes
const authRoutes = require('./routes/authRoutes');

// Import middleware
const dbErrorMiddleware = require('./middlewares/dbErrorMiddleware');

// Import routes
const adminRoutes = require('./routes/adminRoutes.new');
const teacherRoutes = require('./routes/teacherRoutes.new');
const studentRoutes = require('./routes/studentRoutes.new');
const quizRoutes = require('./routes/quizRoutes');

// Apply database error middleware to all API routes
app.use('/api', dbErrorMiddleware);

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/student', studentRoutes);
app.use('/api', quizRoutes);

// Basic route for testing
app.get('/', (_, res) => {
  if (!global.dbConnected) {
    return res.status(503).send('Educational Platform API is running but cannot connect to the database');
  }
  res.send('Educational Platform API is running with database connection');
});

// Health check endpoint
app.get('/api/health', (_, res) => {
  if (!global.dbConnected) {
    return res.status(503).json({
      status: 'error',
      server: 'running',
      database: 'disconnected',
      message: 'Database connection is required for the application to function properly',
      timestamp: new Date().toISOString()
    });
  }

  res.json({
    status: 'ok',
    server: 'running',
    database: 'connected',
    timestamp: new Date().toISOString()
  });
});

// Start the server only after database connection is established
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n=== Server Status ===`);
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ Database connection: ${global.dbConnected ? 'CONNECTED' : 'DISCONNECTED'}`);
  console.log(`\nAPI available at: http://localhost:${PORT}/api`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`\nNOTE: This server requires a working database connection to function properly.`);
  console.log(`If you're having connection issues, run: node verifyMongoDBConnection.js`);
});

// Export the Express app
module.exports = app;
