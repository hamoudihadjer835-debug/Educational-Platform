const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });
console.log('Loading .env from:', path.join(__dirname, '../.env'));

// Import User model
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// New admin password
const newPassword = 'admin123';

// Reset admin password
const resetAdminPassword = async () => {
  try {
    // Find admin user
    const adminUser = await User.findOne({ email: 'admin@example.com' });

    if (!adminUser) {
      console.log('Admin user not found');
      process.exit(1);
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update admin password directly in the database
    await User.updateOne(
      { email: 'admin@example.com' },
      { $set: { password: hashedPassword } }
    );

    console.log('Admin password reset successfully');
    console.log(`Email: admin@example.com`);
    console.log(`Password: ${newPassword}`);

    process.exit(0);
  } catch (error) {
    console.error('Error resetting admin password:', error);
    process.exit(1);
  }
};

// Run the function
resetAdminPassword();
