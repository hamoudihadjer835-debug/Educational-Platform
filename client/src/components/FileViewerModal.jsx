import React, { useState } from 'react';
import PDFViewer from './PDFViewer';

const FileViewerModal = ({ file, onClose }) => {
  if (!file) return null;

  const [viewMode, setViewMode] = useState('preview'); // 'preview' or 'download'

  // Ensure the file path is properly formatted
  const filePath = file.path.startsWith('/') ? file.path : `/${file.path}`;

  // Get file type from extension if not provided
  let fileType = file.fileType?.toLowerCase();
  if (!fileType && file.path) {
    const parts = file.path.split('.');
    if (parts.length > 1) {
      fileType = parts[parts.length - 1].toLowerCase();
    }
  }

  const fileName = file.originalName || 'File';

  // Expanded list of previewable file types
  const isPreviewable = [
    'pdf', 'jpg', 'jpeg', 'png', 'gif', 'mp4', 'webm', 'mov', 'mp3', 'wav', 'ogg'
  ].includes(fileType);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold text-[#01427a] truncate">{fileName}</h3>
          <div className="flex items-center">
            {isPreviewable && (
              <div className="mr-4 flex border rounded overflow-hidden">
                <button
                  onClick={() => setViewMode('preview')}
                  className={`px-3 py-1 text-sm ${viewMode === 'preview' ? 'bg-[#01427a] text-white' : 'bg-gray-100 text-gray-700'}`}
                >
                  Preview
                </button>
                <button
                  onClick={() => setViewMode('download')}
                  className={`px-3 py-1 text-sm ${viewMode === 'download' ? 'bg-[#01427a] text-white' : 'bg-gray-100 text-gray-700'}`}
                >
                  Download
                </button>
              </div>
            )}
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-4 overflow-auto flex-grow">
          {/* Preview Mode */}
          {viewMode === 'preview' && isPreviewable && (
            <>
              {fileType === 'pdf' ? (
                <PDFViewer pdfUrl={filePath} />
              ) : ['jpg', 'jpeg', 'png', 'gif'].includes(fileType) ? (
                <div className="flex justify-center items-center h-full">
                  <img
                    src={filePath}
                    alt={fileName}
                    className="max-w-full max-h-[70vh] object-contain"
                  />
                </div>
              ) : ['mp4', 'webm', 'mov'].includes(fileType) ? (
                <div className="flex justify-center items-center h-full">
                  <video
                    controls
                    className="max-w-full max-h-[70vh]"
                    autoPlay
                  >
                    <source src={filePath} type={`video/${fileType === 'mov' ? 'mp4' : fileType}`} />
                    Your browser does not support the video tag.
                  </video>
                </div>
              ) : ['mp3', 'wav', 'ogg'].includes(fileType) ? (
                <div className="flex justify-center items-center h-full flex-col">
                  <div className="text-6xl mb-4">🎵</div>
                  <p className="mb-4 text-center">{fileName}</p>
                  <audio controls className="w-full max-w-md" autoPlay>
                    <source src={filePath} type={`audio/${fileType}`} />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">This file type cannot be previewed in the browser.</p>
                  <p className="text-gray-500 mb-6">Click the download button below to view the file.</p>
                </div>
              )}
            </>
          )}

          {/* Download Mode or Non-Previewable Files */}
          {(viewMode === 'download' || !isPreviewable) && (
            <div className="flex flex-col items-center justify-center py-10">
              <div className="text-6xl mb-6">
                {fileType === 'pdf' ? '📄' :
                 ['jpg', 'jpeg', 'png', 'gif'].includes(fileType) ? '🖼️' :
                 ['mp4', 'webm', 'mov'].includes(fileType) ? '🎬' :
                 ['mp3', 'wav', 'ogg'].includes(fileType) ? '🎵' :
                 ['doc', 'docx'].includes(fileType) ? '📝' :
                 ['xls', 'xlsx'].includes(fileType) ? '📊' :
                 ['ppt', 'pptx'].includes(fileType) ? '📑' :
                 ['zip', 'rar'].includes(fileType) ? '📦' : '📁'}
              </div>
              <h3 className="text-xl font-medium mb-2 text-center">{fileName}</h3>
              <p className="text-gray-500 mb-6 text-center">
                {fileType ? fileType.toUpperCase() : 'Unknown'} File
                {file.size ? ` • ${(file.size / 1024 / 1024).toFixed(2)} MB` : ''}
              </p>
              <a
                href={`${filePath}?download=true`}
                className="bg-[#01427a] hover:bg-[#6dcffb] hover:text-[#01427a] text-white px-6 py-3 rounded-md font-medium flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download File
              </a>
            </div>
          )}
        </div>

        <div className="p-4 border-t flex justify-end">
          {viewMode === 'preview' && isPreviewable && (
            <a
              href={`${filePath}?download=true`}
              className="bg-[#01427a] hover:bg-[#6dcffb] hover:text-[#01427a] text-white px-4 py-2 rounded mr-2"
            >
              Download
            </a>
          )}
          <button
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileViewerModal;
