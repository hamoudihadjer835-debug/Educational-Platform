const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: require('path').resolve(__dirname, '../.env') });

// Import User model
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Admin user data
const adminData = {
  firstName: 'Admin',
  lastName: 'User',
  email: 'admin@example.com',
  password: 'Admin123!', // Stronger password
  role: 'admin',
  isApproved: true,
  birthDate: new Date('1990-01-01'), // Default birth date for admin
  securityQuestions: {
    question1: 'What was the name of your first pet?',
    answer1: 'admin',
    question2: 'In what city were you born?',
    answer2: 'admin'
  }
};

// Create admin user
const createAdmin = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminData.email });

    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminData.password, salt);

    // Create admin user
    await User.create({
      ...adminData,
      password: hashedPassword,
      // Ensure security questions are included
      securityQuestions: adminData.securityQuestions
    });

    console.log('Admin user created successfully:');
    console.log(`Email: ${adminData.email}`);
    console.log(`Password: ${adminData.password}`);
    console.log(`Role: ${adminData.role}`);
    console.log('Security Questions Set Up:');
    console.log(`Question 1: ${adminData.securityQuestions.question1}`);
    console.log(`Question 2: ${adminData.securityQuestions.question2}`);
    console.log('Both answers are set to: "admin"');

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

// Run the function
createAdmin();
