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

// Teacher user data
const teacherData = {
  firstName: 'John',
  lastName: 'Smith',
  email: 'john.smith@university.edu',
  password: 'teacher123',
  role: 'teacher',
  isApproved: true,
  birthDate: new Date('1980-05-15'),
  academicRank: 'Professor'
};

// Create teacher user
const createTeacher = async () => {
  try {
    // Check if teacher already exists
    const existingTeacher = await User.findOne({ email: teacherData.email });

    if (existingTeacher) {
      console.log('Teacher user already exists');
      process.exit(0);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(teacherData.password, salt);

    // Create teacher user
    await User.create({
      ...teacherData,
      password: hashedPassword
    });

    console.log('Teacher user created successfully:');
    console.log(`Email: ${teacherData.email}`);
    console.log(`Password: ${teacherData.password}`);

    process.exit(0);
  } catch (error) {
    console.error('Error creating teacher user:', error);
    process.exit(1);
  }
};

// Run the function
createTeacher();
