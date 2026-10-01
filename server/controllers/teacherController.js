const Module = require('../models/Module');
const Lesson = require('../models/Lesson');
const fs = require('fs');
const path = require('path');

// @desc    Get teacher's assigned modules
// @route   GET /api/teacher/modules
// @access  Private/Teacher
const getAssignedModules = async (req, res) => {
  try {
    const modules = await Module.find({ teacher: req.user._id })
      .populate('createdBy', 'name email');

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

// @desc    Get module details
// @route   GET /api/teacher/modules/:id
// @access  Private/Teacher
const getModuleDetails = async (req, res) => {
  try {
    const module = await Module.findOne({
      _id: req.params.id,
      teacher: req.user._id
    }).populate('createdBy', 'name email');

    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found or not assigned to you'
      });
    }

    // Get lessons for this module
    const lessons = await Lesson.find({ module: module._id });

    res.status(200).json({
      success: true,
      data: {
        module,
        lessons
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

// @desc    Add lesson to module
// @route   POST /api/teacher/modules/:id/lessons
// @access  Private/Teacher
const addLesson = async (req, res) => {
  try {
    console.log('Add Lesson Request Body:', req.body);
    console.log('Add Lesson Request Headers:', req.headers);

    // Get data directly from the request body
    const { title, description, chapters } = req.body;
    const moduleId = req.params.id;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Lesson title is required'
      });
    }

    // Description is optional, set default if not provided
    const lessonDescription = description || '';

    // Check if module exists and is assigned to this teacher
    const module = await Module.findOne({
      _id: moduleId,
      teacher: req.user._id
    });

    if (!module) {
      // No need to remove uploaded file with Cloudinary - it's handled automatically
      return res.status(404).json({
        success: false,
        message: 'Module not found or not assigned to you'
      });
    }

    // Use chapters if provided
    const chaptersArray = chapters || [];

    // Process chapters without requiring a file
    let processedChapters = [];

    if (chaptersArray.length > 0) {
      // Use chapters as provided
      processedChapters = chaptersArray.map(chapter => ({
        title: chapter.title,
        content: chapter.content || ''
      }));
    } else {
      // If no chapters, create an empty default chapter
      processedChapters = [{
        title: 'Chapter 1',
        content: ''
      }];
    }

    // Create lesson
    const lesson = await Lesson.create({
      title,
      description: lessonDescription,
      module: moduleId,
      chapters: processedChapters,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Lesson added successfully',
      data: lesson
    });
  } catch (error) {
    console.error(error);

    // No need to manually remove files with Cloudinary
    // It's handled by the Cloudinary middleware

    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Update lesson
// @route   PUT /api/teacher/lessons/:id
// @access  Private/Teacher
const updateLesson = async (req, res) => {
  try {
    const { title, description, chapters } = req.body;
    console.log('Update Lesson Request Body:', req.body);

    // Find lesson and check if it belongs to a module assigned to this teacher
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    // Check if module is assigned to this teacher
    const module = await Module.findOne({
      _id: lesson.module,
      teacher: req.user._id
    });

    if (!module) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this lesson'
      });
    }

    // Update lesson
    lesson.title = title || lesson.title;
    lesson.description = description !== undefined ? description : lesson.description;

    // Update chapters if provided
    if (chapters && Array.isArray(chapters)) {
      console.log('\n==== UPDATING CHAPTERS DEBUG ====');
      console.log('Updating chapters with:', chapters);
      console.log('Existing chapters:', lesson.chapters);

      // Process the chapters and properly handle files
      const updatedChapters = chapters.map((chapter, index) => {
        // Check if this chapter has files from the client
        const hasClientFiles = chapter.files && Array.isArray(chapter.files) && chapter.files.length > 0;

        // Get existing chapter if available
        const existingChapter = lesson.chapters[index];

        // Determine which files to use
        let files = [];

        if (hasClientFiles) {
          // Use files from the client
          console.log(`Using ${chapter.files.length} files from client for chapter ${index}`);

          // Make sure all file objects have the required fields and mark as permanent
          files = chapter.files.map(file => ({
            path: file.path,
            fileType: file.fileType || 'pdf',
            originalName: file.originalName || '',
            size: file.size || 0,
            uploadedAt: file.uploadedAt || new Date(),
            temporary: false // Mark as permanent when saving lesson
          }));

          console.log('Processed files:', files);
        } else if (existingChapter && existingChapter.files) {
          // If no client files but we have existing files, preserve them
          console.log(`Preserving ${existingChapter.files.length} existing files for chapter ${index}`);
          files = existingChapter.files;
        }

        return {
          title: chapter.title,
          content: chapter.content || '',
          files: files
        };
      });

      console.log('Updated chapters:', updatedChapters);
      lesson.chapters = updatedChapters;
    }

    await lesson.save();

    res.status(200).json({
      success: true,
      message: 'Lesson updated successfully',
      data: lesson
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

// @desc    Delete lesson
// @route   DELETE /api/teacher/lessons/:id
// @access  Private/Teacher
const deleteLesson = async (req, res) => {
  try {
    // Find lesson and check if it belongs to a module assigned to this teacher
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    // Check if module is assigned to this teacher
    const module = await Module.findOne({
      _id: lesson.module,
      teacher: req.user._id
    });

    if (!module) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this lesson'
      });
    }

    // Lessons don't have main files - files are only in chapters
    // Chapter files will be deleted by Cloudinary automatically

    // Delete lesson from database
    await Lesson.deleteOne({ _id: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Lesson deleted successfully'
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

// @desc    Upload file for a chapter
// @route   POST /api/teacher/lessons/:id/chapters/:chapterIndex/files
// @access  Private/Teacher
const uploadChapterFile = async (req, res) => {
  try {
    const { id, chapterIndex } = req.params;
    const { fileType } = req.body;

    console.log('\n\n==== FILE UPLOAD DEBUG ====');
    console.log('Request params:', { id, chapterIndex, fileType });
    console.log('Request file:', req.file ? {
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path
    } : 'No file');
    console.log('Request headers:', req.headers);

    console.log('Upload chapter file request:', {
      lessonId: id,
      chapterIndex,
      fileType,
      file: req.file ? req.file.originalname : 'No file'
    });

    // Find lesson and check if it belongs to a module assigned to this teacher
    const lesson = await Lesson.findById(id);

    if (!lesson) {
      console.error('Lesson not found:', id);
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    // Check if module is assigned to this teacher
    const module = await Module.findOne({
      _id: lesson.module,
      teacher: req.user._id
    });

    if (!module) {
      console.error('Not authorized to update lesson:', id);
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this lesson'
      });
    }

    // Check if file was uploaded
    if (!req.file) {
      console.error('No file uploaded');
      // File is optional, just return success without adding a file
      return res.status(200).json({
        success: true,
        message: 'No file uploaded, but chapter updated successfully',
        data: {
          lessonId: id,
          chapterIndex
        }
      });
    }

    console.log('Chapter file uploaded:', req.file);

    // Add file to chapter
    if (!lesson.chapters) {
      lesson.chapters = [];
    }

    // Ensure chapter exists
    if (!lesson.chapters[chapterIndex]) {
      lesson.chapters[chapterIndex] = {
        title: `Chapter ${Number(chapterIndex) + 1}`,
        content: '',
        files: []
      };
    }

    // Add file to chapter
    lesson.chapters[chapterIndex].files = lesson.chapters[chapterIndex].files || [];

    // Get file path and other details
    const { uploadsDir } = require('../config/uploadConfig');
    const fs = require('fs');
    const path = require('path');

    // Create a URL that can be used to access the file
    const filePath = `/uploads/${req.file.filename}`;
    const fileSize = req.file.size || 0;

    console.log('File upload details:', {
      originalFilename: req.file.originalname,
      savedFilename: req.file.filename,
      filePath,
      fileSize
    });

    // Verify the file exists in the uploads directory
    const physicalPath = path.join(uploadsDir, req.file.filename);
    const fileExists = fs.existsSync(physicalPath);

    console.log('\n==== FILE STORAGE DEBUG ====');
    console.log('File stored:', {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: fileSize,
      path: filePath,
      physicalPath,
      fileExists
    });

    // Create file object with all necessary metadata
    const fileObject = {
      path: filePath,  // URL path to access the file
      fileType: fileType || 'pdf',
      originalName: req.file.originalname, // Store original filename for better display
      size: fileSize,
      uploadedAt: new Date(),
      temporary: true // Mark as temporary until lesson is saved
    };

    console.log('Adding file to chapter:', fileObject);

    // Add file to chapter
    lesson.chapters[chapterIndex].files.push(fileObject);

    // Debug the lesson object before saving
    console.log('\n==== LESSON BEFORE SAVE ====');
    console.log('Lesson ID:', lesson._id);
    console.log('Chapter count:', lesson.chapters.length);
    console.log('Chapter files:', lesson.chapters.map(ch => ({
      title: ch.title,
      filesCount: ch.files ? ch.files.length : 0,
      files: ch.files ? ch.files.map(f => ({
        path: f.path,
        originalName: f.originalName,
        fileType: f.fileType
      })) : []
    })));

    // Save the lesson with the new file
    const savedLesson = await lesson.save();
    console.log('\n==== LESSON AFTER SAVE ====');
    console.log('Lesson saved with new file');
    console.log('Saved lesson ID:', savedLesson._id);
    console.log('Saved chapter count:', savedLesson.chapters.length);
    console.log('Saved chapter files:', savedLesson.chapters.map(ch => ({
      title: ch.title,
      filesCount: ch.files ? ch.files.length : 0,
      files: ch.files ? ch.files.map(f => ({
        path: f.path,
        originalName: f.originalName,
        fileType: f.fileType
      })) : []
    })));

    // Get the newly added file
    const newFile = lesson.chapters[chapterIndex].files[lesson.chapters[chapterIndex].files.length - 1];

    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        lessonId: id,
        chapterIndex,
        file: {
          path: newFile.path,
          fileType: newFile.fileType,
          originalName: newFile.originalName,
          size: newFile.size,
          uploadedAt: newFile.uploadedAt
        }
      }
    });
  } catch (error) {
    console.error('Error uploading chapter file:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get lesson details
// @route   GET /api/teacher/lessons/:id
// @access  Private/Teacher
const getLessonDetails = async (req, res) => {
  try {
    const lessonId = req.params.id;

    // For testing: Add a test file to the first chapter if it doesn't exist
    const testLesson = await Lesson.findById(lessonId);
    if (testLesson && testLesson.chapters && testLesson.chapters.length > 0) {
      const firstChapter = testLesson.chapters[0];
      if (!firstChapter.files || firstChapter.files.length === 0) {
        console.log('Adding test file to first chapter');
        firstChapter.files = [{
          path: '/uploads/test-file.pdf',
          fileType: 'pdf',
          originalName: 'test-file.pdf',
          size: 607,
          uploadedAt: new Date()
        }];
        await testLesson.save();
        console.log('Test file added to first chapter');
      }
    }

    // Find lesson
    const lesson = await Lesson.findById(lessonId);

    // Filter out temporary files
    if (lesson && lesson.chapters) {
      lesson.chapters.forEach(chapter => {
        if (chapter.files && chapter.files.length > 0) {
          chapter.files = chapter.files.filter(file => !file.temporary);
        }
      });
    }

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    // Check if module is assigned to this teacher
    const module = await Module.findOne({
      _id: lesson.module,
      teacher: req.user._id
    });

    if (!module) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this lesson'
      });
    }

    // Add debug logging for lesson details
    console.log('\n==== LESSON DETAILS DEBUG ====');
    console.log('Lesson ID:', lesson._id);
    console.log('Chapter count:', lesson.chapters ? lesson.chapters.length : 0);
    if (lesson.chapters && lesson.chapters.length > 0) {
      console.log('Chapter files:', lesson.chapters.map(ch => ({
        title: ch.title,
        filesCount: ch.files ? ch.files.length : 0,
        files: ch.files ? ch.files.map(f => ({
          path: f.path,
          originalName: f.originalName,
          fileType: f.fileType
        })) : []
      })));
    }

    res.status(200).json({
      success: true,
      data: lesson
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

// Helper function to clean up temporary files
const cleanupTemporaryFiles = async () => {
  try {
    console.log('Running temporary file cleanup...');

    // Find all lessons with temporary files
    const lessons = await Lesson.find({ 'chapters.files.temporary': true });

    if (!lessons || lessons.length === 0) {
      console.log('No lessons with temporary files found.');
      return;
    }

    console.log(`Found ${lessons.length} lessons with temporary files.`);

    // Get current time
    const now = new Date();
    // Set cutoff time to 24 hours ago
    const cutoffTime = new Date(now.getTime() - (24 * 60 * 60 * 1000));

    // Track changes
    let totalFilesRemoved = 0;

    // Process each lesson
    for (const lesson of lessons) {
      let lessonModified = false;

      // Process each chapter
      lesson.chapters.forEach(chapter => {
        if (chapter.files && chapter.files.length > 0) {
          // Get original count
          const originalCount = chapter.files.length;

          // Filter out old temporary files
          chapter.files = chapter.files.filter(file => {
            // Keep if not temporary or if uploaded recently
            return !file.temporary || new Date(file.uploadedAt) > cutoffTime;
          });

          // If files were removed, mark lesson as modified
          if (chapter.files.length < originalCount) {
            lessonModified = true;
            totalFilesRemoved += (originalCount - chapter.files.length);
          }
        }
      });

      // Save lesson if modified
      if (lessonModified) {
        await lesson.save();
      }
    }

    console.log(`Cleanup complete. Removed ${totalFilesRemoved} temporary files.`);
  } catch (error) {
    console.error('Error cleaning up temporary files:', error);
  }
};

// Run cleanup every hour
setInterval(cleanupTemporaryFiles, 60 * 60 * 1000);

// Run cleanup on server start
cleanupTemporaryFiles();

module.exports = {
  getAssignedModules,
  getModuleDetails,
  addLesson,
  updateLesson,
  deleteLesson,
  uploadChapterFile,
  getLessonDetails
};
