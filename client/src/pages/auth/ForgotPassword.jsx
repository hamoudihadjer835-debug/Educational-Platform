import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { authAPI } from '../../services/api';

const SECURITY_QUESTION_OPTIONS = [
  "What was the name of your first teacher or professor?",
  "What was the model of your first personal device (phone, laptop, etc.)?",
  "What was the name of your first pet?",
  "In what city were you born?",
  "What was your childhood nickname?",
  "What is the name of your favorite childhood friend?",
  "What is your mother's maiden name?",
  "What high school did you attend?",
  "What was the make of your first car?",
  "What is your favorite movie?"
];

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { username: usernameParam } = useParams(); // Get username from URL params if available
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const usernameQuery = queryParams.get('username') || queryParams.get('email'); // Get from query params

  const [step, setStep] = useState(usernameParam || usernameQuery ? 2 : 1); // Skip to step 2 if username is provided
  const [username, setUsername] = useState(usernameParam || usernameQuery || '');
  const [userId, setUserId] = useState('');
  const [questions, setQuestions] = useState({ question1: '', question2: '' });
  const [answers, setAnswers] = useState({ answer1: '', answer2: '' });
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Automatically fetch security questions if username is provided
  useEffect(() => {
    const fetchSecurityQuestions = async () => {
      if ((usernameParam || usernameQuery) && step === 2) {
        setIsLoading(true);
        setError('');

        try {
          const response = await authAPI.getSecurityQuestions(username);
          setUserId(response.data.data.userId);
          setQuestions({
            question1: response.data.data.question1,
            question2: response.data.data.question2
          });
        } catch (err) {
          console.error('Error fetching security questions:', err);
          if (err.response?.status === 404) {
            setError('User not found. Please check your username or email.');
            setStep(1); // Go back to step 1 if user not found
          } else if (err.response?.status === 400) {
            setError(err.response.data.message || 'Security questions not set up for this user.');
            setStep(1); // Go back to step 1 if security questions not set up
          } else {
            setError('An error occurred. Please try again later.');
          }
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchSecurityQuestions();
  }, [username, usernameParam, usernameQuery, step]);

  const handleUsernameSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await authAPI.getSecurityQuestions(username);
      setUserId(response.data.data.userId);
      setQuestions({
        question1: response.data.data.question1,
        question2: response.data.data.question2
      });
      setStep(2);
    } catch (err) {
      console.error('Error fetching security questions:', err);
      if (err.response?.status === 404) {
        setError('User not found. Please check your username or email.');
      } else if (err.response?.status === 400) {
        setError(err.response.data.message || 'Security questions not set up for this user.');
      } else {
        setError('An error occurred. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswersSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Validate passwords match
      if (newPassword !== confirmPassword) {
        setError('Passwords do not match');
        setIsLoading(false);
        return;
      }

      // Validate password strength
      if (newPassword.length < 6) {
        setError('Password must be at least 6 characters long');
        setIsLoading(false);
        return;
      }

      const response = await authAPI.resetPasswordWithSecurity(
        userId,
        answers.answer1,
        answers.answer2,
        newPassword
      );

      setSuccess(response.data.message || 'Password has been reset successfully');
      setStep(3);

      // Keep the user on the success page
      // They can navigate back using the buttons when ready
    } catch (err) {
      console.error('Error resetting password:', err);
      if (err.response?.status === 400) {
        setError(err.response.data.message || 'Security answers are incorrect.');
      } else {
        setError('An error occurred. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="card shadow-md">
        <h1 className="text-center text-2xl font-bold mb-6">Forgot Password</h1>

        {step === 1 && (
          <>
            <p className="text-neutral text-center mb-6">
              Enter your username or email address to retrieve your security questions.
            </p>

            {error && (
              <div className="bg-danger/10 text-danger p-4 rounded-md mb-6 border border-danger/20">
                {error}
              </div>
            )}

            <form onSubmit={handleUsernameSubmit} className="space-y-6">
              <div>
                <label htmlFor="username" className="form-label">Username or Email</label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="form-input"
                  placeholder="Enter your username or email"
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full py-3"
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Continue'}
              </button>
            </form>
          </>
        )}

        {step === 2 && (
          <>
            <p className="text-neutral text-center mb-6">
              {usernameParam || usernameQuery ?
                `Answer security questions for ${username} to reset your password.` :
                'Answer your security questions and set a new password.'}
            </p>

            {error && (
              <div className="bg-danger/10 text-danger p-4 rounded-md mb-6 border border-danger/20">
                {error}
              </div>
            )}

            <form onSubmit={handleAnswersSubmit} className="space-y-6">
              <div>
                <label htmlFor="question1" className="form-label">Question 1</label>
                <div className="bg-primary/5 p-4 rounded-md mb-3 text-dark border border-primary/10">
                  {questions.question1}
                </div>
                <input
                  type="text"
                  id="answer1"
                  value={answers.answer1}
                  onChange={(e) => setAnswers({...answers, answer1: e.target.value})}
                  className="form-input"
                  placeholder="Your answer"
                  required
                />
              </div>

              <div>
                <label htmlFor="question2" className="form-label">Question 2</label>
                <div className="bg-primary/5 p-4 rounded-md mb-3 text-dark border border-primary/10">
                  {questions.question2}
                </div>
                <input
                  type="text"
                  id="answer2"
                  value={answers.answer2}
                  onChange={(e) => setAnswers({...answers, answer2: e.target.value})}
                  className="form-input"
                  placeholder="Your answer"
                  required
                />
              </div>

              {/* Hidden username field to help password managers */}
              <input
                type="hidden"
                id="username"
                name="username"
                value={username}
                autoComplete="username"
              />

              <div className="mt-6 pt-6 border-t border-border">
                <h3 className="text-lg font-medium mb-4">Set New Password</h3>
                <div className="mb-4">
                  <label htmlFor="newPassword" className="form-label">New Password</label>
                  <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="form-input"
                    placeholder="Enter new password"
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="form-input"
                    placeholder="Confirm new password"
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <div className="flex space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setError('');
                  }}
                  className="btn btn-light"
                  disabled={isLoading}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-1 py-3"
                  disabled={isLoading}
                >
                  {isLoading ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            </form>
          </>
        )}

        {step === 3 && (
          <>
            <div className="bg-success/10 text-success p-4 rounded-md mb-6 border border-success/20">
              <p className="font-medium">{success}</p>
              <p className="mt-2 text-sm">You can now log in with your new password.</p>
            </div>
            <div className="flex justify-center space-x-4">
              <Link to="/login" className="btn btn-primary">
                Go to Login
              </Link>
              <Link to="/" className="btn btn-secondary">
                Back to Home
              </Link>
            </div>
          </>
        )}

        <div className="mt-8 text-center border-t border-border pt-6">
          <p className="text-neutral">
            Remember your password?{' '}
            <Link to="/login" className="text-primary font-medium hover:text-primary/80 transition-colors">
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
