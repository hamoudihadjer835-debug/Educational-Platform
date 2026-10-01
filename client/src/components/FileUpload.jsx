import { useState } from 'react';
import { teacherAPI } from '../services/api';

const FileUpload = ({ lessonId, chapterIndex, onUploadSuccess, onUploadError }) => {
  const [files, setFiles] = useState([]);
  const [fileType, setFileType] = useState('pdf');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 0) {
      console.log('Selected files:', selectedFiles.map(f => ({ name: f.name, type: f.type, size: f.size })));

      // For testing purposes, accept all files
      setFiles(selectedFiles);
      setError('');

      /* Uncomment for production use:
      // Validate file types based on selection
      const invalidFiles = [];
      const validFiles = [];

      selectedFiles.forEach(selectedFile => {
        let isValidType = false;

        if (fileType === 'pdf' && selectedFile.type === 'application/pdf') {
          isValidType = true;
        } else if (fileType === 'video' && selectedFile.type.includes('video/')) {
          isValidType = true;
        } else if (fileType === 'document' && (
          selectedFile.type.includes('document') ||
          selectedFile.type.includes('text/') ||
          selectedFile.type.includes('application/vnd.ms-') ||
          selectedFile.type.includes('application/vnd.openxmlformats-')
        )) {
          isValidType = true;
        }

        if (isValidType) {
          validFiles.push(selectedFile);
        } else {
          invalidFiles.push(selectedFile.name);
        }
      });

      if (invalidFiles.length > 0) {
        setError(`Please select valid ${fileType} files. The following files are not valid: ${invalidFiles.join(', ')}`);
        if (validFiles.length === 0) {
          e.target.value = null; // Reset the file input if no valid files
          return;
        }
      }

      setFiles(validFiles);
      setError('');
      */
    }
  };

  const handleFileTypeChange = (e) => {
    setFileType(e.target.value);
    // Reset file selection when file type changes
    setFiles([]);
    setError('');
    // Reset the file input if it exists
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) {
      fileInput.value = null;
    }
  };

  const handleUpload = async () => {
    console.log('Uploading files for lesson:', lessonId, 'chapter index:', chapterIndex);

    if (!files.length) {
      setError('Please select at least one file to upload');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    console.log('Selected files for upload:', files.map(f => ({ name: f.name, type: f.type, size: f.size })));

    try {
      let successCount = 0;

      // Upload each file individually
      for (const file of files) {
        try {
          // Create FormData for file upload
          const formData = new FormData();
          formData.append('file', file);
          formData.append('fileType', fileType);

          console.log('Uploading file:', file.name, 'type:', fileType);
          const response = await teacherAPI.uploadChapterFile(lessonId, chapterIndex, formData);
          console.log('File upload response:', response);
          console.log('File upload response data:', response.data);

          // Call the success callback if provided
          if (onUploadSuccess) {
            console.log('Calling onUploadSuccess with data:', response.data.data);
            // Make sure the file object has all required fields
            const fileData = {
              ...response.data.data,
              file: {
                ...response.data.data.file,
                // Ensure originalName is included
                originalName: response.data.data.file.originalName || file.name,
                // Ensure path is correctly formatted
                path: response.data.data.file.path.startsWith('/') ? response.data.data.file.path : `/${response.data.data.file.path}`
              }
            };
            console.log('Enhanced file data:', fileData);
            onUploadSuccess(fileData);
          }

          successCount++;
        } catch (fileErr) {
          console.error('Error uploading file:', file.name, fileErr);
        }
      }

      if (successCount > 0) {
        setSuccess(`${successCount} file${successCount > 1 ? 's' : ''} uploaded successfully`);
        setFiles([]);

        // Reset the file input
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) {
          fileInput.value = null;
        }
      } else {
        throw new Error('Failed to upload any files');
      }
    } catch (err) {
      console.error('Error uploading files:', err);
      console.error('Error details:', err.response?.data);
      const errorMessage = err.response?.data?.message || err.message || 'Error uploading files';
      setError(errorMessage);

      // Call the error callback if provided
      if (onUploadError) {
        onUploadError(errorMessage);
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mt-4 p-4 border border-secondary/20 rounded-md bg-secondary/5">
      <h3 className="text-lg font-medium mb-2 text-primary">Upload Files</h3>
      <p className="text-sm text-dark/70 mb-1">You can select and upload multiple files at once. Files will be saved with the chapter.</p>
      <div className="flex flex-col space-y-1 mb-3">
        <p className="text-sm text-primary-600 font-medium">Important:</p>
        <ul className="text-xs text-dark/70 list-disc pl-5 space-y-1">
          <li><span className="font-medium">Click "Upload File" button</span> after selecting files to save them to the chapter.</li>
          <li>Maximum file size: <span className="font-medium">50 MB</span> per file.</li>
          <li>You can upload more files after clicking the upload button.</li>
        </ul>
      </div>

      {error && (
        <div className="bg-danger-100 text-danger-600 p-4 rounded-md mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-success-100 text-success-600 p-4 rounded-md mb-4">
          {success}
        </div>
      )}

      <div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1 text-dark">
            File Type
          </label>
          <select
            value={fileType}
            onChange={handleFileTypeChange}
            className="w-full p-2 border border-secondary/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="pdf">PDF</option>
            <option value="video">Video</option>
            <option value="document">Document</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="flex items-center text-sm font-medium mb-1 text-dark">
            <span>Select Files</span>
            <span className="ml-2 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">Multiple allowed</span>
          </label>
          <input
            type="file"
            onChange={handleFileChange}
            className="w-full p-2 border border-secondary/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30"
            accept={fileType === 'pdf' ? '.pdf' :
                   fileType === 'video' ? '.mp4,.mov,.avi' :
                   '.doc,.docx,.ppt,.pptx,.txt'}
            multiple
          />
          {files.length > 0 && (
            <div className="mt-2 text-sm text-success">
              {files.length} file{files.length !== 1 ? 's' : ''} selected
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleUpload}
          disabled={uploading || !files.length}
          className={`px-4 py-1.5 rounded-md shadow-sm ${
            uploading || !files.length
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-primary text-white hover:bg-primary/90 transition-colors'
          }`}
        >
          {uploading ? 'Uploading...' : files.length > 1 ? `Upload ${files.length} Files` : 'Upload File'}
        </button>
      </div>
    </div>
  );
};

export default FileUpload;
