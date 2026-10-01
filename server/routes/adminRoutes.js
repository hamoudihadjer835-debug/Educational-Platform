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
} = require('../controllers/adminController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

const router = express.Router();

// All routes are protected and require admin role
router.use(protect);
router.use(authorize('admin'));

// User management
router.get('/users', getUsers);
router.get('/pending-approvals', getPendingApprovals);
router.put('/approve/:id', approveUser);
router.delete('/users/:id', deleteUser);

// Module management
router.get('/modules', getModules);
router.post('/modules', createModule);
router.put('/modules/:id', updateModule);
router.put('/modules/:moduleId/assign-teacher/:teacherId', assignTeacher);
router.delete('/modules/:id', deleteModule);

// Dashboard
router.get('/dashboard', getDashboardStats);

module.exports = router;
