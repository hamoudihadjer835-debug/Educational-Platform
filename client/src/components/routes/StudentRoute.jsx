import { Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const StudentRoute = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  // Check if this is the first login after approval
  useEffect(() => {
    if (user && user.isApproved) {
      const firstLoginAfterApproval = localStorage.getItem('firstLoginAfterApproval') !== 'false';

      // If this is the first login after approval and we're on the dashboard page
      if (firstLoginAfterApproval && location.pathname === '/student') {
        // Set the flag to false to prevent future redirects
        localStorage.setItem('firstLoginAfterApproval', 'false');

        // Redirect to modules page will happen below
      }
    }
  }, [user, location.pathname]);

  if (!user) {
    // User is not authenticated, redirect to login
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'student') {
    // User is not a student, redirect to their appropriate dashboard
    if (user.role === 'admin') {
      return <Navigate to="/admin" replace />;
    } else if (user.role === 'teacher') {
      return <Navigate to="/teacher" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  if (!user.isApproved) {
    // Student is not approved, redirect to pending approval page
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="card max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Account Pending Approval</h1>
          <p className="text-gray-600 mb-6">
            Your student account is pending approval from an administrator.
            Please check back later or contact support for assistance.
          </p>
          <button onClick={() => window.location.href = '/logout'} className="btn btn-primary">
            Logout
          </button>
        </div>
      </div>
    );
  }

  // Check if this is the first login after approval and we're on the dashboard page
  const firstLoginAfterApproval = localStorage.getItem('firstLoginAfterApproval') !== 'false';
  if (firstLoginAfterApproval && location.pathname === '/student') {
    // Redirect to modules page on first login after approval
    return <Navigate to="/student/modules" replace />;
  }

  // User is authenticated, is a student, and is approved, render the protected component
  return children;
};

export default StudentRoute;
