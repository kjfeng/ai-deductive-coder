import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface DocumentUploadProps {
  onFileUpload: (file: File) => void;
  isProcessing: boolean;
  document: { name: string; totalPages: number } | null;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  onFileUpload,
  isProcessing,
  document
}) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileUpload(acceptedFiles[0]);
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    disabled: isProcessing
  });

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        📄 Upload Document
      </h2>
      
      {!document ? (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'}
            ${isProcessing ? 'cursor-not-allowed opacity-60' : 'hover:border-blue-400'}
          `}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-4">
            <div className="text-6xl">📁</div>
            {isDragActive ? (
              <p className="text-gray-600">Drop the PDF file here...</p>
            ) : (
              <div>
                <p className="text-gray-600 mb-2">Drag & drop a PDF file here, or click to select</p>
                <p className="text-sm text-gray-400">Only PDF files are supported</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex justify-between items-center p-4 border border-gray-200 rounded-lg bg-gray-50">
          <div className="flex items-center gap-4">
            <div className="text-4xl">📄</div>
            <div>
              <h3 className="font-semibold text-gray-800 text-lg">{document.name}</h3>
              <p className="text-gray-600 text-sm">{document.totalPages} pages</p>
            </div>
          </div>
          <button
            onClick={() => window.location.reload()}
            disabled={isProcessing}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
          >
            Change Document
          </button>
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;
