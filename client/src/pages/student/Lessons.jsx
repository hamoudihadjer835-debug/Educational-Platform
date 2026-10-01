import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { studentAPI } from '../../services/api';

const Lessons = () => {
  const { moduleId } = useParams();
  const [module, setModule] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloadingLessonId, setDownloadingLessonId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch module details
        const enrolledResponse = await studentAPI.getEnrolledModules();
        const moduleData = enrolledResponse.data.data.find(m => m._id === moduleId);
        setModule(moduleData);

        if (!moduleData) {
          setError('Module not found or you are not enrolled in this module');
          setLoading(false);
          return;
        }

        // Fetch lessons for this module
        const lessonsResponse = await studentAPI.getModuleLessons(moduleId);
        setLessons(lessonsResponse.data.data);
      } catch (err) {
        console.error('Error fetching lessons:', err);
        setError('Failed to load lessons');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [moduleId]);

  const handleDownload = async (lessonId) => {
    try {
      setDownloadingLessonId(lessonId);

      const response = await studentAPI.downloadLesson(lessonId);

      // Get the lesson to determine the file name
      const lesson = lessons.find(l => l._id === lessonId);

      // Create a blob from the response data
      const blob = new Blob([response.data]);

      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);

      // Create a temporary link element
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${lesson.title}.${lesson.fileType}`);

      // Append the link to the body
      document.body.appendChild(link);

      // Click the link to trigger the download
      link.click();

      // Clean up
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading lesson:', err);
      setError('Failed to download lesson');
      setTimeout(() => setError(''), 3000);
    } finally {
      setDownloadingLessonId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1>Module Lessons</h1>
          <Link to="/student/modules" className="btn bg-gray-200 hover:bg-gray-300 text-gray-800">
            Back to Modules
          </Link>
        </div>

        <div className="bg-danger/10 text-danger p-4 rounded-md">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1>Module Lessons</h1>
        <Link to="/student/modules" className="btn bg-gray-200 hover:bg-gray-300 text-gray-800">
          Back to Modules
        </Link>
      </div>

      {/* Module Info */}
      <div className="card bg-gradient-to-r from-primary/10 to-secondary/10">
        <h2 className="text-2xl font-bold mb-2">{module.title}</h2>
        <p className="text-gray-600 mb-4">{module.description}</p>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Academic Year: {module.academicYear}</span>
          <span>Teacher: {module.teacher ? `${module.teacher.firstName} ${module.teacher.lastName}` : 'Not assigned'}</span>
        </div>
      </div>

      {/* Lessons */}
      <div>
        <h3 className="text-xl font-bold mb-4">Available Lessons</h3>

        {lessons.length === 0 ? (
          <div className="card bg-gray-50 text-center py-8">
            <p className="text-gray-500">No lessons available for this module yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {lessons.map(lesson => (
              <div key={lesson._id} className="card hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-lg font-bold mb-1">{lesson.title}</h4>
                    <p className="text-gray-600 mb-4">{lesson.description}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <span className={`px-2 py-1 rounded-full mr-2 ${
                        lesson.fileType === 'pdf' ? 'bg-red-100 text-red-800' :
                        lesson.fileType === 'video' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {lesson.fileType}
                      </span>
                      <span>Created by: {lesson.createdBy?.name || 'Teacher'}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownload(lesson._id)}
                    disabled={downloadingLessonId === lesson._id}
                    className="btn btn-primary"
                  >
                    {downloadingLessonId === lesson._id ? 'Downloading...' : 'Download'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Lessons;
