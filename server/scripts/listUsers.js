const mongoose = require('mongoose');
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

// List all users
const listUsers = async () => {
  try {
    // Find all users
    const users = await User.find({}).select('-password');

    console.log('Total users:', users.length);
    console.log('-------------------');

    // Display users by role
    const adminUsers = users.filter(user => user.role === 'admin');
    const teacherUsers = users.filter(user => user.role === 'teacher');
    const studentUsers = users.filter(user => user.role === 'student');
    const visitorUsers = users.filter(user => user.role === 'visitor');

    console.log('Admin Users:', adminUsers.length);
    adminUsers.forEach(user => {
      console.log(`- ${user.firstName} ${user.lastName} (${user.email})`);
    });
    console.log('-------------------');

    console.log('Teacher Users:', teacherUsers.length);
    teacherUsers.forEach(user => {
      console.log(`- ${user.firstName} ${user.lastName} (${user.email})`);
      console.log(`  Academic Rank: ${user.academicRank}`);
      console.log(`  Birth Date: ${user.birthDate}`);
      console.log(`  Approved: ${user.isApproved}`);
      console.log('');
    });
    console.log('-------------------');

    console.log('Student Users:', studentUsers.length);
    studentUsers.forEach(user => {
      console.log(`- ${user.firstName} ${user.lastName} (${user.email})`);
      console.log(`  Level: ${user.level}`);
      console.log(`  Field of Study: ${user.fieldOfStudy}`);
      console.log(`  Birth Date: ${user.birthDate}`);
      console.log(`  Username: ${user.username}`);
      console.log(`  Approved: ${user.isApproved}`);
      console.log('');
    });
    console.log('-------------------');

    console.log('Visitor Users:', visitorUsers.length);
    visitorUsers.forEach(user => {
      console.log(`- ${user.firstName} ${user.lastName} (${user.email})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error listing users:', error);
    process.exit(1);
  }
};

// Run the function
listUsers();
