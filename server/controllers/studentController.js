const Module = require('../models/Module');
const Lesson = require('../models/Lesson');
const Enrollment = require('../models/Enrollment');
const path = require('path');

// @desc    Get available modules for student's academic year
// @route   GET /api/student/available-modules
// @access  Private/Student
const getAvailableModules = async (req, res) => {
  try {
    // Get the academic year from query params or use the user's academic year
    const academicYear = req.query.academicYear || req.user.academicYear;

    // If no academic year is provided, return an error
    if (!academicYear) {
      return res.status(400).json({
        success: false,
        message: 'Academic year is required. Please update your profile with an academic year.'
      });
    }

    console.log(`Getting available modules for student ${req.user._id}, level ${req.user.level}, and academic year ${academicYear}`);

    // Find modules for the specified academic year with assigned teachers
    const modules = await Module.find({
      academicYear: academicYear,
      level: req.user.level, // Match student's level
      teacher: { $ne: null } // Only modules with assigned teachers
    }).populate('teacher', 'firstName lastName email');

    console.log(`Found ${modules.length} available modules for academic year ${academicYear}`);

    // Log each module for debugging
    modules.forEach(module => {
      console.log(`Available Module ${module._id}: ${module.title}, Academic Year: ${module.academicYear}, Level: ${module.level}`);
    });

    // Get the student's enrolled modules to filter them out
    const enrollments = await Enrollment.find({ student: req.user._id }).select('module');
    const enrolledModuleIds = enrollments.map(enrollment => enrollment.module.toString());

    console.log(`Student has ${enrolledModuleIds.length} enrolled modules`);
    console.log('Enrolled module IDs:', enrolledModuleIds);

    // Filter out modules that the student is already enrolled in
    const availableModules = modules.filter(module => !enrolledModuleIds.includes(module._id.toString()));

    console.log(`After filtering, found ${availableModules.length} available modules`);

    // If no modules found for this academic year, return an empty array without an error message
    if (availableModules.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: []
      });
    }

    res.status(200).json({
      success: true,
      count: availableModules.length,
      data: availableModules
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

// @desc    Enroll in a module
// @route   POST /api/student/enroll/:moduleId
// @access  Private/Student
const enrollInModule = async (req, res) => {
  try {
    const moduleId = req.params.moduleId;

    // Get the academic year from query params or use the user's academic year
    const academicYear = req.query.academicYear || req.user.academicYear;

    // If no academic year is provided, return an error
    if (!academicYear) {
      return res.status(400).json({
        success: false,
        message: 'Academic year is required. Please update your profile with an academic year.'
      });
    }

    console.log(`Enrolling student ${req.user._id} in module ${moduleId} for academic year ${academicYear}`);

    // Check if module exists and is for student's academic year and level
    const module = await Module.findOne({
      _id: moduleId,
      academicYear: academicYear,
      level: req.user.level,
      teacher: { $ne: null } // Only modules with assigned teachers
    });

    if (!module) {
      console.log(`Module ${moduleId} not found or not available for academic year ${academicYear} and level ${req.user.level}`);
      return res.status(404).json({
        success: false,
        message: 'Module not found or not available for your academic year'
      });
    }

    console.log(`Found module: ${module.title}, Academic Year: ${module.academicYear}, Level: ${module.level}`);

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      student: req.user._id,
      module: moduleId
    });

    if (existingEnrollment) {
      console.log(`Student ${req.user._id} is already enrolled in module ${moduleId}`);
      return res.status(400).json({
        success: false,
        message: 'You are already enrolled in this module'
      });
    }

    // Create enrollment
    const enrollment = await Enrollment.create({
      student: req.user._id,
      module: moduleId
    });

    console.log(`Successfully enrolled student ${req.user._id} in module ${moduleId}`);

    res.status(201).json({
      success: true,
      message: 'Enrolled successfully',
      data: enrollment
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

// @desc    Get enrolled modules
// @route   GET /api/student/my-modules
// @access  Private/Student
const getEnrolledModules = async (req, res) => {
  try {
    // Get the academic year from query params or use the user's academic year
    const academicYear = req.query.academicYear || req.user.academicYear;

    // If no academic year is provided, return an error
    if (!academicYear) {
      return res.status(400).json({
        success: false,
        message: 'Academic year is required. Please update your profile with an academic year.'
      });
    }

    // First get all enrollments for this student
    const enrollments = await Enrollment.find({ student: req.user._id })
      .populate({
        path: 'module',
        populate: {
          path: 'teacher',
          select: 'firstName lastName email'
        }
      });

    // Log for debugging
    console.log(`Getting enrolled modules for student ${req.user._id} and academic year ${academicYear}`);
    console.log(`Found ${enrollments.length} total enrollments`);

    // Filter modules by the requested academic year
    const modules = enrollments
      .map(enrollment => enrollment.module)
      .filter(module => {
        // Log each module for debugging
        if (module) {
          console.log(`Module ${module._id}: ${module.title}, Academic Year: ${module.academicYear}`);
        }
        return module && module.academicYear === academicYear;
      });

    console.log(`After filtering, found ${modules.length} modules for academic year ${academicYear}`);

    // If no modules found for this academic year, return an empty array with a specific message
    if (modules.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
        message: `No enrolled modules found for academic year ${academicYear}.`
      });
    }

    res.status(200).json({
      success: true,
      count: modules.length,
      data: modules
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

// @desc    Get lessons for a module
// @route   GET /api/student/modules/:moduleId/lessons
// @access  Private/Student
const getModuleLessons = async (req, res) => {
  try {
    const moduleId = req.params.moduleId;

    // Check if student is enrolled in this module
    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      module: moduleId
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: 'You are not enrolled in this module'
      });
    }

    // Get lessons
    const lessons = await Lesson.find({ module: moduleId })
      .populate('createdBy', 'name');

    res.status(200).json({
      success: true,
      count: lessons.length,
      data: lessons
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

// @desc    Download lesson file
// @route   GET /api/student/lessons/:id/download
// @access  Private/Student
const downloadLesson = async (req, res) => {
  try {
    const lessonId = req.params.id;

    // Get lesson
    const lesson = await Lesson.findById(lessonId);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    // Check if student is enrolled in the module
    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      module: lesson.module
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: 'You are not enrolled in this module'
      });
    }

    // Send file
    const filePath = path.resolve(lesson.filePath);
    res.download(filePath);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

module.exports = {
  getAvailableModules,
  enrollInModule,
  getEnrolledModules,
  getModuleLessons,
  downloadLesson
};
