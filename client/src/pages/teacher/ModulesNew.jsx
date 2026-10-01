import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { teacherAPI } from '../../services/api.new';

const ModulesNew = () => {
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { moduleId } = useParams();

  useEffect(() => {
    const fetchModules = async () => {
      try {
        setLoading(true);
        console.log('Fetching teacher modules...');

        // Clear any previous errors
        setError('');

        const response = await teacherAPI.getAssignedModules();
        console.log('Modules response:', response.data);

        if (response.data && response.data.data) {
          setModules(response.data.data);

          // If moduleId is provided in the URL, select that module
          if (moduleId) {
            const module = response.data.data.find(m => m._id === moduleId);
            if (module) {
              handleModuleClick(moduleId);
            }
          }
        } else {
          throw new Error('Invalid response format');
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching modules:', err);
        setError('Failed to load modules. Please try refreshing the page.');
        setLoading(false);
      }
    };

    fetchModules();
  }, [moduleId]);

  const handleModuleClick = async (moduleId) => {
    try {
      setLoading(true);

      // Check if moduleId is valid
      if (!moduleId || moduleId.length !== 24) {
        console.error('Invalid module ID format:', moduleId);
        setError(`Invalid module ID format: ${moduleId}`);
        setLoading(false);
        return;
      }

      console.log('Fetching module details for ID:', moduleId);
      const response = await teacherAPI.getModuleDetails(moduleId);
      console.log('Module details response:', response.data);

      // Handle different response structures
      if (response.data && response.data.data) {
        if (response.data.data.module) {
          // If the API returns { data: { module, lessons } }
          setSelectedModule(response.data.data.module);
        } else {
          // If the API returns { data: module }
          setSelectedModule(response.data.data);
        }
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching module details:', err);
      setError('Failed to load module details');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !selectedModule) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-[#01427a] mb-8">My Modules</h1>

      {error && (
        <div className="bg-danger/10 text-danger p-4 rounded-md mb-6 border border-danger/20">
          <div className="flex items-center mb-2">
            <span className="material-icons-outlined mr-2">error_outline</span>
            <span className="font-semibold">Error</span>
          </div>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-[#004080] hover:bg-[#003366] text-white px-4 py-2 rounded-md font-medium"
          >
            Refresh Page
          </button>
        </div>
      )}

      {selectedModule ? (
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-2xl font-bold mb-2">{selectedModule.title}</h2>
            <p className="text-gray-600 mb-4">{selectedModule.description}</p>
            <div className="flex justify-between text-sm text-gray-500 mb-6">
              <span>Academic Year: {selectedModule.academicYear}</span>
              <span>Level: {selectedModule.level ? selectedModule.level.toUpperCase() : 'Not specified'}</span>
              <span>Semester: {selectedModule.semester ? selectedModule.semester : 'Not specified'}</span>
            </div>
            <div className="flex space-x-4">
              <Link
                to={`/teacher/modules/${selectedModule._id}/edit`}
                className="btn btn-primary"
              >
                Edit Module
              </Link>
              <Link
                to={`/teacher/modules/${selectedModule._id}/create-quiz`}
                className="btn btn-secondary"
              >
                Create Quiz
              </Link>
              <button
                onClick={() => setSelectedModule(null)}
                className="btn btn-outline"
              >
                Back to Modules
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-bold mb-4">Chapters</h3>
              {selectedModule.chapters && selectedModule.chapters.length > 0 ? (
                <div className="space-y-4">
                  {selectedModule.chapters.map((chapter, index) => (
                    <div key={index} className="card hover:shadow-lg transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-lg font-bold">Chapter {index + 1}: {chapter.title}</h4>
                          {chapter.content && <p className="text-gray-600 mt-2">{chapter.content}</p>}
                        </div>
                      </div>
                      {chapter.files && chapter.files.length > 0 && (
                        <div className="mt-4">
                          <h5 className="font-semibold text-sm mb-2">Files:</h5>
                          <ul className="space-y-2">
                            {chapter.files.map((file, fileIndex) => (
                              <li key={fileIndex} className="flex items-center">
                                <a
                                  href={file.path}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline flex items-center"
                                >
                                  <span className="material-icons-outlined text-sm mr-1">
                                    {file.fileType === 'pdf' ? 'picture_as_pdf' :
                                     file.fileType === 'video' ? 'videocam' : 'insert_drive_file'}
                                  </span>
                                  {file.originalName || 'File'}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="card bg-gray-50 text-center py-8">
                  <p className="text-gray-500 mb-4">No chapters added to this module yet.</p>
                  <Link
                    to={`/teacher/modules/${selectedModule._id}/edit`}
                    className="btn btn-primary"
                  >
                    Add Your First Chapter
                  </Link>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4">Syllabus</h3>
              {selectedModule.syllabus && (selectedModule.syllabus.content || (selectedModule.syllabus.files && selectedModule.syllabus.files.length > 0)) ? (
                <div className="card hover:shadow-lg transition-shadow">
                  {selectedModule.syllabus.content && (
                    <div className="mb-4">
                      <p className="text-gray-600">{selectedModule.syllabus.content}</p>
                    </div>
                  )}
                  {selectedModule.syllabus.files && selectedModule.syllabus.files.length > 0 && (
                    <div>
                      <h5 className="font-semibold text-sm mb-2">Files:</h5>
                      <ul className="space-y-2">
                        {selectedModule.syllabus.files.map((file, fileIndex) => (
                          <li key={fileIndex} className="flex items-center">
                            <a
                              href={file.path}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline flex items-center"
                            >
                              <span className="material-icons-outlined text-sm mr-1">
                                {file.fileType === 'pdf' ? 'picture_as_pdf' :
                                 file.fileType === 'video' ? 'videocam' : 'insert_drive_file'}
                              </span>
                              {file.originalName || 'File'}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="card bg-gray-50 text-center py-8">
                  <p className="text-gray-500 mb-4">No syllabus added to this module yet.</p>
                  <Link
                    to={`/teacher/modules/${selectedModule._id}/edit`}
                    className="btn btn-primary"
                  >
                    Add Syllabus
                  </Link>
                </div>
              )}

              <h3 className="text-xl font-bold mb-4 mt-6">References</h3>
              {selectedModule.references && selectedModule.references.length > 0 ? (
                <div className="space-y-4">
                  {selectedModule.references.map((reference, index) => (
                    <div key={index} className="card hover:shadow-lg transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-lg font-bold">{reference.title}</h4>
                          {reference.description && <p className="text-gray-600 mt-2">{reference.description}</p>}
                        </div>
                      </div>
                      {reference.files && reference.files.length > 0 && (
                        <div className="mt-4">
                          <h5 className="font-semibold text-sm mb-2">Files:</h5>
                          <ul className="space-y-2">
                            {reference.files.map((file, fileIndex) => (
                              <li key={fileIndex} className="flex items-center">
                                <a
                                  href={file.path}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline flex items-center"
                                >
                                  <span className="material-icons-outlined text-sm mr-1">
                                    {file.fileType === 'pdf' ? 'picture_as_pdf' :
                                     file.fileType === 'video' ? 'videocam' : 'insert_drive_file'}
                                  </span>
                                  {file.originalName || 'File'}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="card bg-gray-50 text-center py-8">
                  <p className="text-gray-500 mb-4">No references added to this module yet.</p>
                  <Link
                    to={`/teacher/modules/${selectedModule._id}/edit`}
                    className="btn btn-primary"
                  >
                    Add References
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {modules.map(module => (
                <Link
                  key={module._id}
                  to={`/teacher/modules/${module._id}`}
                  className="group bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-100 overflow-hidden flex flex-col"
                >
                  <div className="border-b border-gray-100 bg-gray-50 px-6 py-4 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-[#01427a] group-hover:text-[#e14177] transition-colors duration-300">{module.title}</h3>
                    <span className="bg-[#e14177]/10 text-[#e14177] text-xs font-medium px-2.5 py-1 rounded">{module.level ? module.level.toUpperCase() : 'N/A'}</span>
                  </div>

                  <div className="p-6 flex-grow">
                    <div className="grid grid-cols-2 gap-4 mb-6">
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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Semester</p>
                          <p className="text-sm font-medium">{module.semester || 'N/A'}</p>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <div className="bg-[#6dcffb]/10 p-2 rounded-full mr-2">
                          <svg className="w-4 h-4 text-[#6dcffb]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Chapters</p>
                          <p className="text-sm font-medium">{module.chapters?.length || 0}</p>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <div className="bg-[#01427a]/10 p-2 rounded-full mr-2">
                          <svg className="w-4 h-4 text-[#01427a]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Students</p>
                          <p className="text-sm font-medium">0 Enrolled</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end mt-auto pt-2 border-t border-gray-100">
                      <span className="text-[#e14177] text-sm font-medium flex items-center group-hover:translate-x-1 transition-transform duration-300">
                        View Details
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ModulesNew;
