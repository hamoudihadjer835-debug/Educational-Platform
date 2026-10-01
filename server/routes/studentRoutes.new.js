const express = require('express');
const {
  getAvailableModules,
  enrollInModule,
  getEnrolledModules,
  getModuleDetails,
  downloadFile
} = require('../controllers/studentController.new');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

const router = express.Router();

// All routes are protected and require student role
router.use(protect);
router.use(authorize('student'));

// Module routes
router.get('/available-modules', getAvailableModules);
router.post('/enroll/:moduleId', enrollInModule);
router.get('/my-modules', getEnrolledModules);
router.get('/modules/:moduleId', getModuleDetails);

// File routes
router.get('/files/:moduleId/:fileType/:fileId', downloadFile);

module.exports = router;
