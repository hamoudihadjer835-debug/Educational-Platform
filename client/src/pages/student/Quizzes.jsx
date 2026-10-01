import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { studentAPI } from '../../services/api';

const Quizzes = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [module, setModule] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Function to fetch data that can be called multiple times
  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch module details
      const enrolledResponse = await studentAPI.getEnrolledModules();
      const moduleData = enrolledResponse.data.data.find(m => m._id === moduleId);
      setModule(moduleData);

      if (!moduleData) {
        setError('Module not found or you are not enrolled in this module');
        setLoading(false);
        return;
      }

      // Fetch quizzes for this module
      const quizzesResponse = await studentAPI.getModuleQuizzes(moduleId);
      setQuizzes(quizzesResponse.data.data);

      // Check if there's a message from the server
      if (quizzesResponse.data.message) {
        setMessage(quizzesResponse.data.message);
      }
    } catch (err) {
      console.error('Error fetching quizzes:', err);
      setError('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when component mounts or moduleId changes
  useEffect(() => {
    fetchData();
  }, [moduleId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Check if we need to refresh based on location state (e.g., after retaking a quiz)
  useEffect(() => {
    if (location.state?.refreshQuizzes) {
      console.log('Refresh flag detected, refreshing quiz data');
      fetchData();

      // Clear the state to prevent unnecessary refreshes
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname, fetchData]);

  // Add a listener for when the component becomes visible again (e.g., after returning from taking a quiz)
  useEffect(() => {
    // This will run when the component is focused (e.g., after navigating back from another page)
    const handleFocus = () => {
      console.log('Window focused, refreshing quiz data');
      fetchData();
    };

    window.addEventListener('focus', handleFocus);

    // Clean up the event listener when component unmounts
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [moduleId, fetchData]); // Include moduleId and fetchData in dependencies

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#e14177]/10 text-[#e14177] p-4 rounded-md border border-[#e14177]/20 mb-6">
        {error}
        <button
          onClick={() => navigate('/student/modules')}
          className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-md font-medium border border-gray-200 mt-4"
        >
          Back to Modules
        </button>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="bg-[#e14177]/10 text-[#e14177] p-4 rounded-md border border-[#e14177]/20 mb-6">
        Module not found or you are not enrolled in this module.
        <button
          onClick={() => navigate('/student/modules')}
          className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-md font-medium border border-gray-200 mt-4"
        >
          Back to Modules
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="relative">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-[#004080]">Module Quizzes</h1>
          <Link
            to="/student/modules"
            className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-md font-medium border border-gray-200"
          >
            Back to Modules Page
          </Link>
        </div>
      </div>

      {/* Module Info */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6 shadow-sm relative overflow-hidden">
        {/* Left accent bar */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#6dcffb]"></div>

        <div className="pl-4"> {/* Add padding to account for the accent bar */}
          <h2 className="text-xl font-bold mb-4 text-[#004080]">{module.title}</h2>
          <p className="text-gray-600 mb-4">{module.description}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <span><strong>Academic Year:</strong> {module.academicYear}</span>
            <span><strong>Level:</strong> {module.level ? module.level.toUpperCase() : 'Not specified'}</span>
            <span><strong>Semester:</strong> {module.semester || 'Not specified'}</span>
            <span><strong>Teacher:</strong> {module.teacher?.firstName} {module.teacher?.lastName || 'Not assigned'}</span>
          </div>
        </div>
      </div>

      {/* Quizzes */}
      <div className="space-y-8">
        {/* Available Quizzes */}
        <div>
          <h3 className="text-xl font-bold mb-4 text-[#004080]">Available Quizzes</h3>

          {quizzes.length === 0 || quizzes.every(quiz => quiz.isSubmitted) ? (
            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 text-center py-10">
              <div className="bg-[#6dcffb]/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#6dcffb]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              {message ? (
                <p className="text-[#01427a] mb-6 text-lg">{message}</p>
              ) : quizzes.length === 0 ? (
                <p className="text-gray-600 mb-6 text-lg">No quizzes available for this module yet.</p>
              ) : (
                <p className="text-gray-600 mb-6 text-lg">You have completed all available quizzes.</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {quizzes.filter(quiz => !quiz.isSubmitted).map(quiz => {
                const totalQuestions = quiz.questions ? quiz.questions.length : 0;

                return (
                  <div key={quiz._id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden">
                    {/* Header with gradient background */}
                    <div className="bg-gradient-to-r from-[#004080] to-[#6dcffb] p-4 text-white">
                      <div className="flex items-center">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-[#004080] mr-3 text-sm font-medium shadow-sm">Q</span>
                        <h4 className="text-lg font-bold text-white m-0">{quiz.title}</h4>
                      </div>
                    </div>

                    <div className="p-5">
                      {quiz.description ? (
                        <p className="text-gray-600 mb-4">{quiz.description}</p>
                      ) : (
                        <p className="text-gray-500 italic mb-4">No description provided</p>
                      )}

                      <div className="flex flex-wrap gap-4 mb-4">
                        <div className="flex items-center text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full">
                          <svg className="w-4 h-4 mr-1.5 text-[#6dcffb]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Questions: {totalQuestions}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex justify-end p-4 pt-0 border-t border-gray-100">
                      <Link
                        to={`/student/quizzes/${quiz._id}/take`}
                        className="flex items-center justify-center bg-[#01427a] hover:bg-[#01325e] text-white py-2 px-4 rounded-md transition-colors"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        Take Quiz
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Completed Quizzes */}
        {quizzes.some(quiz => quiz.isSubmitted) && (
          <div>
            <h3 className="text-xl font-bold mb-4 text-[#004080]">Completed Quizzes</h3>
            <div className="grid grid-cols-1 gap-6">
              {quizzes.filter(quiz => quiz.isSubmitted).map(quiz => {
                const isGraded = quiz.isGraded;
                const score = quiz.score || 0;
                const totalQuestions = quiz.questions ? quiz.questions.length : 0;

                return (
                  <div key={quiz._id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden">
                    {/* Header with gradient background */}
                    <div className="bg-gradient-to-r from-[#004080] to-[#6dcffb] p-4 text-white">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-[#004080] mr-3 text-sm font-medium shadow-sm">Q</span>
                          <h4 className="text-lg font-bold text-white m-0">{quiz.title}</h4>
                        </div>
                        <div className="bg-white text-[#004080] px-2 py-1 rounded-full text-sm font-medium">
                          Score: {score}/{totalQuestions}
                        </div>
                      </div>
                    </div>

                    <div className="p-5">
                      {quiz.description ? (
                        <p className="text-gray-600 mb-4">{quiz.description}</p>
                      ) : (
                        <p className="text-gray-500 italic mb-4">No description provided</p>
                      )}

                      <div className="flex flex-wrap gap-4 mb-4">
                        <div className="flex items-center text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full">
                          <svg className="w-4 h-4 mr-1.5 text-[#6dcffb]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Questions: {totalQuestions}</span>
                        </div>

                        <div className="flex items-center text-sm bg-[#01427a]/10 text-[#01427a] px-3 py-1.5 rounded-full">
                          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Score: {score}/{totalQuestions}</span>
                        </div>
                      </div>

                      {/* Score display removed */}
                    </div>

                    {/* Action Button */}
                    <div className="flex justify-end p-4 pt-0 border-t border-gray-100">
                      <Link
                        to={`/student/quizzes/${quiz._id}/take`}
                        className="flex items-center justify-center bg-[#01427a] hover:bg-[#01325e] text-white py-2 px-4 rounded-md transition-colors"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Retake Quiz
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Quizzes;
