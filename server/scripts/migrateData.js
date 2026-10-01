const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Import models
const Module = require('../models/Module');
const Lesson = require('../models/Lesson');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Function to migrate data
const migrateData = async () => {
  try {
    console.log('Starting data migration...');
    
    // Get all modules
    const modules = await Module.find();
    console.log(`Found ${modules.length} modules to process`);
    
    // Process each module
    for (const module of modules) {
      console.log(`Processing module: ${module.title} (${module._id})`);
      
      // Get lessons for this module
      const lessons = await Lesson.find({ module: module._id });
      console.log(`Found ${lessons.length} lessons for module ${module._id}`);
      
      // Initialize chapters array if it doesn't exist
      if (!module.chapters) {
        module.chapters = [];
      }
      
      // Initialize syllabus if it doesn't exist
      if (!module.syllabus) {
        module.syllabus = { content: '', files: [] };
      }
      
      // Initialize references array if it doesn't exist
      if (!module.references) {
        module.references = [];
      }
      
      // Process each lesson
      for (const lesson of lessons) {
        console.log(`Processing lesson: ${lesson.title} (${lesson._id})`);
        
        // Create a reference from the lesson
        const reference = {
          title: lesson.title,
          description: lesson.description,
          files: []
        };
        
        // Process lesson chapters
        if (lesson.chapters && lesson.chapters.length > 0) {
          for (const chapter of lesson.chapters) {
            // Add chapter to module
            module.chapters.push({
              title: chapter.title,
              content: chapter.content || '',
              files: chapter.files || []
            });
            
            console.log(`Added chapter: ${chapter.title} with ${chapter.files ? chapter.files.length : 0} files`);
          }
        }
        
        // Add the reference to the module
        module.references.push(reference);
        console.log(`Added reference: ${reference.title}`);
      }
      
      // Save the updated module
      await module.save();
      console.log(`Saved module: ${module.title} (${module._id})`);
    }
    
    console.log('Data migration completed successfully!');
    
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    // Close the database connection
    mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the migration
migrateData();
