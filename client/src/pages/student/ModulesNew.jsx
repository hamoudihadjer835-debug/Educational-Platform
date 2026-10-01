import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { studentAPI } from '../../services/api.new';
import { useAuth } from '../../contexts/AuthContext';

const ModulesNew = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [availableModules, setAvailableModules] = useState([]);
  const [enrolledModules, setEnrolledModules] = useState([]);
  const [activeTab, setActiveTab] = useState('enrolled');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedYear, setSelectedYear] = useState('all');
  const [academicYears, setAcademicYears] = useState(['all']);
  const [isFirstLogin, setIsFirstLogin] = useState(false);

  // Check URL query parameters for tab selection
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get('tab');
    if (tabParam === 'available') {
      setActiveTab('available');
    }
  }, [location.search]);

  // Check if this is the first login after approval
  useEffect(() => {
    const firstLoginAfterApproval = localStorage.getItem('firstLoginAfterApproval') === 'true';
    if (firstLoginAfterApproval) {
      // Set active tab to available modules for first-time users
      setActiveTab('available');
      setIsFirstLogin(true);
      // Reset the flag so this only happens once
      localStorage.setItem('firstLoginAfterApproval', 'false');
    }
  }, []);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        setLoading(true);

        // Fetch enrolled modules
        const enrolledResponse = await studentAPI.getEnrolledModules();
        setEnrolledModules(enrolledResponse.data.data);

        // Fetch available modules
        const availableResponse = await studentAPI.getAvailableModules();
        const modules = availableResponse.data.data;
        setAvailableModules(modules);

        // Extract unique academic years from modules
        const years = ['all'];
        modules.forEach(module => {
          if (module.academicYear && !years.includes(module.academicYear)) {
            years.push(module.academicYear);
          }
        });
        setAcademicYears(years);

        setLoading(false);
      } catch (err) {
        console.error('Error fetching modules:', err);
        setError('Failed to load modules');
        setLoading(false);
      }
    };

    fetchModules();
  }, []);

  const handleYearChange = async (e) => {
    const year = e.target.value;
    setSelectedYear(year);

    try {
      setLoading(true);
      const availableResponse = await studentAPI.getAvailableModules(year !== 'all' ? year : null);
      setAvailableModules(availableResponse.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching modules by year:', err);
      setError('Failed to load modules for selected year');
      setLoading(false);
    }
  };

  const handleEnroll = async (moduleId) => {
    try {
      setLoading(true);
      await studentAPI.enrollInModule(moduleId);

      // Update the lists
      const enrolledResponse = await studentAPI.getEnrolledModules();
      setEnrolledModules(enrolledResponse.data.data);

      const availableResponse = await studentAPI.getAvailableModules(selectedYear !== 'all' ? selectedYear : null);
      setAvailableModules(availableResponse.data.data);

      setSuccess('Successfully enrolled in the module');
      setTimeout(() => setSuccess(''), 3000);

      // Switch to enrolled tab
      setActiveTab('enrolled');

      setLoading(false);
    } catch (err) {
      console.error('Error enrolling in module:', err);
      setError('Failed to enroll in module');
      setTimeout(() => setError(''), 3000);
      setLoading(false);
    }
  };

  if (loading && enrolledModules.length === 0 && availableModules.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-[#004080] to-[#6dcffb] text-white p-6 rounded-lg shadow-md mb-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">My Modules</h1>
            <p className="text-white/90">Browse and manage your educational modules</p>
          </div>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <button
              onClick={() => setActiveTab('enrolled')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${activeTab === 'enrolled' ? 'bg-white text-[#004080]' : 'bg-[#004080]/20 text-white hover:bg-[#004080]/30'}`}
            >
              Enrolled Modules
            </button>
            <button
              onClick={() => setActiveTab('available')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${activeTab === 'available' ? 'bg-white text-[#004080]' : 'bg-[#004080]/20 text-white hover:bg-[#004080]/30'}`}
            >
              Available Modules
            </button>
          </div>
        </div>
      </div>

      {/* Filter by Academic Year - Only shown when on Available tab */}
      {activeTab === 'available' && (
        <div className="flex items-center mb-6 ml-1">
          <span className="text-[#01427a] mr-3 font-medium">Filter by Academic Year:</span>
          <div className="w-48">
            <select
              id="academicYear"
              value={selectedYear}
              onChange={handleYearChange}
              className="w-full px-3 py-1.5 border border-gray-300 bg-white text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#01427a]/30"
            >
              {academicYears.map(year => (
                <option key={year} value={year}>
                  {year === 'all' ? 'All Years' : year}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-[#e14177]/10 text-[#e14177] p-4 rounded-md border border-[#e14177]/20 mb-6">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-[#01427a]/10 text-[#01427a] p-4 rounded-md border border-[#01427a]/20 mb-6">
          {success}
        </div>
      )}

      {/* First-time login welcome message */}
      {isFirstLogin && activeTab === 'available' && (
        <div className="bg-[#01427a]/10 text-[#01427a] p-6 rounded-md border border-[#01427a]/20 mb-6">
          <div className="flex items-start">
            <div className="bg-[#01427a] p-2 rounded-full mr-4 mt-1">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-2">Welcome to Your Learning Journey!</h3>
              <p className="mb-2">
                Your account has been approved, and you can now browse and enroll in modules available for your level ({user?.level?.toUpperCase()}).
              </p>
              <p>
                Below you'll find all the modules that match your academic level. Click "Enroll Now" on any module to add it to your enrolled modules.
              </p>
            </div>
          </div>
        </div>
      )}


      {/* Module Cards */}
      <div>
        {activeTab === 'enrolled' ? (
          enrolledModules.length === 0 ? (
            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 text-center py-10">
              <div className="bg-[#01427a]/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#01427a]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-600 mb-6 text-lg">You are not enrolled in any modules yet.</p>
              <button
                onClick={() => setActiveTab('available')}
                className="inline-flex items-center bg-[#004080] text-white px-4 py-2 rounded-md font-medium hover:bg-[#003366] transition-colors"
              >
                Browse All Available Modules
              </button>
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
          )
        ) : (
          <div>

            {availableModules.length === 0 ? (
              <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 text-center py-10">
                <div className="bg-[#6dcffb]/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-[#6dcffb]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-gray-600 mb-6 text-lg">No additional modules are available for {selectedYear === 'all' ? 'your academic year' : `the ${selectedYear} academic year`}.</p>
                {enrolledModules.length > 0 && (
                  <button
                    onClick={() => setActiveTab('enrolled')}
                    className="inline-flex items-center bg-[#004080] text-white px-4 py-2 rounded-md font-medium hover:bg-[#003366] transition-colors"
                  >
                    View Your Enrolled Modules
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableModules.map(module => (
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
                        onClick={() => handleEnroll(module._id)}
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
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModulesNew;
