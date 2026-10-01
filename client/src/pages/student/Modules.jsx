import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { studentAPI } from '../../services/api';

const Modules = () => {
  const [enrolledModules, setEnrolledModules] = useState([]);
  const [availableModules, setAvailableModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState('enrolled'); // 'enrolled' or 'available'
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
  const [academicYears, setAcademicYears] = useState(['2023-2024', '2024-2025', '2025-2026']);

  // Initialize selected academic year from localStorage or default to current year
  useEffect(() => {
    const savedYear = localStorage.getItem('selectedAcademicYear');
    if (savedYear) {
      setSelectedAcademicYear(savedYear);
    } else {
      // Default to current academic year
      const currentYear = new Date().getFullYear();
      const defaultYear = `${currentYear}-${currentYear + 1}`;
      setSelectedAcademicYear(defaultYear);
      localStorage.setItem('selectedAcademicYear', defaultYear);
    }
  }, []);

  // Fetch modules when academic year changes
  const fetchData = async () => {
    if (!selectedAcademicYear) return;

    setLoading(true);
    setError('');
    console.log(`Fetching modules for academic year: ${selectedAcademicYear}`);

    try {
      setEnrolledModules([]);
      setAvailableModules([]);

      // First try to fetch enrolled modules
      try {
        console.log(`Fetching enrolled modules for academic year: ${selectedAcademicYear}`);
        const enrolledResponse = await studentAPI.getEnrolledModules(selectedAcademicYear);
        console.log('Enrolled modules response:', enrolledResponse.data);

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
          setError(`No enrolled modules found for academic year ${selectedAcademicYear}. This is normal if you haven't enrolled in any modules for this year yet.`);
        } else {
          setError(enrolledError.response?.data?.message || 'Failed to load enrolled modules');
        }
      }

      // Then try to fetch available modules
      try {
        console.log(`Fetching available modules for academic year: ${selectedAcademicYear}`);
        const availableResponse = await studentAPI.getAvailableModules(selectedAcademicYear);
        console.log('Available modules response:', availableResponse.data);

        // Fetch enrolled modules again to ensure we have the latest data
        const refreshedEnrolledResponse = await studentAPI.getEnrolledModules(selectedAcademicYear);
        const refreshedEnrolledModules = refreshedEnrolledResponse.data.data || [];
        console.log('Refreshed enrolled modules:', refreshedEnrolledModules);

        // Update enrolled modules state with the latest data
        setEnrolledModules(refreshedEnrolledModules);

        // Get the enrolled module IDs to filter out from available modules
        const enrolledIds = new Set(refreshedEnrolledModules.map(module => module._id));
        console.log('Enrolled module IDs:', Array.from(enrolledIds));

        // Filter out modules that the student is already enrolled in
        const availableData = (availableResponse.data.data || []).filter(
          module => !enrolledIds.has(module._id)
        );

        console.log(`Found ${availableData.length} available modules after filtering`);
        setAvailableModules(availableData);

        // If we have a message from the server about available modules, update the error message
        if (availableResponse.data.message && !error) {
          setError(availableResponse.data.message);
        }
      } catch (availableError) {
        console.error('Error fetching available modules:', availableError);
        // Don't override the enrolled modules error if it exists
        if (!error) {
          if (availableError.message === 'Network Error') {
            setError(`No available modules found for academic year ${selectedAcademicYear}.`);
          } else {
            setError(availableError.response?.data?.message || 'Failed to load available modules');
          }
        }
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedAcademicYear]);

  const handleEnroll = async (moduleId) => {
    try {
      console.log(`Enrolling in module ${moduleId} for academic year ${selectedAcademicYear}`);
      await studentAPI.enrollInModule(moduleId, selectedAcademicYear);

      // Find the module that was enrolled in
      const enrolledModule = availableModules.find(module => module._id === moduleId);

      if (enrolledModule) {
        console.log(`Successfully enrolled in module: ${enrolledModule.title}`);

        // Update state
        setEnrolledModules(prev => [...prev, enrolledModule]);
        setAvailableModules(prev => prev.filter(module => module._id !== moduleId));

        setSuccessMessage(`Successfully enrolled in ${enrolledModule.title}`);
        setTimeout(() => setSuccessMessage(''), 3000);

        // Force a refresh of the data after a short delay to ensure server state is updated
        setTimeout(() => {
          fetchData();
        }, 500);
      } else {
        console.log('Module not found in available modules after enrollment');
        // Refresh the data to ensure we have the latest state
        fetchData();
      }
    } catch (err) {
      console.error('Error enrolling in module:', err);
      setError(err.response?.data?.message || 'Failed to enroll in module');
      setTimeout(() => setError(''), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1>My Modules</h1>

        {/* Academic Year Selector */}
        <div className="flex items-center space-x-2">
          <label htmlFor="academicYear" className="text-sm font-medium">Academic Year:</label>
          <select
            id="academicYear"
            value={selectedAcademicYear}
            onChange={(e) => {
              setSelectedAcademicYear(e.target.value);
              localStorage.setItem('selectedAcademicYear', e.target.value);
            }}
            className="form-input py-1 px-2 text-sm"
          >
            {academicYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-danger/10 text-danger p-4 rounded-md">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="bg-success/10 text-success p-4 rounded-md">
          {successMessage}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('enrolled')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'enrolled'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Enrolled Modules ({enrolledModules.length})
          </button>
          <button
            onClick={() => setActiveTab('available')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'available'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Available Modules ({availableModules.length})
          </button>
        </nav>
      </div>

      {/* Module Cards */}
      <div>
        {activeTab === 'enrolled' ? (
          enrolledModules.length === 0 ? (
            <div className="card bg-gray-50 text-center py-8">
              <p className="text-gray-500 mb-4">You are not enrolled in any modules yet.</p>
              <button
                onClick={() => setActiveTab('available')}
                className="btn btn-primary"
              >
                Browse All Available Modules
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledModules.map(module => (
                <div key={module._id} className="card hover:shadow-lg transition-shadow">
                  <h3 className="text-xl font-bold mb-2">{module.title}</h3>
                  <p className="text-gray-600 mb-4">{module.description}</p>
                  <div className="flex justify-between text-sm text-gray-500 mb-4">
                    <span>Academic Year: {module.academicYear}</span>
                    <span>Teacher: {module.teacher ? `${module.teacher.firstName} ${module.teacher.lastName}` : 'Not assigned'}</span>
                  </div>
                  <div className="flex space-x-2">
                    <Link
                      to={`/student/lessons/${module._id}`}
                      className="btn btn-primary flex-1"
                    >
                      View Lessons
                    </Link>
                    <Link
                      to={`/student/modules/${module._id}/quizzes`}
                      className="btn btn-secondary flex-1"
                    >
                      Quizzes
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          availableModules.length === 0 ? (
            <div className="card bg-gray-50 text-center py-8">
              <p className="text-gray-500 mb-4">No additional modules are available for your academic year.</p>
              {enrolledModules.length > 0 && (
                <button
                  onClick={() => setActiveTab('enrolled')}
                  className="btn btn-primary"
                >
                  View Your Enrolled Modules
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableModules.map(module => (
                <div key={module._id} className="card hover:shadow-lg transition-shadow">
                  <h3 className="text-xl font-bold mb-2">{module.title}</h3>
                  <p className="text-gray-600 mb-4">{module.description}</p>
                  <div className="flex justify-between text-sm text-gray-500 mb-4">
                    <span>Academic Year: {module.academicYear}</span>
                    <span>Teacher: {module.teacher ? `${module.teacher.firstName} ${module.teacher.lastName}` : 'Not assigned'}</span>
                  </div>
                  <button
                    onClick={() => handleEnroll(module._id)}
                    className="btn btn-secondary w-full"
                  >
                    Enroll Now
                  </button>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Modules;
