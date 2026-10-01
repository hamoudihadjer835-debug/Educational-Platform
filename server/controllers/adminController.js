const User = require('../models/User');
const Module = require('../models/Module');
const Lesson = require('../models/Lesson');
const Enrollment = require('../models/Enrollment');
const fs = require('fs');
const path = require('path');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
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

// @desc    Get pending approvals
// @route   GET /api/admin/pending-approvals
// @access  Private/Admin
const getPendingApprovals = async (req, res) => {
  try {
    const pendingUsers = await User.find({
      isApproved: false,
      role: { $in: ['teacher', 'student'] }
    }).select('-password');

    res.status(200).json({
      success: true,
      count: pendingUsers.length,
      data: pendingUsers
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

// @desc    Approve user
// @route   PUT /api/admin/approve/:id
// @access  Private/Admin
const approveUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.isApproved) {
      return res.status(400).json({
        success: false,
        message: 'User is already approved'
      });
    }

    user.isApproved = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User approved successfully',
      data: user
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

// @desc    Create module
// @route   POST /api/admin/modules
// @access  Private/Admin
const createModule = async (req, res) => {
  try {
    const { title, description, academicYear, level, semester } = req.body;

    // Validate level
    if (!['lmd1', 'lmd2', 'lmd3', 'ing1', 'ing2'].includes(level)) {
      return res.status(400).json({
        success: false,
        message: 'Level must be one of: lmd1, lmd2, lmd3, ing1, ing2'
      });
    }

    // Validate semester
    if (![1, 2, '1', '2'].includes(semester)) {
      return res.status(400).json({
        success: false,
        message: 'Semester must be either 1 or 2'
      });
    }

    const module = await Module.create({
      title,
      description,
      academicYear,
      level,
      semester: Number(semester),
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Module created successfully',
      data: module
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

// @desc    Assign teacher to module
// @route   PUT /api/admin/modules/:moduleId/assign-teacher/:teacherId
// @access  Private/Admin
const assignTeacher = async (req, res) => {
  try {
    const { moduleId, teacherId } = req.params;

    // Check if module exists
    const module = await Module.findById(moduleId);
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    // Check if teacher exists and is approved
    const teacher = await User.findOne({
      _id: teacherId,
      role: 'teacher',
      isApproved: true
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found or not approved'
      });
    }

    // Assign teacher to module
    module.teacher = teacherId;
    await module.save();

    res.status(200).json({
      success: true,
      message: 'Teacher assigned to module successfully',
      data: module
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

// @desc    Get dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalTeachers = await User.countDocuments({ role: 'teacher' });
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalModules = await Module.countDocuments();
    const totalLessons = await Lesson.countDocuments();
    const totalEnrollments = await Enrollment.countDocuments();
    const pendingApprovals = await User.countDocuments({
      isApproved: false,
      role: { $in: ['teacher', 'student'] }
    });

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalTeachers,
        totalStudents,
        totalModules,
        totalLessons,
        totalEnrollments,
        pendingApprovals
      }
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

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent deleting admin users
    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete admin users'
      });
    }

    // Handle related data based on user role
    if (user.role === 'teacher') {
      // Update modules where this teacher is assigned
      await Module.updateMany(
        { teacher: user._id },
        { $unset: { teacher: 1 } }
      );
    } else if (user.role === 'student') {
      // Delete enrollments for this student
      await Enrollment.deleteMany({ student: user._id });
    }

    // Delete lessons created by this user (if any)
    try {
      const lessons = await Lesson.find({ createdBy: user._id });

      // Delete files from local storage
      for (const lesson of lessons) {
        // Check if lesson has chapters with files
        if (lesson.chapters && lesson.chapters.length > 0) {
          for (const chapter of lesson.chapters) {
            if (chapter.files && chapter.files.length > 0) {
              for (const file of chapter.files) {
                if (file.publicId) {
                  try {
                    // Get the file path from the uploads directory
                    const uploadsDir = path.join(__dirname, '../uploads');
                    const filePath = path.join(uploadsDir, file.publicId);

                    // Check if file exists before deleting
                    if (fs.existsSync(filePath)) {
                      fs.unlinkSync(filePath);
                      console.log(`Deleted file from local storage: ${filePath}`);
                    }
                  } catch (fileError) {
                    console.error(`Error deleting file from local storage: ${file.publicId}`, fileError);
                    // Continue with deletion even if file deletion fails
                  }
                }
              }
            }
          }
        }
      }

      await Lesson.deleteMany({ createdBy: user._id });
    } catch (lessonError) {
      console.error('Error handling lessons during user deletion:', lessonError);
      // Continue with user deletion even if lesson handling fails
    }

    // Finally, delete the user
    await User.deleteOne({ _id: req.params.id });

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
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

// @desc    Get all modules
// @route   GET /api/admin/modules
// @access  Private/Admin
const getModules = async (req, res) => {
  try {
    // Get all modules with teacher information
    const modules = await Module.find().populate('teacher', 'firstName lastName email');

    // Get enrollment counts for each module
    const moduleIds = modules.map(module => module._id);
    const enrollmentCounts = await Enrollment.aggregate([
      { $match: { module: { $in: moduleIds } } },
      { $group: { _id: '$module', count: { $sum: 1 } } }
    ]);

    // Create a map of module ID to enrollment count
    const enrollmentCountMap = {};
    enrollmentCounts.forEach(item => {
      enrollmentCountMap[item._id.toString()] = item.count;
    });

    // Add enrollment count to each module
    const modulesWithEnrollmentCount = modules.map(module => {
      const moduleObj = module.toObject();
      moduleObj.enrollmentCount = enrollmentCountMap[module._id.toString()] || 0;
      return moduleObj;
    });

    res.status(200).json({
      success: true,
      count: modules.length,
      data: modulesWithEnrollmentCount
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

// @desc    Delete module
// @route   DELETE /api/admin/modules/:id
// @access  Private/Admin
const deleteModule = async (req, res) => {
  try {
    const module = await Module.findById(req.params.id);

    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    // Delete lessons associated with this module
    try {
      const lessons = await Lesson.find({ module: module._id });

      // Delete files from local storage
      for (const lesson of lessons) {
        // Check if lesson has chapters with files
        if (lesson.chapters && lesson.chapters.length > 0) {
          for (const chapter of lesson.chapters) {
            if (chapter.files && chapter.files.length > 0) {
              for (const file of chapter.files) {
                if (file.publicId) {
                  try {
                    // Get the file path from the uploads directory
                    const uploadsDir = path.join(__dirname, '../uploads');
                    const filePath = path.join(uploadsDir, file.publicId);

                    // Check if file exists before deleting
                    if (fs.existsSync(filePath)) {
                      fs.unlinkSync(filePath);
                      console.log(`Deleted file from local storage: ${filePath}`);
                    }
                  } catch (fileError) {
                    console.error(`Error deleting file from local storage: ${file.publicId}`, fileError);
                    // Continue with deletion even if file deletion fails
                  }
                }
              }
            }
          }
        }
      }

      await Lesson.deleteMany({ module: module._id });
    } catch (lessonError) {
      console.error('Error handling lessons during module deletion:', lessonError);
      // Continue with module deletion even if lesson handling fails
    }

    // Delete enrollments for this module
    await Enrollment.deleteMany({ module: module._id });

    // Finally, delete the module
    await Module.deleteOne({ _id: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Module deleted successfully'
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

// @desc    Update module
// @route   PUT /api/admin/modules/:id
// @access  Private/Admin
const updateModule = async (req, res) => {
  try {
    const { title, description, academicYear, level, semester } = req.body;

    // Find the module
    const module = await Module.findById(req.params.id);

    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    // Validate level if provided
    if (level && !['lmd1', 'lmd2', 'lmd3', 'ing1', 'ing2'].includes(level)) {
      return res.status(400).json({
        success: false,
        message: 'Level must be one of: lmd1, lmd2, lmd3, ing1, ing2'
      });
    }

    // Validate semester if provided
    if (semester !== undefined && ![1, 2, '1', '2'].includes(semester)) {
      return res.status(400).json({
        success: false,
        message: 'Semester must be either 1 or 2'
      });
    }

    // Update module fields
    module.title = title || module.title;
    module.description = description || module.description;
    module.academicYear = academicYear || module.academicYear;
    module.level = level || module.level;
    module.semester = semester !== undefined ? Number(semester) : module.semester;

    // Save the updated module
    await module.save();

    res.status(200).json({
      success: true,
      message: 'Module updated successfully',
      data: module
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

module.exports = {
  getUsers,
  getPendingApprovals,
  approveUser,
  createModule,
  assignTeacher,
  getDashboardStats,
  deleteUser,
  getModules,
  deleteModule,
  updateModule
};
