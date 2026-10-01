import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // Move the useAuth hook to the top level
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Direct login function using axios directly
  const directLogin = async (credentials) => {
    try {
      console.log('Attempting direct login with:', credentials);
      const response = await axios.post('http://localhost:5000/api/auth/login', credentials, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });

      console.log('Direct login response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Direct login error:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      console.log('Submitting login with:', formData);

      let userData, token;

      try {
        // First try with the API service
        const response = await authAPI.login(formData);
        console.log('Login response received from API service:', response);
        userData = response.data.user;
        token = response.data.token;
      } catch (apiError) {
        console.log('API service login failed, trying direct login');
        // If that fails, try direct login
        const directResponse = await directLogin(formData);
        userData = directResponse.user;
        token = directResponse.token;
      }

      if (!userData || !token) {
        throw new Error('Invalid response from server - missing user data or token');
      }

      // Store user data and token
      console.log('Storing user data and token');
      login(userData, token);

      console.log('Login successful, redirecting based on role:', userData.role);

      // Set first login flag for students
      if (userData.role === 'student' && userData.isApproved) {
        // Set a flag for first login after approval
        localStorage.setItem('firstLoginAfterApproval', 'true');
      }

      // Redirect based on user role
      switch (userData.role) {
        case 'admin':
          navigate('/admin');
          break;
        case 'teacher':
          navigate('/teacher');
          break;
        case 'student':
          navigate('/student');
          break;
        default:
          navigate('/');
      }
    } catch (err) {
      console.error('Login error details:', err);

      // More detailed error handling
      if (err.response) {
        console.error('Server response error:', err.response.status, err.response.data);
        setError(err.response.data?.message || `Server error: ${err.response.status}`);
      } else if (err.request) {
        console.error('No response received:', err.request);
        setError('No response from server. Please check your connection.');
      } else {
        console.error('Request setup error:', err.message);
        setError(err.message || 'An error occurred during login. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="card shadow-md border border-border">
        <h1 className="text-center text-2xl font-bold mb-6 text-dark">Login to Your Account</h1>

        {error && (
          <div className="bg-accent/10 text-accent p-4 rounded-md mb-6 border border-accent/20">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter your password"
              required
            />
            <div className="text-right mt-2">
              <Link
                to={formData.email ? `/forgot-password/${encodeURIComponent(formData.email)}` : '/forgot-password'}
                className="text-sm text-primary hover:text-primary/80 transition-colors font-medium"
              >
                Forgot Password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full py-3"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-border pt-6">
          <p className="text-neutral">
            Don't have an account?{' '}
            <Link to="/choose-role" className="text-primary font-medium hover:text-primary/80 transition-colors">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
