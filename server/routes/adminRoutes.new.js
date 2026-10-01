const express = require('express');
const {
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
} = require('../controllers/adminController.new');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

const router = express.Router();

// All routes are protected and require admin role
router.use(protect);
router.use(authorize('admin'));

// User routes
router.get('/users', getUsers);
router.delete('/users/:id', deleteUser);
router.get('/pending-approvals', getPendingApprovals);
router.put('/approve/:id', approveUser);

// Module routes
router.get('/modules', getModules);
router.post('/modules', createModule);
router.put('/modules/:id', updateModule);
router.delete('/modules/:id', deleteModule);
router.put('/modules/:moduleId/assign-teacher/:teacherId', assignTeacher);

// Dashboard routes
router.get('/dashboard', getDashboardStats);

module.exports = router;
