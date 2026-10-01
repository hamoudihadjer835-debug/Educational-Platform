import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { teacherAPI } from '../../services/api';

const Dashboard = () => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalModules: 0,
    totalChapters: 0,
    totalQuizzes: 0,
    totalFiles: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch modules
        const response = await teacherAPI.getAssignedModules();
        const moduleData = response.data.data;
        setModules(moduleData);

        // Calculate statistics
        let totalStudents = 0;
        let totalChapters = 0;
        let totalQuizzes = 0;
        let totalFiles = 0;

        // Fetch quizzes for each module
        const quizPromises = moduleData.map(module =>
          teacherAPI.getModuleQuizzes(module._id)
            .then(res => res.data.data || [])
            .catch(() => [])
        );

        const quizzesResults = await Promise.all(quizPromises);

        // Process module data
        moduleData.forEach((module, index) => {
          // Set enrolled students to 0 since there are no enrolled students yet
          module.enrolledStudents = 0;
          totalStudents += module.enrolledStudents;

          // Count chapters
          totalChapters += module.chapters ? module.chapters.length : 0;

          // Count files in chapters
          if (module.chapters) {
            module.chapters.forEach(chapter => {
              totalFiles += chapter.files ? chapter.files.length : 0;
            });
          }

          // Count files in syllabus
          if (module.syllabus && module.syllabus.files) {
            totalFiles += module.syllabus.files.length;
          }

          // Count files in references
          if (module.references) {
            module.references.forEach(reference => {
              totalFiles += reference.files ? reference.files.length : 0;
            });
          }

          // Count quizzes
          const moduleQuizzes = quizzesResults[index] || [];
          totalQuizzes += moduleQuizzes.length;
        });

        setStats({
          totalStudents,
          totalModules: moduleData.length,
          totalChapters,
          totalQuizzes,
          totalFiles
        });
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load your data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
            <h1 className="text-2xl font-bold text-white mb-2">Teacher Dashboard</h1>
            <p className="text-white/90">Manage your modules and create educational content</p>
          </div>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link to="/teacher/modules" className="bg-white text-[#004080] hover:bg-white/90 px-4 py-2 rounded-md font-medium">
              View All Modules
            </Link>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-danger/10 text-danger p-4 rounded-md border border-danger/20 mb-6">
          {error}
        </div>
      )}

      {/* Welcome Card */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
        <div className="flex items-center mb-4">
          <div className="bg-[#004080] p-3 rounded-full mr-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#004080]">Welcome, Teacher!</h2>
        </div>
        <p className="text-gray-600 mb-6">
          From here you can manage your assigned modules, create lessons, and create quizzes for your students.
        </p>
        <div>
          <Link to="/teacher/modules" className="inline-flex items-center bg-[#004080] text-white px-4 py-2 rounded-md font-medium hover:bg-[#003366] transition-colors">
            View All Modules
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div>
        <h2 className="text-2xl font-bold mb-4 text-[#004080]">Your Statistics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* Assigned Modules Card */}
          <div className="flex items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
            <div className="flex-shrink-0 bg-[#01427a]/10 p-3 rounded-lg mr-3">
              <svg className="w-6 h-6 text-[#01427a]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-[#01427a]">{stats.totalModules}</h3>
              <p className="text-gray-600 mt-1 text-sm">Assigned Modules</p>
            </div>
          </div>

          {/* Enrolled Students Card */}
          <div className="flex items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
            <div className="flex-shrink-0 bg-[#e14177]/10 p-3 rounded-lg mr-3">
              <svg className="w-6 h-6 text-[#e14177]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-[#e14177]">{stats.totalStudents}</h3>
              <p className="text-gray-600 mt-1 text-sm">Enrolled Students</p>
            </div>
          </div>

          {/* Chapters Card */}
          <div className="flex items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
            <div className="flex-shrink-0 bg-[#6dcffb]/10 p-3 rounded-lg mr-3">
              <svg className="w-6 h-6 text-[#6dcffb]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-[#6dcffb]">{stats.totalChapters}</h3>
              <p className="text-gray-600 mt-1 text-sm">Total Chapters</p>
            </div>
          </div>

          {/* Files Card */}
          <div className="flex items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
            <div className="flex-shrink-0 bg-[#01427a]/10 p-3 rounded-lg mr-3">
              <svg className="w-6 h-6 text-[#01427a]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-[#01427a]">{stats.totalFiles}</h3>
              <p className="text-gray-600 mt-1 text-sm">Uploaded Files</p>
            </div>
          </div>

          {/* Quizzes Card */}
          <div className="flex items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
            <div className="flex-shrink-0 bg-[#e14177]/10 p-3 rounded-lg mr-3">
              <svg className="w-6 h-6 text-[#e14177]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-[#e14177]">{stats.totalQuizzes}</h3>
              <p className="text-gray-600 mt-1 text-sm">Created Quizzes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Assigned Modules */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-6 pb-2 border-b border-gray-200 text-[#01427a]">Your Assigned Modules</h2>

        {modules.length === 0 ? (
          <div className="bg-white text-center py-12 px-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="bg-[#6dcffb]/10 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-[#6dcffb]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[#01427a] mb-4">No Assigned Modules</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              You don't have any assigned modules yet. Modules are assigned by administrators. Please check back later or contact an administrator.
            </p>
            <button onClick={() => window.location.reload()} className="inline-flex items-center bg-[#01427a] hover:bg-[#01325e] text-white px-4 py-2 rounded-md font-medium transition-colors">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Page
            </button>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {modules.slice(-3).map(module => (
                <div key={module._id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden">
                  <div className="border-b border-gray-100 bg-gray-50 px-6 py-4 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-[#01427a]">{module.title}</h3>
                    <span className="bg-[#e14177]/10 text-[#e14177] text-xs font-medium px-2.5 py-1 rounded">{module.level ? module.level.toUpperCase() : 'N/A'}</span>
                  </div>

                  <div className="p-6">
                    <p className="text-gray-600 mb-4 line-clamp-2">{module.description}</p>

                    <div className="grid grid-cols-2 gap-4 mb-5">
                      <div className="flex items-center">
                        <div className="bg-[#01427a]/10 p-2 rounded-full mr-2">
                          <svg className="w-4 h-4 text-[#01427a]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Academic Year</p>
                          <p className="text-sm font-medium">{module.academicYear}</p>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <div className="bg-[#e14177]/10 p-2 rounded-full mr-2">
                          <svg className="w-4 h-4 text-[#e14177]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Students</p>
                          <p className="text-sm font-medium">0 Enrolled</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <Link
                        to={`/teacher/modules/${module._id}`}
                        className="flex-1 flex items-center justify-center bg-[#01427a] hover:bg-[#01325e] text-white py-2.5 px-4 rounded-md transition-colors"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Manage
                      </Link>
                      <Link
                        to={`/teacher/modules/${module._id}/create-quiz`}
                        className="flex-1 flex items-center justify-center bg-[#e14177] hover:bg-[#c73868] text-white py-2.5 px-4 rounded-md transition-colors"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Quiz
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {modules.length > 3 && (
              <div className="flex justify-center mt-8">
                <Link to="/teacher/modules" className="inline-flex items-center bg-[#e14177] hover:bg-[#c73868] text-white px-6 py-2.5 rounded-md font-medium transition-colors">
                  See All Modules
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
};

export default Dashboard;
