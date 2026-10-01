const mongoose = require('mongoose');

const EnrollmentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  module: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module',
    required: true
  },
  enrolledAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure a student can only enroll once in a module
EnrollmentSchema.index({ student: 1, module: 1 }, { unique: true });

module.exports = mongoose.model('Enrollment', EnrollmentSchema);
