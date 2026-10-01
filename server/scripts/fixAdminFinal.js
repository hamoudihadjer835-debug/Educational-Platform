const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: require('path').resolve(__dirname, '../.env') });

// Connect to MongoDB directly without the model
console.log('Attempting to connect to MongoDB...');
console.log('Connection string:', process.env.MONGODB_URI || process.env.MONGO_URI);

mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Fix admin user with direct database approach
const fixAdmin = async () => {
  try {
    // Get direct access to the users collection
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    
    // First, check if there are any existing admin users and remove them
    const existingAdmins = await usersCollection.find({ role: 'admin' }).toArray();
    
    if (existingAdmins.length > 0) {
      console.log(`Found ${existingAdmins.length} existing admin users. Removing them...`);
      await usersCollection.deleteMany({ role: 'admin' });
      console.log('Existing admin users removed.');
    }

    // Create a simple password hash directly
    const password = 'admin123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Verify the hash works
    const testVerify = await bcrypt.compare(password, hashedPassword);
    console.log(`Password verification test: ${testVerify ? 'PASSED' : 'FAILED'}`);

    // Create admin user directly in the database
    const adminUser = {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      password: hashedPassword, // Use the pre-hashed password
      role: 'admin',
      isApproved: true,
      birthDate: new Date('1990-01-01'),
      securityQuestions: {
        question1: 'What was the name of your first pet?',
        answer1: 'admin',
        question2: 'In what city were you born?',
        answer2: 'admin'
      },
      createdAt: new Date()
    };

    // Insert directly into the collection, bypassing Mongoose
    const result = await usersCollection.insertOne(adminUser);
    console.log('Admin user created successfully:');
    console.log(`ID: ${result.insertedId}`);
    console.log(`Email: ${adminUser.email}`);
    console.log(`Password: ${password} (unhashed)`);
    console.log(`Role: ${adminUser.role}`);
    
    // Verify the password can be checked correctly
    const savedAdmin = await usersCollection.findOne({ _id: result.insertedId });
    const passwordCheck = await bcrypt.compare(password, savedAdmin.password);
    console.log(`Password verification after save: ${passwordCheck ? 'PASSED' : 'FAILED'}`);
    
    console.log('Security Questions Set Up:');
    console.log(`Question 1: ${adminUser.securityQuestions.question1}`);
    console.log(`Question 2: ${adminUser.securityQuestions.question2}`);
    console.log('Both answers are set to: "admin"');

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

// Run the function
fixAdmin();
