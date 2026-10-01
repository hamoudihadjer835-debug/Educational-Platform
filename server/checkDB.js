const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

console.log('MongoDB URI:', process.env.MONGODB_URI);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected successfully');
    return mongoose.connection.db.listCollections().toArray();
  })
  .then(collections => {
    console.log('Collections in database:');
    collections.forEach(collection => {
      console.log('- ' + collection.name);
    });
    return mongoose.connection.close();
  })
  .then(() => {
    console.log('MongoDB connection closed');
    process.exit(0);
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
