import React from 'react';

const FilesList = ({ files = [], onDelete, chapterIndex }) => {
  console.log('FilesList component received files:', files);

  if (!files || files.length === 0) {
    return <p className="text-secondary italic">No files uploaded yet.</p>;
  }

  const getFileIcon = (fileType) => {
    // Normalize file type (could be extension or mime type)
    const type = fileType ? fileType.toLowerCase() : '';

    // PDF files
    if (type === 'pdf' || type.includes('pdf')) {
      return '📄';
    }

    // Image files
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'].includes(type) ||
        type.startsWith('image/')) {
      return '🖼️';
    }

    // Video files
    if (['mp4', 'webm', 'mov', 'avi', 'mkv', 'flv'].includes(type) ||
        type.startsWith('video/')) {
      return '🎬';
    }

    // Audio files
    if (['mp3', 'wav', 'ogg', 'aac'].includes(type) ||
        type.startsWith('audio/')) {
      return '🎵';
    }

    // Document files
    if (['doc', 'docx', 'txt', 'rtf'].includes(type) ||
        type.includes('document') || type.includes('text/')) {
      return '📝';
    }

    // Spreadsheet files
    if (['xls', 'xlsx', 'csv'].includes(type)) {
      return '📊';
    }

    // Presentation files
    if (['ppt', 'pptx'].includes(type)) {
      return '📑';
    }

    // Archive files
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(type)) {
      return '📦';
    }

    // Default for unknown types
    return '📁';
  };

  const getFileName = (file) => {
    // Use originalName if available, otherwise extract from path
    if (file.originalName) {
      return file.originalName;
    }

    // Extract filename from path as fallback
    const parts = file.path.split('/');
    return parts[parts.length - 1];
  };

  // Debug the files array
  console.log('Files in FilesList:', files.map(file => ({
    path: file.path,
    originalName: file.originalName,
    fileType: file.fileType
  })));

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return 'Unknown size';

    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  const getFileDate = (file) => {
    if (!file.uploadedAt) return '';

    try {
      const date = new Date(file.uploadedAt);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  return (
    <div className="mt-2">
      <h4 className="text-md font-medium mb-2 text-primary">Uploaded Files</h4>
      <p className="text-sm text-dark/70 mb-2">These files are saved with this chapter and will be available to students.</p>
      <ul className="space-y-2">
        {files.map((file, index) => (
          <li key={index} className="flex flex-col p-3 border border-secondary/20 rounded-md bg-white hover:bg-secondary/5 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="mr-2 text-xl">{getFileIcon(file.fileType)}</span>
                <a
                  href={file.path.startsWith('http') ? file.path : `http://localhost:5000${file.path}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-medium"
                  onClick={(e) => {
                    // Determine if the file can be viewed in browser
                    const viewableTypes = ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'mp4', 'webm', 'mov', 'mp3', 'wav', 'ogg'];
                    const fileExt = file.fileType || file.path.split('.').pop().toLowerCase();
                    const isViewable = viewableTypes.includes(fileExt);

                    // For local files, handle viewing or downloading
                    if (!file.path.startsWith('http')) {
                      const fileName = file.originalName || getFileName(file);
                      const baseUrl = `http://localhost:5000${file.path}`;

                      console.log(`Opening file: ${fileName} from ${file.path}`);
                      console.log(`File type: ${fileExt}, Viewable: ${isViewable}`);

                      // Let the browser handle viewable files directly
                      if (isViewable) {
                        // No need to prevent default - let the browser open it in a new tab
                        return;
                      } else {
                        // For non-viewable files, force download
                        e.preventDefault();

                        // Create a temporary link element with download attribute
                        const tempLink = document.createElement('a');
                        tempLink.href = `${baseUrl}?download=true`;
                        tempLink.setAttribute('download', fileName);
                        document.body.appendChild(tempLink);
                        tempLink.click();
                        document.body.removeChild(tempLink);
                      }
                    }
                  }}
                >
                  {getFileName(file)}
                </a>
              </div>

              {onDelete && (
                <button
                  onClick={() => onDelete(chapterIndex, index)}
                  className="text-danger hover:text-danger/80 transition-colors ml-2"
                  title="Delete file"
                >
                  ❌
                </button>
              )}
            </div>

            <div className="mt-1 text-xs text-secondary flex items-center justify-between">
              <div>
                <span className="mr-2">{formatFileSize(file.size)}</span>
                <span className="text-secondary/70">{file.fileType.toUpperCase()}</span>
              </div>
              {file.uploadedAt && (
                <span className="text-secondary/70">Uploaded: {getFileDate(file)}</span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FilesList;
