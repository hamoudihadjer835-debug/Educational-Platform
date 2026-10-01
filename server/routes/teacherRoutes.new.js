const express = require('express');
const {
  getAssignedModules,
  getModuleDetails,
  addChapter,
  updateModuleChapters,
  deleteChapter,
  uploadChapterFile,
  updateSyllabus,
  uploadSyllabusFile,
  addReference,
  updateReference,
  deleteReference,
  uploadReferenceFile,
  discardTemporaryFiles
} = require('../controllers/teacherController.new');
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

// Chapter routes
router.post('/modules/:id/chapters', addChapter);
router.put('/modules/:id/chapters', updateModuleChapters);
router.delete('/modules/:id/chapters/:chapterIndex', deleteChapter);
router.post('/modules/:id/chapters/:chapterIndex/files', upload.single('file'), uploadChapterFile);

// Syllabus routes
router.put('/modules/:id/syllabus', updateSyllabus);
router.post('/modules/:id/syllabus/files', upload.single('file'), uploadSyllabusFile);

// Reference routes
router.post('/modules/:id/references', addReference);
router.put('/modules/:id/references/:referenceIndex', updateReference);
router.delete('/modules/:id/references/:referenceIndex', deleteReference);
router.post('/modules/:id/references/:referenceIndex/files', upload.single('file'), uploadReferenceFile);

// Temporary files management
router.post('/modules/:id/discard-temp-files', discardTemporaryFiles);

module.exports = router;
