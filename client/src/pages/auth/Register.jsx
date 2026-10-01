import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../../services/api';
import SecurityQuestions from '../../components/auth/SecurityQuestions';
import { useAuth } from '../../contexts/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const queryParams = new URLSearchParams(location.search);
  const roleFromQuery = queryParams.get('role');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: roleFromQuery || 'student',
    birthDate: '',
    level: '',
    fieldOfStudy: 'Computer Science',
    academicRank: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [step, setStep] = useState(1); // 1: Registration form, 2: Security questions

  useEffect(() => {
    // Update role if query parameter changes
    if (roleFromQuery) {
      setFormData(prev => ({
        ...prev,
        role: roleFromQuery
      }));
    }
  }, [roleFromQuery]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    // Password match validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    // Name validation (letters only)
    const nameRegex = /^[A-Za-z]+$/;
    if (!nameRegex.test(formData.firstName)) {
      setError('First name can only contain letters');
      return false;
    }

    if (!nameRegex.test(formData.lastName)) {
      setError('Last name can only contain letters');
      return false;
    }

    // Student-specific validations
    if (formData.role === 'student') {
      if (!formData.birthDate) {
        setError('Birth date is required for students');
        return false;
      }

      // Calculate age from birth date
      const today = new Date();
      const birthDate = new Date(formData.birthDate);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      if (age < 18 || age > 60) {
        setError('Students must be between 18 and 60 years old');
        return false;
      }

      if (!formData.level) {
        setError('Level is required for students');
        return false;
      }

      if (!formData.fieldOfStudy) {
        setError('Field of study is required for students');
        return false;
      }

      if (formData.fieldOfStudy !== 'Computer Science') {
        setError('Only Computer Science students are allowed');
        return false;
      }


    }

    // Teacher-specific validations
    if (formData.role === 'teacher') {
      if (!formData.birthDate) {
        setError('Birth date is required for teachers');
        return false;
      }

      // Calculate age from birth date
      const today = new Date();
      const birthDate = new Date(formData.birthDate);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      if (age < 24) {
        setError('Teachers must be at least 24 years old');
        return false;
      }

      if (!formData.academicRank) {
        setError('Academic rank is required for teachers');
        return false;
      }

      // Validate academic email for teachers
      const academicEmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(edu|univ|ac\.[a-zA-Z]{2,}|dz)$/;
      if (!academicEmailRegex.test(formData.email)) {
        setError('Please use an academic email address');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...dataToSend } = formData;

      const response = await authAPI.register(dataToSend);
      const { user, token, message } = response.data;

      // For roles that require approval (student and teacher), don't log in automatically
      if (formData.role === 'student' || formData.role === 'teacher') {
        // Just store user data temporarily for security questions setup
        setSuccess('Registration successful! Your account is pending approval by an administrator.');
        // Move to security questions step without logging in
        setStep(2);
      } else {
        // For other roles (if any), log in automatically
        login(user, token);
        setSuccess(message || 'Registration successful!');
        setStep(2);
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(
        err.response?.data?.message ||
        'An error occurred during registration. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="card">
        {step === 1 ? (
          <>
            <h1 className="text-center">Register as {formData.role.charAt(0).toUpperCase() + formData.role.slice(1)}</h1>

            {error && (
              <div className="bg-danger/10 text-danger p-3 rounded-md mb-6">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-success/10 text-success p-3 rounded-md mb-6">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {success && formData.role !== 'visitor' && formData.role !== 'admin' && (
                <div className="bg-primary/10 text-primary p-4 rounded-md mb-4 text-center">
                  <p className="font-semibold">Your registration request is pending until the administrators approve it.</p>
                  <Link to="/" className="btn btn-primary mt-3">
                    Back to Home
                  </Link>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="form-label">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="form-input"
                    required
                    pattern="[A-Za-z]+"
                    title="First name can only contain letters"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="form-label">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="form-input"
                    required
                    pattern="[A-Za-z]+"
                    title="Last name can only contain letters"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="form-label">Email {formData.role === 'teacher' && '(Academic Email Required)'}</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                  required
                  placeholder={formData.role === 'teacher' ? 'example@university.edu or example@university.dz' : 'example@email.com'}
                />
                {formData.role === 'teacher' && (
                  <p className="text-sm text-gray-500 mt-1">
                    Please use your academic email address (.edu, .univ, .ac.xx, or .dz domain).
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="password" className="form-label">Password</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="form-input"
                    minLength="6"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="role" className="form-label">Role</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="form-input"
                  required
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                </select>
              </div>

              {/* Student-specific fields */}
              {formData.role === 'student' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="birthDate" className="form-label">Birth Date</label>
                      <input
                        type="date"
                        id="birthDate"
                        name="birthDate"
                        value={formData.birthDate}
                        onChange={handleChange}
                        className="form-input"
                        required
                        max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                        min={new Date(new Date().setFullYear(new Date().getFullYear() - 60)).toISOString().split('T')[0]}
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Students must be between 18 and 60 years old.
                      </p>
                    </div>

                    <div>
                      <label htmlFor="level" className="form-label">Level</label>
                      <select
                        id="level"
                        name="level"
                        value={formData.level}
                        onChange={handleChange}
                        className="form-input"
                        required
                      >
                        <option value="">Select Level</option>
                        <option value="lmd1">LMD 1</option>
                        <option value="ing1">ING 1</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="fieldOfStudy" className="form-label">Field of Study</label>
                    <select
                      id="fieldOfStudy"
                      name="fieldOfStudy"
                      value={formData.fieldOfStudy}
                      onChange={handleChange}
                      className="form-input"
                      required
                      disabled
                    >
                      <option value="Computer Science">Computer Science</option>
                    </select>
                    <p className="text-sm text-gray-500 mt-1">
                      Only Computer Science students are allowed on this platform.
                    </p>
                  </div>
                </>
              )}

              {/* Teacher-specific fields */}
              {formData.role === 'teacher' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="birthDate" className="form-label">Birth Date</label>
                      <input
                        type="date"
                        id="birthDate"
                        name="birthDate"
                        value={formData.birthDate}
                        onChange={handleChange}
                        className="form-input"
                        required
                        max={new Date(new Date().setFullYear(new Date().getFullYear() - 24)).toISOString().split('T')[0]}
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Teachers must be at least 24 years old.
                      </p>
                    </div>

                    <div>
                      <label htmlFor="academicRank" className="form-label">Academic Rank</label>
                      <select
                        id="academicRank"
                        name="academicRank"
                        value={formData.academicRank}
                        onChange={handleChange}
                        className="form-input"
                        required
                      >
                        <option value="">Select Academic Rank</option>
                        <option value="Professor">Professor</option>
                        <option value="Associate Professor">Associate Professor</option>
                        <option value="Assistant Professor">Assistant Professor</option>
                        <option value="Lecturer">Lecturer</option>
                        <option value="Teaching Assistant">Teaching Assistant</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Registering...' : 'Register'}
              </button>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-primary hover:underline">
                  Login
                </Link>
              </p>
            </div>
          </form>
          </>
        ) : (
          <>
            <h1 className="text-center">Set Up Security Questions</h1>
            <p className="text-gray-600 text-center mb-6">
              Please set up your security questions. These will be used to verify your identity if you need to reset your password.
            </p>
            <SecurityQuestions
              isRegistration={true}
              userData={formData}
              onComplete={() => {
                // Show approval pending message and redirect to home
                setSuccess('Security questions set successfully! Your account is pending administrator approval.');

                // For student and teacher roles, always redirect to home with a message
                if (formData.role === 'student' || formData.role === 'teacher') {
                  setTimeout(() => {
                    navigate('/');
                  }, 3000);
                } else {
                  // For other roles (if any in the future), redirect to their dashboard
                  setTimeout(() => {
                    switch (formData.role) {
                      case 'admin':
                        navigate('/admin');
                        break;
                      default:
                        navigate('/');
                    }
                  }, 1500);
                }
              }}
            />

            {/* Show approval message */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                After setting up your security questions, you'll be redirected to the home page.
                You'll be able to log in once an administrator approves your account.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Register;
