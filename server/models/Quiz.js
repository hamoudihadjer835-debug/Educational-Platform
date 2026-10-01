const mongoose = require('mongoose');

const QuizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a quiz title'],
    trim: true,
    maxlength: [100, 'Quiz title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a quiz description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  module: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module',
    required: true
  },
  questions: [
    {
      questionText: {
        type: String,
        required: [true, 'Please provide a question']
      },
      options: [
        {
          text: {
            type: String,
            required: [true, 'Please provide an option text']
          },
          isCorrect: {
            type: Boolean,
            default: false
          }
        }
      ],
      questionType: {
        type: String,
        enum: ['multiple-choice', 'true-false', 'short-answer'],
        default: 'multiple-choice'
      }
    }
  ],
  isPublished: {
    type: Boolean,
    default: false
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

module.exports = mongoose.model('Quiz', QuizSchema);
