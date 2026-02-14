
import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, Check, FileType, X } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  currentFile: File | null;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, currentFile }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'complete'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Reset state if currentFile is removed externally
    if (!currentFile) {
      setProgress(0);
      setUploadStatus('idle');
    }
  }, [currentFile]);

  const simulateUpload = (file: File) => {
    setUploadStatus('uploading');
    setProgress(0);
    
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploadStatus('complete');
          onFileSelect(file);
          return 100;
        }
        return prev + 10;
      });
    }, 100); // Fast simulation
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      simulateUpload(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      simulateUpload(e.target.files[0]);
    }
  };

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileSelect(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (currentFile && uploadStatus === 'complete') {
    return (
      <div className="w-full h-64 border-2 border-green-200 bg-green-50 rounded-xl flex flex-col items-center justify-center p-6 relative">
        <button 
          onClick={removeFile}
          className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-sm hover:bg-red-50 hover:text-red-500 transition-colors"
        >
          <X size={20} />
        </button>
        <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4">
          <Check size={32} />
        </div>
        <h4 className="font-bold text-slate-800 text-lg mb-1">Upload Successful</h4>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-green-100 shadow-sm mt-2">
           <FileType size={16} className="text-green-600"/>
           <span className="text-slate-600 font-medium truncate max-w-[200px]">{currentFile.name}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => fileInputRef.current?.click()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`w-full h-64 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-6 cursor-pointer transition-all duration-200 ${
        isDragging 
          ? 'border-teal-500 bg-teal-50 scale-[1.02]' 
          : 'border-slate-300 hover:border-teal-400 hover:bg-slate-50'
      }`}
    >
      <input 
        type="file" 
        className="hidden" 
        ref={fileInputRef}
        onChange={handleFileInput}
      />
      
      {uploadStatus === 'uploading' ? (
        <div className="w-full max-w-xs text-center">
           <div className="mb-2 flex justify-between text-xs font-semibold text-teal-600">
             <span>Uploading...</span>
             <span>{progress}%</span>
           </div>
           <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
             <div 
               className="h-full bg-teal-600 transition-all duration-300 ease-out"
               style={{ width: `${progress}%` }}
             ></div>
           </div>
        </div>
      ) : (
        <>
          <div className="h-16 w-16 bg-teal-50 rounded-full flex items-center justify-center text-teal-600 mb-4 pointer-events-none">
            <UploadCloud size={32} />
          </div>
          <p className="text-lg font-semibold text-slate-700 pointer-events-none">
            Click to upload or drag and drop
          </p>
          <p className="text-sm text-slate-400 mt-2 pointer-events-none">
            PDF, PNG, JPG or AI (max 25MB)
          </p>
        </>
      )}
    </div>
  );
};
