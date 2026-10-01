import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { studentAPI } from '../../services/api.new';

const ModuleContent = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();

  const [module, setModule] = useState(null);
  const [activeTab, setActiveTab] = useState('chapters');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchModuleDetails = async () => {
      try {
        setLoading(true);
        const response = await studentAPI.getModuleDetails(moduleId);
        setModule(response.data.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching module details:', err);
        setError('Failed to load module details');
        setLoading(false);
      }
    };

    fetchModuleDetails();
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
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">Module not found or you don't have access to it.</p>
        <button
          onClick={() => navigate('/student/modules')}
          className="btn btn-primary"
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
          <h1 className="text-2xl font-bold text-[#004080]">{module.title}</h1>
          <Link
            to="/student/modules"
            className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-md font-medium border border-gray-200"
          >
            Back to Modules Page
          </Link>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6 shadow-sm relative overflow-hidden">
        {/* Left accent bar */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#6dcffb]"></div>

        <div className="pl-4"> {/* Add padding to account for the accent bar */}
          <h2 className="text-xl font-bold mb-4 text-[#004080]">Module Information</h2>
          <p className="text-gray-600 mb-4">{module.description}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-gray-600"><strong>Academic Year:</strong> {module.academicYear}</p>
            </div>
            <div>
              <p className="text-gray-600"><strong>Level:</strong> {module.level?.toUpperCase()}</p>
            </div>
            <div>
              <p className="text-gray-600"><strong>Teacher:</strong> {module.teacher ? `${module.teacher.firstName} ${module.teacher.lastName}` : 'Not assigned'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
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
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'chapters' && (
          <>
            <h2 className="text-xl font-bold text-[#004080]">Chapters</h2>
            {module.chapters && module.chapters.length > 0 ? (
              <div className="space-y-6">
                {module.chapters.map((chapter, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center mb-4 pb-2 border-b border-gray-200">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#6dcffb]/20 text-[#01427a] mr-2">{index + 1}</span>
                      <h3 className="text-lg font-bold text-[#01427a] m-0">Chapter {index + 1}: {chapter.title}</h3>
                    </div>
                    {chapter.content && <p className="text-gray-600 mb-4">{chapter.content}</p>}

                    {chapter.files && chapter.files.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm mb-2">Files:</h4>
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
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No chapters have been added to this module yet.</p>
            )}
          </>
        )}

        {activeTab === 'syllabus' && (
          <>
            <h2 className="text-xl font-bold text-[#004080]">Syllabus</h2>
            {module.syllabus && (module.syllabus.content || (module.syllabus.files && module.syllabus.files.length > 0)) ? (
              <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                {module.syllabus.content && <p className="text-gray-600 mb-4">{module.syllabus.content}</p>}

                {module.syllabus.files && module.syllabus.files.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-2">Files:</h4>
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
              <p className="text-gray-500">No syllabus has been added to this module yet.</p>
            )}
          </>
        )}

        {activeTab === 'references' && (
          <>
            <h2 className="text-xl font-bold text-[#004080]">References</h2>
            {module.references && module.references.length > 0 ? (
              <div className="space-y-6">
                {module.references.map((reference, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center mb-4 pb-2 border-b border-gray-200">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#6dcffb]/20 text-[#01427a] mr-2">{index + 1}</span>
                      <h3 className="text-lg font-bold text-[#01427a] m-0">{reference.title}</h3>
                    </div>
                    {reference.description && <p className="text-gray-600 mb-4">{reference.description}</p>}

                    {reference.files && reference.files.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm mb-2">Files:</h4>
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
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No references have been added to this module yet.</p>
            )}
          </>
        )}
      </div>

      <div className="flex justify-between mt-8">
        <Link
          to={`/student/modules/${moduleId}/quizzes`}
          className="flex items-center justify-center bg-[#e14177] hover:bg-[#c73868] text-white py-2.5 px-4 rounded-md transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          View Quizzes
        </Link>
        <button
          onClick={() => navigate('/student/modules')}
          className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-md font-medium border border-gray-200"
        >
          Back to Modules
        </button>
      </div>

    </div>
  );
};

export default ModuleContent;
