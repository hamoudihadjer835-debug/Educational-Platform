const express = require('express');
const {
  createQuiz,
  getQuizzesByModule,
  getQuiz,
  updateQuiz,
  deleteQuiz,
  getQuizSubmissions,
  gradeQuizSubmission,
  getStudentQuizzes,
  getStudentQuiz,
  submitQuiz,
  getStudentSubmission
} = require('../controllers/quizController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

const router = express.Router();

// Teacher routes
router.post('/teacher/modules/:moduleId/quizzes', protect, authorize('teacher'), createQuiz);
router.get('/teacher/modules/:moduleId/quizzes', protect, authorize('teacher'), getQuizzesByModule);
router.get('/teacher/quizzes/:id', protect, authorize('teacher'), getQuiz);
router.put('/teacher/quizzes/:id', protect, authorize('teacher'), updateQuiz);
router.delete('/teacher/quizzes/:id', protect, authorize('teacher'), deleteQuiz);

// Teacher submission routes
router.get('/teacher/quizzes/:id/submissions', protect, authorize('teacher'), getQuizSubmissions);
router.put('/teacher/submissions/:id/grade', protect, authorize('teacher'), gradeQuizSubmission);

// Student routes
router.get('/student/modules/:moduleId/quizzes', protect, authorize('student'), getStudentQuizzes);
router.get('/student/quizzes/:id', protect, authorize('student'), getStudentQuiz);
router.post('/student/quizzes/:id/submit', protect, authorize('student'), submitQuiz);
router.get('/student/submissions/:id', protect, authorize('student'), getStudentSubmission);

module.exports = router;
