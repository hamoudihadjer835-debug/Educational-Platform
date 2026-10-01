import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const TeacherRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    // User is not authenticated, redirect to login
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'teacher') {
    // User is not a teacher, redirect to their appropriate dashboard
    if (user.role === 'admin') {
      return <Navigate to="/admin" replace />;
    } else if (user.role === 'student') {
      return <Navigate to="/student" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  if (!user.isApproved) {
    // Teacher is not approved, redirect to pending approval page
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="card max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Account Pending Approval</h1>
          <p className="text-gray-600 mb-6">
            Your teacher account is pending approval from an administrator.
            Please check back later or contact support for assistance.
          </p>
          <button onClick={() => window.location.href = '/logout'} className="btn btn-primary">
            Logout
          </button>
        </div>
      </div>
    );
  }

  // User is authenticated, is a teacher, and is approved, render the protected component
  return children;
};

export default TeacherRoute;
