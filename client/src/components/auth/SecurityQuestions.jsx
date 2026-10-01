import { useState, useEffect } from 'react';
import { authAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

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

const SecurityQuestions = ({ onComplete, isRegistration, userData }) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1); // 1: Password verification, 2: Security questions
  const [password, setPassword] = useState('');
  const [hasExistingQuestions, setHasExistingQuestions] = useState(false);

  // If this is part of registration flow, we'll use the userData passed in
  // Otherwise, we'll use the user from context

  const [formData, setFormData] = useState({
    question1: SECURITY_QUESTION_OPTIONS[0],
    answer1: '',
    question2: SECURITY_QUESTION_OPTIONS[1],
    answer2: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Check if user has existing security questions
  useEffect(() => {
    // If this is part of the registration flow, skip checking for existing questions
    if (isRegistration) {
      setHasExistingQuestions(false);
      setStep(2); // Skip password verification for registration
      return;
    }

    // For all other cases, always start with password verification
    setStep(1);

    const checkSecurityQuestions = async () => {
      try {
        if (user && user.username) {
          try {
            const response = await authAPI.getSecurityQuestions(user.username);
            if (response.data.success && response.data.data) {
              setHasExistingQuestions(true);
              // If user has existing questions, pre-fill the form with the questions (not answers)
              setFormData(prev => ({
                ...prev,
                question1: response.data.data.question1,
                question2: response.data.data.question2
              }));
            }
          } catch (err) {
            // If we get a 404 or 400, user doesn't have security questions set up
            if (err.response?.status === 404 || err.response?.status === 400) {
              setHasExistingQuestions(false);
              // Still require password verification, but don't pre-fill questions
            } else {
              console.error('Error checking security questions:', err);
            }
          }
        }
      } catch (err) {
        console.error('Error in checkSecurityQuestions:', err);
      }
    };

    checkSecurityQuestions();
  }, [user, isRegistration]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordVerification = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validate password is not empty
    if (!password.trim()) {
      setError('Please enter your current password');
      setIsLoading(false);
      return;
    }

    try {
      // Verify password - we'll use a dedicated endpoint if available
      // For now, using the changePassword endpoint but with the same password
      const response = await authAPI.changePassword({
        currentPassword: password,
        newPassword: password // We're not actually changing the password, just verifying it
      });

      // If we get here, password is correct
      setStep(2);
      setSuccess('Password verified successfully');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      console.error('Error verifying password:', err);
      setError('Incorrect password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    // Validate answers are not empty
    if (!formData.answer1.trim() || !formData.answer2.trim()) {
      setError('Please provide answers to both security questions');
      setIsLoading(false);
      return;
    }

    // Validate questions are different
    if (formData.question1 === formData.question2) {
      setError('Please select two different security questions');
      setIsLoading(false);
      return;
    }

    try {
      // For registration flow, we might need to handle things differently
      // since the user might not be logged in yet
      let response;

      if (isRegistration) {
        // For registration, we need to use the temporary user data
        response = await authAPI.setSecurityQuestions(
          formData.question1,
          formData.answer1,
          formData.question2,
          formData.answer2,
          userData?.email // Pass the email from registration data
        );
      } else {
        // Normal flow for logged-in users
        response = await authAPI.setSecurityQuestions(
          formData.question1,
          formData.answer1,
          formData.question2,
          formData.answer2
        );
      }

      setSuccess(response.data.message || 'Security questions set successfully');

      // Call the onComplete callback if provided
      if (onComplete && typeof onComplete === 'function') {
        setTimeout(() => {
          onComplete();
        }, 2000);
      }
    } catch (err) {
      console.error('Error setting security questions:', err);
      setError(
        err.response?.data?.message ||
        'An error occurred while setting your security questions. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-xl font-bold mb-4">
        {step === 1 ? 'Verify Your Password' : hasExistingQuestions ? 'Change Security Questions' : 'Set Up Security Questions'}
      </h2>

      {step === 1 && (
        <div className="bg-[#004080]/10 p-4 rounded-md mb-6 border border-[#004080]/20">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-[#004080] mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-[#004080] font-medium">Password Verification Required</p>
              <p className="text-gray-600 mt-1">
                For security reasons, you must verify your current password before {hasExistingQuestions ? 'changing' : 'setting up'} your security questions.
              </p>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <p className="text-gray-600 mb-6">
          {hasExistingQuestions
            ? 'You can update your security questions below. These will be used to verify your identity if you need to reset your password.'
            : 'Please set up your security questions. These will be used to verify your identity if you need to reset your password.'}
        </p>
      )}

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

      {step === 1 ? (
        <div className="border border-gray-200 rounded-md p-6 bg-white shadow-sm">
          <form onSubmit={handlePasswordVerification}>
            {/* Hidden username field to help password managers */}
            <input
              type="hidden"
              id="username"
              name="username"
              value={user?.email || user?.username || ''}
              autoComplete="username"
            />

            <div className="mb-4">
              <label htmlFor="password" className="form-label">Current Password</label>
              <div className="relative">
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input pr-10 w-full"
                  required
                  autoComplete="current-password"
                  placeholder="Enter your current password"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="submit"
                className="bg-[#01427a] hover:bg-[#003366] text-white px-4 py-2 rounded-md font-medium w-full flex items-center justify-center"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify Password
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      ) : step === 2 && (
        <div className="border border-gray-200 rounded-md p-6 bg-white shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="question1" className="form-label">Security Question 1</label>
              <select
                id="question1"
                name="question1"
                value={formData.question1}
                onChange={handleChange}
                className="form-input w-full"
                required
              >
                {SECURITY_QUESTION_OPTIONS.map((question, index) => (
                  <option key={`q1-${index}`} value={question}>
                    {question}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="answer1" className="form-label">Answer 1</label>
              <input
                type="text"
                id="answer1"
                name="answer1"
                value={formData.answer1}
                onChange={handleChange}
                className="form-input w-full"
                placeholder="Your answer"
                required
              />
            </div>

            <div>
              <label htmlFor="question2" className="form-label">Security Question 2</label>
              <select
                id="question2"
                name="question2"
                value={formData.question2}
                onChange={handleChange}
                className="form-input w-full"
                required
              >
                {SECURITY_QUESTION_OPTIONS.map((question, index) => (
                  <option key={`q2-${index}`} value={question}>
                    {question}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="answer2" className="form-label">Answer 2</label>
              <input
                type="text"
                id="answer2"
                name="answer2"
                value={formData.answer2}
                onChange={handleChange}
                className="form-input w-full"
                placeholder="Your answer"
                required
              />
            </div>

            <div className="mt-6">
              <button
                type="submit"
                className="bg-[#01427a] hover:bg-[#003366] text-white px-4 py-2 rounded-md font-medium w-full flex items-center justify-center"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    {hasExistingQuestions ? 'Update Security Questions' : 'Save Security Questions'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default SecurityQuestions;
