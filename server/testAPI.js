const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const User = require('./models/User');
const Module = require('./models/Module');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

async function testAPI() {
  try {
    console.log('Testing API...');
    
    // 1. Find an admin user
    const adminUser = await User.findOne({ role: 'admin' }).select('-password');
    if (!adminUser) {
      console.log('No admin user found. Creating one...');
      
      // Create a new admin user if none exists
      const newAdmin = new User({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin',
        isApproved: true
      });
      
      await newAdmin.save();
      console.log('Admin user created:', newAdmin);
    } else {
      console.log('Admin user found:', adminUser);
    }
    
    // 2. Find a teacher user
    const teacherUser = await User.findOne({ role: 'teacher', isApproved: true }).select('-password');
    console.log('Teacher user:', teacherUser || 'None found');
    
    // 3. Find modules
    const modules = await Module.find().populate('teacher', 'firstName lastName email');
    console.log('Modules:', modules.length ? modules : 'None found');
    
    // 4. Generate a token for the admin user
    const adminToken = jwt.sign(
      { id: adminUser._id, role: adminUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    console.log('Generated admin token:', adminToken);
    console.log('Use this token for testing API calls');
    
  } catch (error) {
    console.error('Error testing API:', error);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the function
testAPI()
  .then(() => {
    console.log('Script completed');
    process.exit(0);
  })
  .catch(err => {
    console.error('Script failed:', err);
    process.exit(1);
  });
