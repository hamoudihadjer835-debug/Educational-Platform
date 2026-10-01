const express = require('express');
const {
  getAssignedModules,
  getModuleDetails,
  addLesson,
  updateLesson,
  deleteLesson,
  uploadChapterFile,
  getLessonDetails
} = require('../controllers/teacherController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');
const upload = require('../middlewares/uploadMiddleware');

const router = express.Router();

// All routes are protected and require teacher role
router.use(protect);
router.use(authorize('teacher'));

// Module routes
router.get('/modules', getAssignedModules);
router.get('/modules/:id', getModuleDetails);
// No need for upload middleware for lesson creation
router.post('/modules/:id/lessons', addLesson);

// Lesson routes
router.get('/lessons/:id', getLessonDetails);
router.put('/lessons/:id', updateLesson);
router.delete('/lessons/:id', deleteLesson);
router.post('/lessons/:id/chapters/:chapterIndex/files', upload.single('file'), uploadChapterFile);

module.exports = router;
