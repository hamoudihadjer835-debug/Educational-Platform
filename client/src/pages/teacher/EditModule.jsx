import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { teacherAPI } from '../../services/api.new';
import api from '../../services/api.new';
import { scrollToTop } from '../../utils/scrollUtils';

const EditModule = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();

  const [module, setModule] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [syllabus, setSyllabus] = useState({ content: '', files: [] });
  const [references, setReferences] = useState([]);

  // Track original data for cancellation
  const [originalData, setOriginalData] = useState(null);
  // Track newly uploaded files
  const [newlyUploadedFiles, setNewlyUploadedFiles] = useState({
    chapters: {}, // Map of chapterIndex -> array of file IDs
    syllabus: [], // Array of file IDs
    references: {} // Map of referenceIndex -> array of file IDs
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // File upload states
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadTarget, setUploadTarget] = useState({ type: '', index: -1 });
  const [fileToRename, setFileToRename] = useState(null);
  const [customFileName, setCustomFileName] = useState('');
  const [showRenameModal, setShowRenameModal] = useState(false);

  useEffect(() => {
    const fetchModuleDetails = async () => {
      try {
        setLoading(true);
        console.log('Fetching module details for ID:', moduleId);

        // Check if moduleId is valid
        if (!moduleId || moduleId.length !== 24) {
          setError(`Invalid module ID format: ${moduleId}`);
          setLoading(false);
          return;
        }

        const response = await teacherAPI.getModuleDetails(moduleId);
        console.log('Module details response:', response.data);

        // Handle different response structures
        let moduleData;
        if (response.data && response.data.data) {
          if (response.data.data.module) {
            // If the API returns { data: { module, lessons } }
            moduleData = response.data.data.module;
          } else {
            // If the API returns { data: module }
            moduleData = response.data.data;
          }
        } else {
          throw new Error('Invalid response format');
        }

        setModule(moduleData);

        // Set current data
        const currentChapters = moduleData.chapters || [];
        const currentSyllabus = moduleData.syllabus || { content: '', files: [] };
        const currentReferences = moduleData.references || [];

        setChapters(currentChapters);
        setSyllabus(currentSyllabus);
        setReferences(currentReferences);

        // Store original data for cancellation
        setOriginalData({
          chapters: JSON.parse(JSON.stringify(currentChapters)),
          syllabus: JSON.parse(JSON.stringify(currentSyllabus)),
          references: JSON.parse(JSON.stringify(currentReferences))
        });

        // Reset newly uploaded files tracking
        setNewlyUploadedFiles({
          chapters: {},
          syllabus: [],
          references: {}
        });

        setLoading(false);
      } catch (err) {
        console.error('Error fetching module details:', err);
        setError('Failed to load module details');
        setLoading(false);
      }
    };

    fetchModuleDetails();
  }, [moduleId]);

  // Scroll to the section specified in the URL hash when the component mounts
  useEffect(() => {
    if (!loading) {
      // Get the hash from the URL (e.g., #chapters, #syllabus, #references)
      const hash = window.location.hash;
      if (hash) {
        // Remove the # character
        const sectionId = hash.substring(1);
        // Find the element with the corresponding ID
        const element = document.getElementById(sectionId);
        if (element) {
          // Scroll to the element with a small delay to ensure the page is fully rendered
          setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }
      }
    }
  }, [loading]);

  const handleAddChapter = () => {
    setChapters([...chapters, { title: `Chapter ${chapters.length + 1}`, content: '', files: [] }]);
  };

  const handleRemoveChapter = (index) => {
    const updatedChapters = [...chapters];
    updatedChapters.splice(index, 1);
    setChapters(updatedChapters);
  };

  const handleChapterChange = (index, field, value) => {
    const updatedChapters = [...chapters];
    updatedChapters[index][field] = value;
    setChapters(updatedChapters);
  };

  const handleSyllabusChange = (value) => {
    setSyllabus({ ...syllabus, content: value });
  };

  const handleAddReference = () => {
    setReferences([...references, { title: `Reference ${references.length + 1}`, description: '', files: [] }]);
  };

  const handleRemoveReference = (index) => {
    const updatedReferences = [...references];
    updatedReferences.splice(index, 1);
    setReferences(updatedReferences);
  };

  const handleReferenceChange = (index, field, value) => {
    const updatedReferences = [...references];
    updatedReferences[index][field] = value;
    setReferences(updatedReferences);
  };

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      // Determine upload target from data attribute
      const targetElement = e.target;
      const targetData = targetElement.dataset.target || '';
      let targetType = '';
      let targetIndex = -1;

      if (targetData === 'syllabus') {
        targetType = 'syllabus';
        targetIndex = 0;
      } else if (targetData.startsWith('chapter-')) {
        targetType = 'chapter';
        targetIndex = parseInt(targetData.replace('chapter-', ''), 10);
      } else if (targetData.startsWith('reference-')) {
        targetType = 'reference';
        targetIndex = parseInt(targetData.replace('reference-', ''), 10);
      }

      // Set the upload target
      setUploadTarget({ type: targetType, index: targetIndex });
      console.log('Upload target:', { type: targetType, index: targetIndex });

      // If there's only one file, show the rename modal
      if (files.length === 1) {
        const file = files[0];
        setFileToRename({
          file,
          targetType,
          targetIndex,
          originalName: file.name
        });
        setCustomFileName(file.name.split('.')[0]); // Default to filename without extension
        setShowRenameModal(true);
        return; // Stop here and wait for modal interaction
      }

      // If multiple files, proceed with normal upload
      await uploadFiles(files, targetType, targetIndex);
    } catch (err) {
      console.error('Error preparing file upload:', err);
      setError('Failed to prepare file upload: ' + (err.message || 'Unknown error'));
      scrollToTop();
    } finally {
      // Reset the file input
      e.target.value = '';
    }
  };

  // Function to handle the actual file upload after rename modal
  const uploadFiles = async (files, targetType, targetIndex, customName = null) => {
    try {
      setUploadingFile(true);
      setError('');

      // Process each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);

        // Auto-detect file type based on extension
        let fileType = 'document';
        const fileName = file.name.toLowerCase();
        if (fileName.endsWith('.pdf')) {
          fileType = 'pdf';
        } else if (/\.(mp4|mov|avi|wmv|flv|mkv)$/i.test(fileName)) {
          fileType = 'video';
        }
        formData.append('fileType', fileType);

        // Add custom name if provided
        if (customName && i === 0) { // Only apply to the first file if multiple
          formData.append('customName', customName);
        }

        console.log('Uploading file:', {
          name: file.name,
          customName: customName || 'Not provided',
          size: file.size,
          type: fileType,
          target: targetType,
          index: targetIndex
        });

        let response;

        try {
          if (targetType === 'chapter') {
            // Use the helper function instead of direct API call
            response = await teacherAPI.uploadChapterFile(moduleId, targetIndex, formData);

            // Get the uploaded file
            const uploadedFile = response.data.data.file;

            // Track this file as newly uploaded
            setNewlyUploadedFiles(prev => {
              const updatedChapters = { ...prev.chapters };
              if (!updatedChapters[targetIndex]) {
                updatedChapters[targetIndex] = [];
              }
              updatedChapters[targetIndex] = [...updatedChapters[targetIndex], uploadedFile.path];
              return { ...prev, chapters: updatedChapters };
            });

            // Update the chapters state with the new file
            const updatedChapters = [...chapters];
            if (!updatedChapters[targetIndex].files) {
              updatedChapters[targetIndex].files = [];
            }
            updatedChapters[targetIndex].files.push(uploadedFile);
            setChapters(updatedChapters);
          }
          else if (targetType === 'syllabus') {
            // Use the helper function instead of direct API call
            response = await teacherAPI.uploadSyllabusFile(moduleId, formData);

            // Get the uploaded file
            const uploadedFile = response.data.data.file;

            // Track this file as newly uploaded
            setNewlyUploadedFiles(prev => {
              return {
                ...prev,
                syllabus: [...prev.syllabus, uploadedFile.path]
              };
            });

            // Update the syllabus state with the new file
            const updatedSyllabus = { ...syllabus };
            if (!updatedSyllabus.files) {
              updatedSyllabus.files = [];
            }
            updatedSyllabus.files.push(uploadedFile);
            setSyllabus(updatedSyllabus);
          }
          else if (targetType === 'reference') {
            // Use the helper function instead of direct API call
            response = await teacherAPI.uploadReferenceFile(moduleId, targetIndex, formData);

            // Get the uploaded file
            const uploadedFile = response.data.data.file;

            // Track this file as newly uploaded
            setNewlyUploadedFiles(prev => {
              const updatedReferences = { ...prev.references };
              if (!updatedReferences[targetIndex]) {
                updatedReferences[targetIndex] = [];
              }
              updatedReferences[targetIndex] = [...updatedReferences[targetIndex], uploadedFile.path];
              return { ...prev, references: updatedReferences };
            });

            // Update the references state with the new file
            const updatedReferences = [...references];
            if (!updatedReferences[targetIndex].files) {
              updatedReferences[targetIndex].files = [];
            }
            updatedReferences[targetIndex].files.push(uploadedFile);
            setReferences(updatedReferences);
          }
        } catch (uploadError) {
          console.error('Error in specific upload:', uploadError);
          console.error('Error details:', uploadError.response?.data || uploadError.message);
          throw uploadError; // Re-throw to be caught by the outer try/catch
        }
      }

      // No success message or scrolling for file uploads
    } catch (err) {
      console.error('Error uploading file:', err);
      setError('Failed to upload file: ' + (err.response?.data?.message || err.message));
      scrollToTop(); // Scroll to the error message
    } finally {
      setUploadingFile(false);
    }
  };

  // Handle file rename confirmation
  const handleRenameConfirm = () => {
    if (fileToRename) {
      const { file, targetType, targetIndex } = fileToRename;
      uploadFiles([file], targetType, targetIndex, customFileName);
      setShowRenameModal(false);
      setFileToRename(null);
      setCustomFileName('');
    }
  };

  // Handle file rename cancellation
  const handleRenameCancel = () => {
    setShowRenameModal(false);
    setFileToRename(null);
    setCustomFileName('');
  };

  const handleRemoveFile = (targetType, targetIndex, fileIndex) => {
    if (targetType === 'chapter') {
      const updatedChapters = [...chapters];
      // Store the file path before removing it
      const filePath = updatedChapters[targetIndex].files[fileIndex].path;
      // Remove the file from the array
      updatedChapters[targetIndex].files.splice(fileIndex, 1);
      setChapters(updatedChapters);

      // Save changes immediately to ensure the file is removed from the database
      handleSaveChanges();
    }
    else if (targetType === 'syllabus') {
      const updatedSyllabus = { ...syllabus };
      // Store the file path before removing it
      const filePath = updatedSyllabus.files[fileIndex].path;
      // Remove the file from the array
      updatedSyllabus.files.splice(fileIndex, 1);
      setSyllabus(updatedSyllabus);

      // Save changes immediately to ensure the file is removed from the database
      handleSaveChanges();
    }
    else if (targetType === 'reference') {
      const updatedReferences = [...references];
      // Store the file path before removing it
      const filePath = updatedReferences[targetIndex].files[fileIndex].path;
      // Remove the file from the array
      updatedReferences[targetIndex].files.splice(fileIndex, 1);
      setReferences(updatedReferences);

      // Save changes immediately to ensure the file is removed from the database
      handleSaveChanges();
    }
  };

  // Helper function to save changes after file removal
  const handleSaveChanges = async () => {
    try {
      // Update syllabus with content and files
      if (syllabus) {
        await teacherAPI.updateSyllabus(moduleId, {
          content: syllabus.content,
          files: syllabus.files
        });
      }

      // Update chapters if needed
      if (chapters && chapters.length > 0) {
        await teacherAPI.updateModuleChapters(moduleId, { chapters });
      }

      // Update references if needed
      if (references && references.length > 0) {
        for (let i = 0; i < references.length; i++) {
          const reference = references[i];
          if (reference._id) {
            await teacherAPI.updateReference(moduleId, i, {
              title: reference.title,
              description: reference.description
            });
          }
        }
      }
    } catch (err) {
      console.error('Error saving changes after file removal:', err);
      setError('Failed to remove file completely');
    }
  };

  const handleCancel = async () => {
    try {
      // Discard temporary files on the server
      if (Object.keys(newlyUploadedFiles.chapters).length > 0 ||
          newlyUploadedFiles.syllabus.length > 0 ||
          Object.keys(newlyUploadedFiles.references).length > 0) {

        await teacherAPI.discardTemporaryFiles(moduleId);

        // Reset newly uploaded files tracking
        setNewlyUploadedFiles({
          chapters: {},
          syllabus: [],
          references: {}
        });
      }

      // Restore original data
      if (originalData) {
        setChapters(JSON.parse(JSON.stringify(originalData.chapters)));
        setSyllabus(JSON.parse(JSON.stringify(originalData.syllabus)));
        setReferences(JSON.parse(JSON.stringify(originalData.references)));
      }

      // Navigate back to module details
      navigate(`/teacher/modules/${moduleId}`);
    } catch (err) {
      console.error('Error discarding temporary files:', err);
      // Still navigate away even if there's an error
      navigate(`/teacher/modules/${moduleId}`);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');

      // Update chapters
      await teacherAPI.updateModuleChapters(moduleId, { chapters });

      // Update syllabus with content and files
      await teacherAPI.updateSyllabus(moduleId, {
        content: syllabus.content,
        files: syllabus.files
      });

      // Update or add references
      for (let i = 0; i < references.length; i++) {
        const reference = references[i];
        if (reference._id) {
          // Update existing reference
          await teacherAPI.updateReference(moduleId, i, {
            title: reference.title,
            description: reference.description
          });
        } else {
          // Add new reference
          await teacherAPI.addReference(moduleId, {
            title: reference.title,
            description: reference.description
          });
        }
      }

      // Clear newly uploaded files tracking as they're now saved
      setNewlyUploadedFiles({
        chapters: {},
        syllabus: [],
        references: {}
      });

      setSuccess('Module updated successfully');
      scrollToTop(); // Scroll to the success message
      setTimeout(() => {
        navigate(`/teacher/modules/${moduleId}`);
      }, 2000);
    } catch (err) {
      console.error('Error saving module:', err);
      setError('Failed to save module');
      scrollToTop(); // Scroll to the error message
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error && !module) {
    return (
      <div className="space-y-8">
        <div className="bg-gradient-to-r from-[#004080] to-[#6dcffb] rounded-lg p-6 mb-8 shadow-md flex justify-between items-center">
          <h1 className="text-white text-2xl font-bold m-0">Edit Module</h1>
          <button
            onClick={() => navigate('/teacher/modules')}
            className="bg-white hover:bg-gray-50 text-[#004080] px-4 py-2 rounded-md font-medium"
          >
            Back to Modules
          </button>
        </div>

        <div className="bg-danger/10 text-danger p-4 rounded-md border border-danger/20 shadow-sm">
          <div className="flex items-center">
            <span className="material-icons-outlined mr-2">error_outline</span>
            {error}
          </div>
          <p className="mt-4">Please check the module ID in the URL and try again.</p>
          <button
            onClick={() => navigate('/teacher/modules')}
            className="mt-4 bg-[#004080] hover:bg-[#003366] text-white px-4 py-2 rounded-md font-medium"
          >
            Go to Modules List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* File Rename Modal */}
      {showRenameModal && fileToRename && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Rename File</h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Original filename:</p>
              <p className="text-gray-800 font-medium">{fileToRename.originalName}</p>
            </div>
            <div className="mb-6">
              <label htmlFor="customFileName" className="block text-sm font-medium text-gray-700 mb-1">
                Enter custom name:
              </label>
              <input
                type="text"
                id="customFileName"
                value={customFileName}
                onChange={(e) => setCustomFileName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter a custom name for this file"
              />
              <p className="text-xs text-gray-500 mt-1">
                The file extension will be preserved automatically.
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleRenameCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRenameConfirm}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
                disabled={!customFileName.trim()}
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-r from-[#004080] to-[#6dcffb] rounded-lg p-6 mb-8 shadow-md flex justify-between items-center">
        <h1 className="text-white text-2xl font-bold m-0">Edit Module</h1>
        <button
          onClick={() => navigate(`/teacher/modules/${moduleId}`)}
          className="bg-white hover:bg-gray-50 text-[#004080] px-4 py-2 rounded-md font-medium"
        >
          Back to Details
        </button>
      </div>

      {error && (
        <div className="bg-danger/10 text-danger p-4 rounded-md border border-danger/20 shadow-sm animate-fadeIn">
          <div className="flex items-center">
            <span className="material-icons-outlined mr-2">error_outline</span>
            {error}
          </div>
        </div>
      )}

      {success && (
        <div className="bg-success/10 text-success p-4 rounded-md border border-success/20 shadow-sm animate-fadeIn">
          <div className="flex items-center">
            <span className="material-icons-outlined mr-2">check_circle_outline</span>
            {success}
          </div>
        </div>
      )}

      <div className="card shadow-md border-[#004080]/20 hover:shadow-lg transition-shadow">
        <div className="flex items-center mb-4">
          <span className="material-icons-outlined text-[#004080] mr-2">info</span>
          <h2 className="text-xl font-bold text-[#004080]">Module Information</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-primary/5 p-4 rounded-lg">
          <div className="space-y-3">
            <div>
              <p className="text-sm text-secondary font-medium mb-1">Title</p>
              <p className="text-dark font-medium">{module?.title}</p>
            </div>
            <div>
              <p className="text-sm text-secondary font-medium mb-1">Academic Year</p>
              <p className="text-dark font-medium">{module?.academicYear}</p>
            </div>
            <div>
              <p className="text-sm text-secondary font-medium mb-1">Description</p>
              <p className="text-dark">{module?.description}</p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-secondary font-medium mb-1">Level</p>
              <p className="text-dark font-medium">{module?.level?.toUpperCase()}</p>
            </div>
            <div>
              <p className="text-sm text-secondary font-medium mb-1">Semester</p>
              <p className="text-dark font-medium">{module?.semester}</p>
            </div>
            <div className="mt-4">
              <span className="badge badge-primary">{module?.academicYear}</span>
              <span className="badge badge-secondary ml-2">{module?.level?.toUpperCase()}</span>
              <span className="badge badge-accent ml-2">Semester {module?.semester}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chapters Section */}
      <div id="chapters" className="card shadow-md border-[#004080]/20 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <span className="material-icons-outlined text-[#004080] mr-2"></span>
            <h2 className="text-xl font-bold text-[#004080]">Chapters</h2>
          </div>
          <button
            type="button"
            onClick={handleAddChapter}
            className="bg-[#004080] hover:bg-[#003366] text-white px-4 py-1.5 rounded-md font-medium flex items-center"
          >
            <i className="material-icons-outlined mr-1 text-sm">add</i>
            Chapter
          </button>
        </div>

        {chapters.length === 0 ? (
          <div className="text-center py-12 bg-secondary/5 rounded-lg border border-secondary/10 flex flex-col items-center">
            <span className="material-icons-outlined text-4xl text-secondary/40 mb-3"></span>
            <p className="text-dark/60">No chapters added yet. Click "Add Chapter" to create your first chapter.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {chapters.map((chapter, index) => (
              <div key={index} className="border border-secondary/20 rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-secondary/10">
                  <div className="flex items-center">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary/10 text-secondary mr-2">{index + 1}</span>
                    <h3 className="text-lg font-bold text-dark">Chapter {index + 1}</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveChapter(index)}
                    className="text-danger hover:text-danger-dark text-lg font-bold flex items-center"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="form-label text-secondary">Title</label>
                    <input
                      type="text"
                      value={chapter.title}
                      onChange={(e) => handleChapterChange(index, 'title', e.target.value)}
                      className="form-input w-full focus:border-secondary focus:ring-secondary/30"
                      placeholder="Enter chapter title"
                    />
                  </div>

                  <div>
                    <label className="form-label text-secondary">Content</label>
                    <textarea
                      value={chapter.content}
                      onChange={(e) => handleChapterChange(index, 'content', e.target.value)}
                      className="form-input w-full h-32 focus:border-secondary focus:ring-secondary/30"
                      placeholder="Enter chapter content or description"
                    ></textarea>
                  </div>

                  <div className="bg-secondary/5 p-4 rounded-lg border border-secondary/10">
                    <div className="flex items-center mb-3">
                      <svg className="w-5 h-5 text-[#004080] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                      <label className="form-label text-[#004080] m-0">Chapter Files</label>
                    </div>

                    {/* File list */}
                    {chapter.files && chapter.files.length > 0 ? (
                      <ul className="mb-4 space-y-2 max-h-60 overflow-y-auto pr-2">
                        {chapter.files.map((file, fileIndex) => (
                          <li key={fileIndex} className="flex items-center justify-between bg-white p-3 rounded-md shadow-sm border border-secondary/10 hover:shadow-md transition-shadow">
                            <a
                              href={file.path}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline flex items-center"
                            >
                              <span className="mr-2 text-lg">
                                {file.fileType === 'pdf' ? '📄' :
                                 file.fileType === 'video' ? '🎬' : '📝'}
                              </span>
                              <span className="truncate max-w-xs">{file.originalName || 'File'}</span>
                            </a>
                            <button
                              type="button"
                              onClick={() => handleRemoveFile('chapter', index, fileIndex)}
                              className="text-danger hover:text-danger-dark text-lg font-bold flex items-center ml-2"
                            >
                              ×
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="flex items-center justify-center bg-white p-6 rounded-md border border-dashed border-secondary/30 mb-4">
                        <p className="text-dark/60 m-0">No files uploaded yet.</p>
                      </div>
                    )}

                    {/* File upload */}
                    <div className="bg-white p-4 rounded-md border border-secondary/20 shadow-sm">
                      <div className="flex flex-col space-y-3">
                        <div className="flex items-center space-x-3">
                          <div className="relative flex-1">
                            <input
                              type="file"
                              onChange={handleFileUpload}
                              disabled={uploadingFile}
                              className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                              multiple
                              accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.mp4,.mov,.avi"
                              data-target={`chapter-${index}`}
                            />
                            <div className="form-input flex items-center justify-between text-dark/60 cursor-pointer">
                              <span>Choose files to upload</span>
                              <span className="material-icons-outlined">file_upload</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => document.querySelector(`input[type="file"][data-target="chapter-${index}"]`)?.click()}
                            disabled={uploadingFile}
                            className="bg-[#004080] hover:bg-[#003366] text-white px-4 py-1.5 rounded-md font-medium min-w-[100px]"
                          >
                            {uploadingFile && uploadTarget.type === 'chapter' && uploadTarget.index === index ?
                              <span className="flex items-center">
                                <span className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></span>
                                Uploading
                              </span> : 'Upload'}
                          </button>
                        </div>
                        <div className="bg-secondary/5 p-2 rounded text-xs text-dark/60">
                          <div>
                            <strong>Upload conditions:</strong> Maximum file size: 50MB.<br/>
                            Supported formats: PDF, Office documents, videos (MP4, MOV, AVI).<br/>
                            Select multiple files to upload them at once.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Syllabus Section */}
      <div id="syllabus" className="card shadow-md border-[#004080]/20 hover:shadow-lg transition-shadow">
        <div className="flex items-center mb-6">
          <span className="material-icons-outlined text-[#004080] mr-2"></span>
          <h2 className="text-xl font-bold text-[#004080]">Syllabus</h2>
        </div>

        <div className="space-y-6">
          <div>
            <label className="form-label text-primary">Content</label>
            <textarea
              value={syllabus.content}
              onChange={(e) => handleSyllabusChange(e.target.value)}
              className="form-input w-full h-32 focus:border-primary focus:ring-primary/30"
              placeholder="Enter syllabus content or description"
            ></textarea>
          </div>

          <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
            <div className="flex items-center mb-3">
              <svg className="w-5 h-5 text-[#004080] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
              <label className="form-label text-[#004080] m-0">Syllabus Files</label>
            </div>

            {/* File list */}
            {syllabus.files && syllabus.files.length > 0 ? (
              <ul className="mb-4 space-y-2 max-h-60 overflow-y-auto pr-2">
                {syllabus.files.map((file, fileIndex) => (
                  <li key={fileIndex} className="flex items-center justify-between bg-white p-3 rounded-md shadow-sm border border-primary/10 hover:shadow-md transition-shadow">
                    <a
                      href={file.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center"
                    >
                      <span className="mr-2 text-lg">
                        {file.fileType === 'pdf' ? '📄' :
                         file.fileType === 'video' ? '🎬' : '📝'}
                      </span>
                      <span className="truncate max-w-xs">{file.originalName || 'File'}</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile('syllabus', 0, fileIndex)}
                      className="text-danger hover:text-danger-dark text-lg font-bold flex items-center ml-2"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex items-center justify-center bg-white p-6 rounded-md border border-dashed border-primary/30 mb-4">
                <p className="text-dark/60 m-0">No files uploaded yet.</p>
              </div>
            )}

            {/* File upload */}
            <div className="bg-white p-4 rounded-md border border-primary/20 shadow-sm">
              <div className="flex flex-col space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="relative flex-1">
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      disabled={uploadingFile}
                      className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                      multiple
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.mp4,.mov,.avi"
                      data-target="syllabus"
                    />
                    <div className="form-input flex items-center justify-between text-dark/60 cursor-pointer">
                      <span>Choose files to upload</span>
                      <span className="material-icons-outlined">file_upload</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => document.querySelector('input[data-target="syllabus"]')?.click()}
                    disabled={uploadingFile}
                    className="bg-[#004080] hover:bg-[#003366] text-white px-4 py-1.5 rounded-md font-medium min-w-[100px]"
                  >
                    {uploadingFile && uploadTarget.type === 'syllabus' ?
                      <span className="flex items-center">
                        <span className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></span>
                        Uploading
                      </span> : 'Upload'}
                  </button>
                </div>
                <div className="bg-primary/5 p-2 rounded text-xs text-dark/60">
                  <div>
                    <strong>Upload conditions:</strong> Maximum file size: 50MB.<br/>
                    Supported formats: PDF, Office documents, videos (MP4, MOV, AVI).<br/>
                    Select multiple files to upload them at once.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* References Section */}
      <div id="references" className="card shadow-md border-[#004080]/20 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <span className="material-icons-outlined text-[#004080] mr-2"></span>
            <h2 className="text-xl font-bold text-[#004080]">References</h2>
          </div>
          <button
            type="button"
            onClick={handleAddReference}
            className="bg-[#e14177] hover:bg-[#c73868] text-white px-4 py-1.5 rounded-md font-medium flex items-center"
          >
            <i className="material-icons-outlined mr-1 text-sm">add</i>
            Reference
          </button>
        </div>

        {references.length === 0 ? (
          <div className="text-center py-12 bg-accent/5 rounded-lg border border-accent/10 flex flex-col items-center">
            <span className="material-icons-outlined text-4xl text-accent/40 mb-3"></span>
            <p className="text-dark/60">No references added yet. Click "Add Reference" to create your first reference.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {references.map((reference, index) => (
              <div key={index} className="border border-accent/20 rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-accent/10">
                  <div className="flex items-center">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-accent/10 text-accent mr-2">{index + 1}</span>
                    <h3 className="text-lg font-bold text-dark">Reference {index + 1}</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveReference(index)}
                    className="text-danger hover:text-danger-dark text-lg font-bold flex items-center"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="form-label text-accent">Title</label>
                    <input
                      type="text"
                      value={reference.title}
                      onChange={(e) => handleReferenceChange(index, 'title', e.target.value)}
                      className="form-input w-full focus:border-accent focus:ring-accent/30"
                      placeholder="Enter reference title"
                    />
                  </div>

                  <div>
                    <label className="form-label text-accent">Description</label>
                    <textarea
                      value={reference.description}
                      onChange={(e) => handleReferenceChange(index, 'description', e.target.value)}
                      className="form-input w-full h-32 focus:border-accent focus:ring-accent/30"
                      placeholder="Enter reference description"
                    ></textarea>
                  </div>

                  <div className="bg-accent/5 p-4 rounded-lg border border-accent/10">
                    <div className="flex items-center mb-3">
                      <svg className="w-5 h-5 text-[#004080] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                      <label className="form-label text-[#004080] m-0">Reference Files</label>
                    </div>

                    {/* File list */}
                    {reference.files && reference.files.length > 0 ? (
                      <ul className="mb-4 space-y-2 max-h-60 overflow-y-auto pr-2">
                        {reference.files.map((file, fileIndex) => (
                          <li key={fileIndex} className="flex items-center justify-between bg-white p-3 rounded-md shadow-sm border border-accent/10 hover:shadow-md transition-shadow">
                            <a
                              href={file.path}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline flex items-center"
                            >
                              <span className="mr-2 text-lg">
                                {file.fileType === 'pdf' ? '📄' :
                                 file.fileType === 'video' ? '🎬' : '📝'}
                              </span>
                              <span className="truncate max-w-xs">{file.originalName || 'File'}</span>
                            </a>
                            <button
                              type="button"
                              onClick={() => handleRemoveFile('reference', index, fileIndex)}
                              className="text-danger hover:text-danger-dark text-lg font-bold flex items-center ml-2"
                            >
                              ×
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="flex items-center justify-center bg-white p-6 rounded-md border border-dashed border-accent/30 mb-4">
                        <p className="text-dark/60 m-0">No files uploaded yet.</p>
                      </div>
                    )}

                    {/* File upload */}
                    <div className="bg-white p-4 rounded-md border border-accent/20 shadow-sm">
                      <div className="flex flex-col space-y-3">
                        <div className="flex items-center space-x-3">
                          <div className="relative flex-1">
                            <input
                              type="file"
                              onChange={handleFileUpload}
                              disabled={uploadingFile}
                              className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                              multiple
                              accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.mp4,.mov,.avi"
                              data-target={`reference-${index}`}
                            />
                            <div className="form-input flex items-center justify-between text-dark/60 cursor-pointer">
                              <span>Choose files to upload</span>
                              <span className="material-icons-outlined">file_upload</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => document.querySelector(`input[data-target="reference-${index}"]`)?.click()}
                            disabled={uploadingFile}
                            className="bg-[#004080] hover:bg-[#003366] text-white px-4 py-1.5 rounded-md font-medium min-w-[100px]"
                          >
                            {uploadingFile && uploadTarget.type === 'reference' && uploadTarget.index === index ?
                              <span className="flex items-center">
                                <span className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></span>
                                Uploading
                              </span> : 'Upload'}
                          </button>
                        </div>
                        <div className="bg-accent/5 p-2 rounded text-xs text-dark/60">
                          <div>
                            <strong>Upload conditions:</strong> Maximum file size: 50MB.<br/>
                            Supported formats: PDF, Office documents, videos (MP4, MOV, AVI).<br/>
                            Select multiple files to upload them at once.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="sticky bottom-0 bg-white p-4 border-t border-gray-200 shadow-md mt-8 -mx-8 px-8 flex justify-end space-x-4">
        <button
          type="button"
          onClick={handleCancel}
          className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-1.5 rounded-md font-medium border border-gray-200"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="bg-[#004080] hover:bg-[#003366] text-white px-4 py-1.5 rounded-md font-medium min-w-[150px]"
        >
          {saving ?
            <span className="flex items-center justify-center">
              <span className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></span>
              Saving...
            </span> :
            <span className="flex items-center justify-center">
              Save
            </span>
          }
        </button>
      </div>
    </div>
  );
};

export default EditModule;
