const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });
console.log('Loading .env from:', path.join(__dirname, '../.env'));

// Connect to MongoDB directly
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
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    console.log('Generated hash:', hashedPassword);

    // Update admin password directly in the database
    const result = await mongoose.connection.collection('users').updateOne(
      { email: 'admin@example.com' },
      { $set: { password: hashedPassword } }
    );

    if (result.modifiedCount === 1) {
      console.log('Admin password reset successfully');
      console.log(`Email: admin@example.com`);
      console.log(`Password: ${newPassword}`);
    } else {
      console.log('Admin user not found or password not updated');
    }

    // Verify the update
    const adminUser = await mongoose.connection.collection('users').findOne({ email: 'admin@example.com' });
    console.log('Updated user password hash:', adminUser.password);

    process.exit(0);
  } catch (error) {
    console.error('Error resetting admin password:', error);
    process.exit(1);
  }
};

// Run the function
resetAdminPassword();
