import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Layout Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Public Pages
import Home from './pages/visitor/Home';
import About from './pages/visitor/About';
import ChooseRole from './pages/visitor/ChooseRole';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import LogoutHandler from './components/auth/LogoutHandler';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminModules from './pages/admin/Modules';
import AdminSettings from './pages/admin/Settings';

// Teacher Pages
import TeacherDashboard from './pages/teacher/Dashboard';
import TeacherModules from './pages/teacher/ModulesNew';
// Removed TeacherLessons import
import CreateQuiz from './pages/teacher/CreateQuiz';
import EditQuiz from './pages/teacher/EditQuiz';
import QuizSubmissions from './pages/teacher/QuizSubmissions';
import EditModule from './pages/teacher/EditModule';
import ModuleDetails from './pages/teacher/ModuleDetails';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import StudentModules from './pages/student/ModulesNew';
import ModuleContent from './pages/student/ModuleContent';
import Quizzes from './pages/student/Quizzes';
import TakeQuiz from './pages/student/TakeQuiz';
import QuizSubmission from './pages/student/QuizSubmission';

// Common Pages
import Settings from './pages/Settings';

// Protected Route Components
import AdminRoute from './components/routes/AdminRoute';
import TeacherRoute from './components/routes/TeacherRoute';
import StudentRoute from './components/routes/StudentRoute';
import ProtectedRoute from './components/routes/ProtectedRoute';

const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={
              user ? (
                user.role === 'admin' ? (
                  <Navigate to="/admin" replace />
                ) : user.role === 'teacher' ? (
                  <Navigate to="/teacher" replace />
                ) : user.role === 'student' ? (
                  <Navigate to="/student" replace />
                ) : (
                  <Home />
                )
              ) : (
                <Home />
              )
            } />
            <Route path="/about" element={<About />} />
            <Route path="/choose-role" element={<Navigate to="/register" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/forgot-password/:username" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/logout" element={<LogoutHandler />} />

            {/* Admin Routes */}
            <Route path="/admin" element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } />
            <Route path="/admin/users" element={
              <AdminRoute>
                <AdminUsers />
              </AdminRoute>
            } />
            <Route path="/admin/modules" element={
              <AdminRoute>
                <AdminModules />
              </AdminRoute>
            } />
            <Route path="/admin/settings" element={
              <AdminRoute>
                <AdminSettings />
              </AdminRoute>
            } />

            {/* Teacher Routes */}
            <Route path="/teacher" element={
              <TeacherRoute>
                <TeacherDashboard />
              </TeacherRoute>
            } />
            <Route path="/teacher/modules" element={
              <TeacherRoute>
                <TeacherModules />
              </TeacherRoute>
            } />
            {/* Removed TeacherLessons route */}
            <Route path="/teacher/modules/:moduleId" element={
              <TeacherRoute>
                <ModuleDetails />
              </TeacherRoute>
            } />
            <Route path="/teacher/modules/:moduleId/create-quiz" element={
              <TeacherRoute>
                <CreateQuiz />
              </TeacherRoute>
            } />
            <Route path="/teacher/quizzes/:quizId/submissions" element={
              <TeacherRoute>
                <QuizSubmissions />
              </TeacherRoute>
            } />
            <Route path="/teacher/quizzes/:quizId/edit" element={
              <TeacherRoute>
                <EditQuiz />
              </TeacherRoute>
            } />
            <Route path="/teacher/modules/:moduleId/edit" element={
              <TeacherRoute>
                <EditModule />
              </TeacherRoute>
            } />

            {/* Student Routes */}
            <Route path="/student" element={
              <StudentRoute>
                <StudentDashboard />
              </StudentRoute>
            } />
            <Route path="/student/modules" element={
              <StudentRoute>
                <StudentModules />
              </StudentRoute>
            } />
            <Route path="/student/modules/:moduleId" element={
              <StudentRoute>
                <ModuleContent />
              </StudentRoute>
            } />
            <Route path="/student/modules/:moduleId/quizzes" element={
              <StudentRoute>
                <Quizzes />
              </StudentRoute>
            } />
            <Route path="/student/quizzes/:quizId/take" element={
              <StudentRoute>
                <TakeQuiz />
              </StudentRoute>
            } />
            <Route path="/student/submissions/:submissionId" element={
              <StudentRoute>
                <QuizSubmission />
              </StudentRoute>
            } />



            {/* Common Protected Routes */}
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
