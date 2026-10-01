const mongoose = require('mongoose');

const QuizSubmissionSchema = new mongoose.Schema({
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  answers: [
    {
      question: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
      },
      selectedOptions: [
        {
          type: mongoose.Schema.Types.ObjectId
        }
      ],
      textAnswer: {
        type: String
      }
    }
  ],
  score: {
    type: Number,
    default: 0
  },
  maxScore: {
    type: Number,
    required: true
  },
  isGraded: {
    type: Boolean,
    default: false
  },
  teacherFeedback: {
    type: String
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  gradedAt: {
    type: Date
  }
});

module.exports = mongoose.model('QuizSubmission', QuizSubmissionSchema);
