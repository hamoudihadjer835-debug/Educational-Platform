import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const LogoutHandler = () => {
  const { logout } = useAuth();
  useEffect(() => {
    // Call the logout function
    logout();
  }, [logout]);

  // Redirect to home page
  return <Navigate to="/" replace />;
};

export default LogoutHandler;
