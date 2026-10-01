import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

// Set the worker source for PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PDFViewer = ({ pdfUrl }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Ensure the URL has a leading slash if needed
  const formattedUrl = pdfUrl.startsWith('/') ? pdfUrl : `/${pdfUrl}`;

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setLoading(false);
  }

  function onDocumentLoadError(error) {
    console.error('Error loading PDF:', error);
    setError(true);
    setLoading(false);
  }

  function changePage(offset) {
    setPageNumber(prevPageNumber => {
      const newPageNumber = prevPageNumber + offset;
      return Math.min(Math.max(1, newPageNumber), numPages);
    });
  }

  function previousPage() {
    changePage(-1);
  }

  function nextPage() {
    changePage(1);
  }

  return (
    <div className="pdf-viewer">
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#01427a]"></div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-md">
          <p>Error loading PDF. Please try downloading the file instead.</p>
          <a 
            href={formattedUrl} 
            download 
            className="mt-2 inline-block bg-[#01427a] hover:bg-[#6dcffb] hover:text-[#01427a] text-white px-4 py-2 rounded"
          >
            Download PDF
          </a>
        </div>
      )}

      <Document
        file={formattedUrl}
        onLoadSuccess={onDocumentLoadSuccess}
        onLoadError={onDocumentLoadError}
        loading={null}
      >
        <Page 
          pageNumber={pageNumber} 
          renderTextLayer={false}
          renderAnnotationLayer={false}
          className="border border-gray-200 shadow-md"
        />
      </Document>

      {!loading && !error && numPages > 0 && (
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={previousPage}
            disabled={pageNumber <= 1}
            className={`px-4 py-2 rounded ${pageNumber <= 1 ? 'bg-gray-300 text-gray-500' : 'bg-[#01427a] text-white hover:bg-[#6dcffb] hover:text-[#01427a]'}`}
          >
            Previous
          </button>
          
          <p className="text-center">
            Page {pageNumber} of {numPages}
          </p>
          
          <button
            onClick={nextPage}
            disabled={pageNumber >= numPages}
            className={`px-4 py-2 rounded ${pageNumber >= numPages ? 'bg-gray-300 text-gray-500' : 'bg-[#01427a] text-white hover:bg-[#6dcffb] hover:text-[#01427a]'}`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default PDFViewer;
