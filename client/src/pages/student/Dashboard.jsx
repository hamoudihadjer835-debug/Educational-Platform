import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { studentAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [enrolledModules, setEnrolledModules] = useState([]);
  const [availableModules, setAvailableModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setEnrolledModules([]);
        setAvailableModules([]);

        // First try to fetch enrolled modules
        try {
          const enrolledResponse = await studentAPI.getEnrolledModules(user.academicYear);
          setEnrolledModules(enrolledResponse.data.data || []);

          // If we have a message from the server, show it
          if (enrolledResponse.data.message) {
            setError(enrolledResponse.data.message);
          } else {
            setError('');
          }
        } catch (enrolledError) {
          console.error('Error fetching enrolled modules:', enrolledError);
          if (enrolledError.message === 'Network Error') {
            setError(`No enrolled modules found for academic year ${user.academicYear}. This is normal if you haven't enrolled in any modules for this year yet.`);
          } else {
            setError(enrolledError.response?.data?.message || 'Failed to load enrolled modules');
          }
        }

        // Then try to fetch available modules
        try {
          const availableResponse = await studentAPI.getAvailableModules(user.academicYear);

          // Get the enrolled module IDs to filter out from available modules
          const enrolledIds = new Set(enrolledModules.map(module => module._id));

          // Filter out modules that the student is already enrolled in
          const availableData = (availableResponse.data.data || []).filter(
            module => !enrolledIds.has(module._id)
          );

          setAvailableModules(availableData);

          // If we have a message from the server about available modules, update the error message
          if (availableResponse.data.message && !error) {
            setError(availableResponse.data.message);
          }
        } catch (availableError) {
          console.error('Error fetching available modules:', availableError);
          // Don't show error for no available modules
          if (!error && availableError.message !== 'Network Error') {
            setError(availableError.response?.data?.message || 'Failed to load available modules');
          }
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('An unexpected error occurred. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.academicYear]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-[#004080] to-[#6dcffb] text-white p-6 rounded-lg shadow-md mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Student Dashboard</h1>
            <p className="text-white/90">Access your courses and learning materials</p>
          </div>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link to="/student/modules" className="bg-white text-[#004080] hover:bg-white/90 px-4 py-2 rounded-md font-medium">
              View All Modules
            </Link>
          </div>
        </div>
      </div>

      {/* Error messages removed */}

      {/* Welcome Card */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
        <div className="flex items-center mb-4">
          <div className="bg-[#004080] p-3 rounded-full mr-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#004080]">Welcome, {user.firstName}!</h2>
        </div>
        <p className="text-gray-600 mb-6">
          From here you can access your enrolled modules and discover new courses. Your academic year is set to <span className="font-medium text-[#e14177]">{user.academicYear || '2024-2025'}</span>.
        </p>
        <div>
          <Link to="/student/modules" className="inline-flex items-center bg-[#004080] text-white px-4 py-2 rounded-md font-medium hover:bg-[#003366] transition-colors">
            View All Modules
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Enrolled Modules */}
      <div>
        <h2 className="text-2xl font-bold mb-4 text-[#004080]">Your Enrolled Modules</h2>

        {enrolledModules.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 text-center py-10">
            <div className="bg-[#01427a]/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-600 mb-6 text-lg">You are not enrolled in any modules yet.</p>
            <Link to="/student/modules?tab=available" className="inline-flex items-center bg-[#004080] text-white px-4 py-2 rounded-md font-medium hover:bg-[#003366] transition-colors">
              Browse All Available Modules
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledModules.map(module => (
              <div key={module._id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden">
                <div className="border-b border-gray-100 bg-gray-50 px-6 py-4 flex justify-between items-center">
                  <h3 className="text-xl font-bold text-[#01427a]">{module.title}</h3>
                  <span className="bg-[#01427a]/10 text-[#01427a] text-xs font-medium px-2.5 py-1 rounded">{module.level ? module.level.toUpperCase() : 'N/A'}</span>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 mb-4 line-clamp-2">{module.description}</p>
                  <div className="flex items-center text-sm text-gray-500 mb-5">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Academic Year: {module.academicYear}</span>
                  </div>
                  <div className="flex space-x-3">
                    <Link
                      to={`/student/modules/${module._id}`}
                      className="flex-1 flex items-center justify-center bg-[#01427a] hover:bg-[#01325e] text-white py-2.5 px-4 rounded-md transition-colors"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      View Content
                    </Link>
                    <Link
                      to={`/student/modules/${module._id}/quizzes`}
                      className="flex-1 flex items-center justify-center bg-[#e14177] hover:bg-[#c73868] text-white py-2.5 px-4 rounded-md transition-colors"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Quizzes
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Last Uploaded Modules */}
      {availableModules.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4 text-[#004080]">Last Uploaded Modules</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableModules.slice(0, 3).map(module => (
              <div key={module._id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden">
                <div className="border-b border-gray-100 bg-gray-50 px-6 py-4 flex justify-between items-center">
                  <h3 className="text-xl font-bold text-[#01427a]">{module.title}</h3>
                  <span className="bg-[#e14177]/10 text-[#e14177] text-xs font-medium px-2.5 py-1 rounded">{module.level ? module.level.toUpperCase() : 'N/A'}</span>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 mb-4 line-clamp-2">{module.description}</p>
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Academic Year: {module.academicYear}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500 mb-5">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Teacher: {module.teacher ? `${module.teacher.firstName} ${module.teacher.lastName}` : 'Not assigned'}</span>
                  </div>
                <button
                  onClick={async () => {
                    try {
                      await studentAPI.enrollInModule(module._id, user.academicYear);
                      // Refresh the page to update the lists
                      window.location.reload();
                    } catch (err) {
                      console.error('Error enrolling in module:', err);
                      alert('Failed to enroll in module. Please try again.');
                    }
                  }}
                  className="flex items-center justify-center bg-[#01427a] hover:bg-[#01325e] text-white py-2.5 px-4 rounded-md transition-colors w-full"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Enroll Now
                </button>
                </div>
              </div>
            ))}
          </div>

          {availableModules.length > 3 && (
            <div className="text-center mt-8">
              <Link to="/student/modules?tab=available" className="inline-flex items-center bg-[#004080] text-white px-4 py-2 rounded-md font-medium hover:bg-[#003366] transition-colors">
                See All
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Quick Links */}
      <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
        <h3 className="text-xl font-bold mb-6 pb-2 border-b border-gray-200 text-[#004080]">Quick Links</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/student/modules?tab=enrolled" className="flex flex-col items-center justify-center p-4 bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors text-center">
            <div className="bg-primary/10 p-3 rounded-full mb-3">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h4 className="font-medium mb-1">My Modules</h4>
            <p className="text-sm text-muted">View your enrolled modules</p>
          </Link>

          <Link to="/student/modules?tab=available" className="flex flex-col items-center justify-center p-4 bg-secondary/5 rounded-lg hover:bg-secondary/10 transition-colors text-center">
            <div className="bg-secondary/10 p-3 rounded-full mb-3">
              <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h4 className="font-medium mb-1">Browse All Modules</h4>
            <p className="text-sm text-muted">Discover new modules</p>
          </Link>

          {enrolledModules.length > 0 ? (
            <Link to={`/student/modules/${enrolledModules[0]._id}/quizzes`} className="flex flex-col items-center justify-center p-4 bg-accent/5 rounded-lg hover:bg-accent/10 transition-colors text-center">
              <div className="bg-accent/10 p-3 rounded-full mb-3">
                <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h4 className="font-medium mb-1">Latest Quizzes</h4>
              <p className="text-sm text-muted">Take quizzes for your modules</p>
            </Link>
          ) : (
            <div className="flex flex-col items-center justify-center p-4 bg-info/5 rounded-lg text-center">
              <div className="bg-info/10 p-3 rounded-full mb-3">
                <svg className="w-6 h-6 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="font-medium mb-1">Settings</h4>
              <p className="text-sm text-muted">Update your profile</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
