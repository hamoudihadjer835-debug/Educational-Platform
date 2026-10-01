const mongoose = require('mongoose');

const ChapterFileSchema = new mongoose.Schema({
  path: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    enum: ['pdf', 'video', 'document'],
    default: 'pdf'
  },
  originalName: {
    type: String,
    required: false
  },
  size: {
    type: Number,
    default: 0
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  temporary: {
    type: Boolean,
    default: true
  }
});

const ChapterSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a chapter title'],
    trim: true,
    maxlength: [100, 'Chapter title cannot be more than 100 characters']
  },
  content: {
    type: String,
    default: ''
  },
  files: [ChapterFileSchema]
});

const LessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a lesson title'],
    trim: true,
    maxlength: [100, 'Lesson title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a lesson description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  module: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module',
    required: true
  },
  // Lessons don't have files directly - files are attached to chapters
  chapters: [ChapterSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Lesson', LessonSchema);
