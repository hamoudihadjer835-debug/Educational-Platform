import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { teacherAPI } from '../../services/api.new';

const ModuleDetails = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();

  const [module, setModule] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('chapters'); // Possible values: 'chapters', 'syllabus', 'references', 'quizzes'

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Validate moduleId
        if (!moduleId || moduleId.length !== 24) {
          setError(`Invalid module ID format: ${moduleId}`);
          setLoading(false);
          return;
        }

        console.log('Fetching module details for ID:', moduleId);

        // Fetch module details
        const moduleResponse = await teacherAPI.getModuleDetails(moduleId);
        console.log('Module details response:', moduleResponse.data);

        // Handle different response structures
        if (moduleResponse.data && moduleResponse.data.data) {
          if (moduleResponse.data.data.module) {
            // If the API returns { data: { module, lessons } }
            setModule(moduleResponse.data.data.module);
          } else {
            // If the API returns { data: module }
            setModule(moduleResponse.data.data);
          }
        } else {
          throw new Error('Invalid response format');
        }

        // Fetch quizzes for this module
        const quizzesResponse = await teacherAPI.getModuleQuizzes(moduleId);
        console.log('Quizzes response:', quizzesResponse.data);
        if (quizzesResponse.data && quizzesResponse.data.data) {
          setQuizzes(quizzesResponse.data.data);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load module data');
        setLoading(false);
      }
    };

    fetchData();
  }, [moduleId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-danger/10 text-danger p-4 rounded-md">
        {error}
        <button
          onClick={() => navigate('/teacher/modules')}
          className="btn btn-outline mt-4"
        >
          Back to Modules
        </button>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">Module not found or you don't have access to it.</p>
        <button
          onClick={() => navigate('/teacher/modules')}
          className="btn btn-primary"
        >
          Back to Modules
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-[#004080]">{module.title}</h1>
          <Link
            to="/teacher/modules"
            className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-md font-medium border border-gray-200"
          >
            Back to Modules Page
          </Link>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6 shadow-sm relative overflow-hidden">
          {/* Left accent bar */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#6dcffb]"></div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-3">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-[#6dcffb]/20 flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#01427a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <span className="text-gray-500 text-xs font-medium">Academic Year</span>
                <div className="font-semibold">{module.academicYear}</div>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-[#6dcffb]/20 flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#01427a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <span className="text-gray-500 text-xs font-medium">Level</span>
                <div className="font-semibold">{module.level?.toUpperCase() || 'N/A'}</div>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-[#6dcffb]/20 flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#01427a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <span className="text-gray-500 text-xs font-medium">Semester</span>
                <div className="font-semibold">{module.semester || 'N/A'}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <Link
            to={`/teacher/modules/${moduleId}/edit`}
            className="bg-[#004080] hover:bg-[#003366] text-white px-4 py-2 rounded-md font-medium inline-block"
          >
            Edit Module
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'chapters' ? 'border-b-2 border-[#004080] text-[#004080]' : 'text-gray-500 hover:text-[#004080]'}`}
          onClick={() => setActiveTab('chapters')}
        >
          Chapters
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'syllabus' ? 'border-b-2 border-[#004080] text-[#004080]' : 'text-gray-500 hover:text-[#004080]'}`}
          onClick={() => setActiveTab('syllabus')}
        >
          Syllabus
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'references' ? 'border-b-2 border-[#004080] text-[#004080]' : 'text-gray-500 hover:text-[#004080]'}`}
          onClick={() => setActiveTab('references')}
        >
          References
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'quizzes' ? 'border-b-2 border-[#004080] text-[#004080]' : 'text-gray-500 hover:text-[#004080]'}`}
          onClick={() => setActiveTab('quizzes')}
        >
          Quizzes
        </button>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Chapters Tab */}
        {activeTab === 'chapters' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Chapters</h2>
              <Link
                to={`/teacher/modules/${moduleId}/edit#chapters`}
                className="btn bg-[#e14177] hover:bg-[#c73868] text-white"
              >
                {module.chapters && module.chapters.length > 0 ? 'Add Chapter' : 'Add Your First Chapter'}
              </Link>
            </div>

            {module.chapters && module.chapters.length > 0 ? (
              <div className="space-y-6">
                {module.chapters.map((chapter, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center mb-4 pb-2 border-b border-gray-200">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#6dcffb]/20 text-[#01427a] mr-2">{index + 1}</span>
                      <h3 className="text-lg font-bold text-[#01427a] m-0">Chapter {index + 1}: {chapter.title}</h3>
                    </div>

                    <div className="space-y-4">
                      {chapter.content && <p className="text-gray-600">{chapter.content}</p>}

                      {chapter.files && chapter.files.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Files:</h4>
                          <ul className="space-y-2">
                            {chapter.files.map((file, fileIndex) => (
                              <li key={fileIndex} className="flex items-center bg-gray-50 p-3 rounded-md border border-gray-200">
                                <div className="flex items-center justify-between w-full">
                                  <a
                                    href={file.path.startsWith('/') ? `http://localhost:5000${file.path}` : `http://localhost:5000/${file.path}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#01427a] hover:text-[#6dcffb] flex items-center cursor-pointer"
                                  >
                                  <span className="mr-2 text-lg">
                                    {file.fileType === 'pdf' ? '📄' :
                                     file.fileType === 'video' ? '🎬' : '📝'}
                                  </span>
                                  <span className="truncate">{file.originalName || 'File'}</span>
                                  </a>
                                  {!['pdf', 'jpg', 'jpeg', 'png', 'gif', 'mp4', 'webm'].includes(file.fileType?.toLowerCase()) && (
                                    <a
                                      href={file.path.startsWith('/') ? file.path : `/${file.path}`}
                                      download
                                      className="text-white bg-[#01427a] hover:bg-[#6dcffb] hover:text-[#01427a] px-2 py-1 rounded text-xs font-medium ml-2"
                                    >
                                      Download
                                    </a>
                                  )}
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-500 mb-4">No chapters added to this module yet.</p>
              </div>
            )}
          </div>
        )}

        {/* Syllabus Tab */}
        {activeTab === 'syllabus' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Syllabus</h2>
              <Link
                to={`/teacher/modules/${moduleId}/edit#syllabus`}
                className="btn bg-[#e14177] hover:bg-[#c73868] text-white"
              >
                Edit Syllabus
              </Link>
            </div>

            {module.syllabus && (module.syllabus.content || (module.syllabus.files && module.syllabus.files.length > 0)) ? (
              <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                {module.syllabus.content && (
                  <div className="mb-4">
                    <p className="text-gray-600">{module.syllabus.content}</p>
                  </div>
                )}

                {module.syllabus.files && module.syllabus.files.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Files:</h4>
                    <ul className="space-y-2">
                      {module.syllabus.files.map((file, fileIndex) => (
                        <li key={fileIndex} className="flex items-center bg-gray-50 p-3 rounded-md border border-gray-200">
                          <div className="flex items-center justify-between w-full">
                            <a
                              href={file.path.startsWith('/') ? `http://localhost:5000${file.path}` : `http://localhost:5000/${file.path}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#01427a] hover:text-[#6dcffb] flex items-center cursor-pointer"
                            >
                            <span className="mr-2 text-lg">
                              {file.fileType === 'pdf' ? '📄' :
                               file.fileType === 'video' ? '🎬' : '📝'}
                            </span>
                            <span className="truncate">{file.originalName || 'File'}</span>
                            </a>
                            {!['pdf', 'jpg', 'jpeg', 'png', 'gif', 'mp4', 'webm'].includes(file.fileType?.toLowerCase()) && (
                              <a
                                href={file.path.startsWith('/') ? file.path : `/${file.path}`}
                                download
                                className="text-white bg-[#01427a] hover:bg-[#6dcffb] hover:text-[#01427a] px-2 py-1 rounded text-xs font-medium ml-2"
                              >
                                Download
                              </a>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-500 mb-4">No syllabus has been added to this module yet.</p>
              </div>
            )}
          </div>
        )}

        {/* References Tab */}
        {activeTab === 'references' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">References</h2>
              <Link
                to={`/teacher/modules/${moduleId}/edit#references`}
                className="btn bg-[#e14177] hover:bg-[#c73868] text-white"
              >
                Add References
              </Link>
            </div>

            {module.references && module.references.length > 0 ? (
              <div className="space-y-4">
                {module.references.map((reference, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center mb-4 pb-2 border-b border-gray-200">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#6dcffb]/20 text-[#01427a] mr-2">{index + 1}</span>
                      <h3 className="text-lg font-bold text-[#01427a] m-0">Reference {index + 1}: {reference.title}</h3>
                    </div>

                    <div className="space-y-4">
                      {reference.description && <p className="text-gray-600">{reference.description}</p>}

                      {reference.files && reference.files.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Files:</h4>
                          <ul className="space-y-2">
                            {reference.files.map((file, fileIndex) => (
                              <li key={fileIndex} className="flex items-center bg-gray-50 p-3 rounded-md border border-gray-200">
                                <div className="flex items-center justify-between w-full">
                                  <a
                                    href={file.path.startsWith('/') ? `http://localhost:5000${file.path}` : `http://localhost:5000/${file.path}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#01427a] hover:text-[#6dcffb] flex items-center cursor-pointer"
                                  >
                                  <span className="mr-2 text-lg">
                                    {file.fileType === 'pdf' ? '📄' :
                                     file.fileType === 'video' ? '🎬' : '📝'}
                                  </span>
                                  <span className="truncate">{file.originalName || 'File'}</span>
                                  </a>
                                  {!['pdf', 'jpg', 'jpeg', 'png', 'gif', 'mp4', 'webm'].includes(file.fileType?.toLowerCase()) && (
                                    <a
                                      href={file.path.startsWith('/') ? file.path : `/${file.path}`}
                                      download
                                      className="text-white bg-[#01427a] hover:bg-[#6dcffb] hover:text-[#01427a] px-2 py-1 rounded text-xs font-medium ml-2"
                                    >
                                      Download
                                    </a>
                                  )}
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-500 mb-4">No references have been added to this module yet.</p>
              </div>
            )}
          </div>
        )}

        {/* Quizzes Tab */}
        {activeTab === 'quizzes' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#004080]">Quizzes</h2>
              <Link
                to={`/teacher/modules/${moduleId}/create-quiz`}
                className="bg-[#e14177] hover:bg-[#c73868] text-white rounded-md px-4 py-2 font-medium text-sm"
              >
                Create Quiz
              </Link>
            </div>

            {quizzes && quizzes.length > 0 ? (
              <div className="space-y-4">
                {quizzes.map((quiz, index) => (
                  <div key={quiz._id} className="border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                    <div className="flex items-center justify-between p-4 border-b border-gray-100">
                      <div className="flex items-center">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#6dcffb] text-white mr-3 text-sm font-medium">{index + 1}</span>
                        <h3 className="text-lg font-bold text-[#004080] m-0">{quiz.title}</h3>
                      </div>
                      <Link
                        to={`/teacher/quizzes/${quiz._id}/edit`}
                        className="bg-[#004080] hover:bg-[#003366] text-white px-4 py-1.5 rounded text-sm font-medium"
                      >
                        Edit
                      </Link>
                    </div>

                    <div className="px-4 py-3">
                      <div className="flex items-center text-sm">
                        <span className="text-gray-600">Questions: {quiz.questions?.length || 0}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-500 mb-4">No quizzes have been created for this module yet.</p>
              </div>
            )}
          </div>
        )}
      </div>


    </div>
  );
};

export default ModuleDetails;
