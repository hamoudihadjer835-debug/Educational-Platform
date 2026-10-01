const Quiz = require('../models/Quiz');
const Module = require('../models/Module');
const QuizSubmission = require('../models/QuizSubmission');
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');

// @desc    Create a new quiz
// @route   POST /api/teacher/modules/:moduleId/quizzes
// @access  Private/Teacher
const createQuiz = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { title, description, questions } = req.body;

    // Check if module exists and teacher is assigned to it
    const module = await Module.findOne({
      _id: moduleId,
      teacher: req.user._id
    });

    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found or you are not assigned to it'
      });
    }

    // Create the quiz
    const quiz = await Quiz.create({
      title,
      description,
      module: moduleId,
      questions,
      createdBy: req.user._id,
      isPublished: false // Default to unpublished
    });

    res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      data: quiz
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get all quizzes for a module
// @route   GET /api/teacher/modules/:moduleId/quizzes
// @access  Private/Teacher
const getQuizzesByModule = async (req, res) => {
  try {
    const { moduleId } = req.params;

    // Check if module exists and teacher is assigned to it
    const module = await Module.findOne({
      _id: moduleId,
      teacher: req.user._id
    });

    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found or you are not assigned to it'
      });
    }

    // Get quizzes for this module
    const quizzes = await Quiz.find({ module: moduleId });

    res.status(200).json({
      success: true,
      count: quizzes.length,
      data: quizzes
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get a single quiz
// @route   GET /api/teacher/quizzes/:id
// @access  Private/Teacher
const getQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate('module');

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Check if teacher is assigned to the module
    if (quiz.module.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to access this quiz'
      });
    }

    res.status(200).json({
      success: true,
      data: quiz
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Update a quiz
// @route   PUT /api/teacher/quizzes/:id
// @access  Private/Teacher
const updateQuiz = async (req, res) => {
  try {
    const { title, description, dueDate, questions, isPublished } = req.body;

    let quiz = await Quiz.findById(req.params.id).populate('module');

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Check if teacher is assigned to the module
    if (quiz.module.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this quiz'
      });
    }

    // Update quiz
    quiz.title = title || quiz.title;
    quiz.description = description || quiz.description;
    quiz.dueDate = dueDate || quiz.dueDate;
    quiz.questions = questions || quiz.questions;

    // Only update isPublished if it's provided
    if (isPublished !== undefined) {
      quiz.isPublished = isPublished;
    }

    await quiz.save();

    res.status(200).json({
      success: true,
      message: 'Quiz updated successfully',
      data: quiz
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Delete a quiz
// @route   DELETE /api/teacher/quizzes/:id
// @access  Private/Teacher
const deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate('module');

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Check if teacher is assigned to the module
    if (quiz.module.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this quiz'
      });
    }

    // Delete all submissions for this quiz
    await QuizSubmission.deleteMany({ quiz: req.params.id });

    // Delete the quiz
    await Quiz.deleteOne({ _id: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Quiz deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get quiz submissions
// @route   GET /api/teacher/quizzes/:id/submissions
// @access  Private/Teacher
const getQuizSubmissions = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate('module');

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Check if teacher is assigned to the module
    if (quiz.module.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to access submissions for this quiz'
      });
    }

    // Get submissions for this quiz
    const submissions = await QuizSubmission.find({ quiz: req.params.id })
      .populate('student', 'firstName lastName username email');

    res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Grade a quiz submission
// @route   PUT /api/teacher/submissions/:id/grade
// @access  Private/Teacher
const gradeQuizSubmission = async (req, res) => {
  try {
    const { score, teacherFeedback } = req.body;

    const submission = await QuizSubmission.findById(req.params.id)
      .populate({
        path: 'quiz',
        populate: {
          path: 'module'
        }
      });

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    // Check if teacher is assigned to the module
    if (submission.quiz.module.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to grade this submission'
      });
    }

    // Validate score
    if (score < 0 || score > submission.maxScore) {
      return res.status(400).json({
        success: false,
        message: `Score must be between 0 and ${submission.maxScore}`
      });
    }

    // Update submission
    submission.score = score;
    submission.teacherFeedback = teacherFeedback || '';
    submission.isGraded = true;
    submission.gradedAt = Date.now();

    await submission.save();

    res.status(200).json({
      success: true,
      message: 'Submission graded successfully',
      data: submission
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Student-facing controllers

// @desc    Get available quizzes for a student
// @route   GET /api/student/modules/:moduleId/quizzes
// @access  Private/Student
const getStudentQuizzes = async (req, res) => {
  try {
    const { moduleId } = req.params;
    console.log('Getting quizzes for module:', moduleId);
    console.log('User ID:', req.user._id);

    // Check if student is enrolled in the module
    console.log('Checking enrollment...');
    const isEnrolled = await Enrollment.findOne({
      module: moduleId,
      student: req.user._id
    });

    console.log('Enrollment check result:', isEnrolled);

    if (!isEnrolled) {
      return res.status(403).json({
        success: false,
        message: 'You are not enrolled in this module'
      });
    }

    // First check if there are any quizzes at all for this module
    console.log('Checking for all quizzes...');
    const allQuizzes = await Quiz.find({
      module: moduleId
    });

    console.log('Found all quizzes:', allQuizzes.length);

    // Get published quizzes for this module
    console.log('Getting published quizzes...');
    const quizzes = await Quiz.find({
      module: moduleId,
      isPublished: true
    });

    console.log('Found published quizzes:', quizzes.length);

    // If there are quizzes but none are published, return a specific message
    if (allQuizzes.length > 0 && quizzes.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
        message: 'There are quizzes for this module, but they have not been published yet.'
      });
    }

    // Get student's submissions for these quizzes
    console.log('Getting quiz submissions...');
    const submissions = await QuizSubmission.find({
      quiz: { $in: quizzes.map(q => q._id) },
      student: req.user._id
    });

    console.log('Found submissions:', submissions.length);

    // Add submission status to each quiz
    const quizzesWithStatus = quizzes.map(quiz => {
      const submission = submissions.find(s => s.quiz.toString() === quiz._id.toString());
      return {
        ...quiz._doc,
        isSubmitted: !!submission,
        isGraded: submission ? submission.isGraded : false,
        score: submission ? submission.score : null,
        submissionId: submission ? submission._id : null
      };
    });

    res.status(200).json({
      success: true,
      count: quizzesWithStatus.length,
      data: quizzesWithStatus
    });
  } catch (error) {
    console.error('Error in getStudentQuizzes:', error);
    console.error('Error stack:', error.stack);
    try {
      // Additional error details
      if (error.name === 'ReferenceError') {
        console.error('This is a reference error - likely a missing variable or import');
      }
      if (error.name === 'TypeError') {
        console.error('This is a type error - likely trying to access a property of undefined');
      }
    } catch (e) {
      console.error('Error in error handler:', e);
    }
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Submit a quiz
// @route   POST /api/student/quizzes/:id/submit
// @access  Private/Student
const submitQuiz = async (req, res) => {
  try {
    const { answers } = req.body;

    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    if (!quiz.isPublished) {
      return res.status(403).json({
        success: false,
        message: 'This quiz is not available for submission'
      });
    }

    // Check if due date has passed
    if (new Date(quiz.dueDate) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'The due date for this quiz has passed'
      });
    }

    // Check if student is enrolled in the module
    const isEnrolled = await Enrollment.findOne({
      module: quiz.module,
      student: req.user._id
    });

    if (!isEnrolled) {
      return res.status(403).json({
        success: false,
        message: 'You are not enrolled in this module'
      });
    }

    // Check if student has already submitted this quiz
    const existingSubmission = await QuizSubmission.findOne({
      quiz: req.params.id,
      student: req.user._id
    });

    // If there's an existing submission, we'll update it (retake quiz functionality)
    let submission;
    let isRetake = false;

    if (existingSubmission) {
      isRetake = true;
      console.log('Student is retaking quiz:', req.params.id);
    }

    // Calculate score based on correct answers
    let score = 0;
    for (const answer of answers) {
      const question = quiz.questions.find(q => q._id.toString() === answer.question.toString());
      if (!question) continue;

      // For multiple choice questions
      if (question.questionType !== 'short-answer') {
        const correctOptions = question.options.filter(opt => opt.isCorrect).map(opt => opt._id.toString());
        const selectedOptions = answer.selectedOptions.map(opt => opt.toString());

        // Check if all selected options are correct and all correct options are selected
        const allSelectedAreCorrect = selectedOptions.every(optId => correctOptions.includes(optId));
        const allCorrectAreSelected = correctOptions.every(optId => selectedOptions.includes(optId));

        if (allSelectedAreCorrect && allCorrectAreSelected) {
          score++;
        }
      }
    }

    // Create or update submission
    if (isRetake && existingSubmission) {
      // Update existing submission for retake
      existingSubmission.answers = answers;
      existingSubmission.score = score;
      existingSubmission.isGraded = true; // Auto-grade multiple choice questions
      existingSubmission.submittedAt = Date.now();

      submission = await existingSubmission.save();

      res.status(200).json({
        success: true,
        message: 'Quiz retaken successfully',
        data: submission,
        isRetake: true
      });
    } else {
      // Create new submission
      submission = await QuizSubmission.create({
        quiz: req.params.id,
        student: req.user._id,
        answers,
        score,
        maxScore: quiz.questions.length,
        isGraded: true, // Auto-grade multiple choice questions
        submittedAt: Date.now()
      });

      res.status(201).json({
        success: true,
        message: 'Quiz submitted successfully',
        data: submission,
        isRetake: false
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get a student's quiz submission
// @route   GET /api/student/submissions/:id
// @access  Private/Student
const getStudentSubmission = async (req, res) => {
  try {
    const submission = await QuizSubmission.findById(req.params.id)
      .populate('quiz');

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    // Check if this submission belongs to the student
    if (submission.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this submission'
      });
    }

    res.status(200).json({
      success: true,
      data: submission
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get a quiz for a student
// @route   GET /api/student/quizzes/:id
// @access  Private/Student
const getStudentQuiz = async (req, res) => {
  try {
    console.log('Getting quiz with ID:', req.params.id);
    const quiz = await Quiz.findById(req.params.id).populate('module');

    if (!quiz) {
      console.log('Quiz not found');
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    console.log('Quiz found:', quiz.title);

    // Check if quiz is published
    if (!quiz.isPublished) {
      console.log('Quiz is not published');
      return res.status(403).json({
        success: false,
        message: 'This quiz is not available yet'
      });
    }

    // Check if student is enrolled in the module
    const isEnrolled = await Enrollment.findOne({
      module: quiz.module._id,
      student: req.user._id
    });

    if (!isEnrolled) {
      console.log('Student is not enrolled in the module');
      return res.status(403).json({
        success: false,
        message: 'You are not enrolled in this module'
      });
    }

    console.log('All checks passed, returning quiz');
    res.status(200).json({
      success: true,
      data: quiz
    });
  } catch (error) {
    console.error('Error in getStudentQuiz:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

module.exports = {
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
};
