const mongoose = require('mongoose');

// File schema for chapters, syllabus, and references
const FileSchema = new mongoose.Schema({
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

// Chapter schema
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
  files: [FileSchema]
});

// Syllabus schema
const SyllabusSchema = new mongoose.Schema({
  content: {
    type: String,
    default: ''
  },
  files: [FileSchema]
});

// Reference schema
const ReferenceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a reference title'],
    trim: true,
    maxlength: [100, 'Reference title cannot be more than 100 characters']
  },
  description: {
    type: String,
    default: ''
  },
  files: [FileSchema]
});

const ModuleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a module title'],
    trim: true,
    maxlength: [100, 'Module title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a module description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  academicYear: {
    type: String,
    required: [true, 'Please provide an academic year']
  },
  level: {
    type: String,
    required: [true, 'Please provide a level'],
    enum: {
      values: ['lmd1', 'ing1'],
      message: 'Level must be one of: lmd1, ing1'
    }
  },
  semester: {
    type: Number,
    required: [true, 'Please provide a semester'],
    enum: {
      values: [1, 2],
      message: 'Semester must be either 1 or 2'
    }
  },
  chapters: [ChapterSchema],
  syllabus: SyllabusSchema,
  references: [ReferenceSchema],
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
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

module.exports = mongoose.model('Module', ModuleSchema);
