const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: require('path').resolve(__dirname, '../.env') });

// Import User model
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Student user data
const studentData = {
  firstName: 'Sarah',
  lastName: 'Johnson',
  email: 'sarah.johnson@example.com',
  password: 'student123',
  role: 'student',
  isApproved: true,
  birthDate: new Date('2000-08-20'),
  level: 'lmd2',
  fieldOfStudy: 'Computer Science'
};

// Create student user
const createStudent = async () => {
  try {
    // Check if student already exists
    const existingStudent = await User.findOne({ email: studentData.email });

    if (existingStudent) {
      console.log('Student user already exists');
      process.exit(0);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(studentData.password, salt);

    // Create student user
    await User.create({
      ...studentData,
      password: hashedPassword
    });

    console.log('Student user created successfully:');
    console.log(`Email: ${studentData.email}`);
    console.log(`Password: ${studentData.password}`);

    process.exit(0);
  } catch (error) {
    console.error('Error creating student user:', error);
    process.exit(1);
  }
};

// Run the function
createStudent();
