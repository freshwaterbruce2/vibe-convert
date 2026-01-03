import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, ScanLine } from 'lucide-react';

interface ImageUploaderProps {
  onImagesSelected: (files: FileList) => void;
  variant?: 'hero' | 'compact';
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImagesSelected, variant = 'hero' }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onImagesSelected(e.dataTransfer.files);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onImagesSelected(e.target.files);
    }
  };

  const isCompact = variant === 'compact';

  return (
    <div 
      className={`relative group rounded-lg transition-all duration-300 cursor-pointer overflow-hidden ${
        isDragOver ? 'bg-slate-900/60' : 'bg-slate-900/20'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      {/* Technical Border Container */}
      <div className={`absolute inset-0 border transition-colors duration-300 ${
        isDragOver ? 'border-cyan-500/50' : 'border-slate-800'
      }`}></div>

      {/* HUD Corners */}
      <div className={`absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 transition-all duration-300 ${isDragOver ? 'border-cyan-400 w-8 h-8' : 'border-slate-600'}`}></div>
      <div className={`absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 transition-all duration-300 ${isDragOver ? 'border-cyan-400 w-8 h-8' : 'border-slate-600'}`}></div>
      <div className={`absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 transition-all duration-300 ${isDragOver ? 'border-cyan-400 w-8 h-8' : 'border-slate-600'}`}></div>
      <div className={`absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 transition-all duration-300 ${isDragOver ? 'border-cyan-400 w-8 h-8' : 'border-slate-600'}`}></div>

      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.05] pointer-events-none" />
      
      <input 
        type="file" 
        multiple 
        accept="image/*" 
        className="hidden" 
        ref={inputRef} 
        onChange={handleChange}
      />
      
      <div className={`relative z-10 flex flex-col items-center px-6 transition-all duration-500 ${isCompact ? 'py-8' : 'py-16'}`}>
        <div className={`rounded-full bg-slate-950 border flex items-center justify-center mb-4 transition-all duration-500 relative ${
            isDragOver 
            ? 'border-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.3)] scale-110' 
            : 'border-slate-700 shadow-inner group-hover:border-slate-600'
        } ${isCompact ? 'w-12 h-12' : 'w-20 h-20 mb-6'}`}>
          {/* Rotating Ring */}
          <div className={`absolute inset-0 rounded-full border border-dashed border-slate-600 transition-all duration-[10s] animate-[spin_10s_linear_infinite] opacity-30 ${isDragOver ? 'border-cyan-500 opacity-100' : ''}`}></div>
          
          <Upload className={`transition-colors ${isCompact ? 'w-5 h-5' : 'w-8 h-8'} ${isDragOver ? 'text-cyan-400' : 'text-slate-400'}`} />
        </div>
        
        <h3 className={`font-bold tracking-tight transition-colors ${isDragOver ? 'text-white' : 'text-slate-200'} ${isCompact ? 'text-lg' : 'text-xl'}`}>
          {isCompact ? 'Add More Pages' : 'Upload Documents'}
        </h3>
        <p className="text-slate-500 mt-2 text-sm font-mono max-w-sm text-center">
          {isCompact ? 'Drag & Drop or Click' : 'Drag & Drop files or Click to Browse'}
        </p>
        
        {!isCompact && (
          <div className="mt-8 flex justify-center space-x-3 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex items-center text-[10px] text-slate-400 font-mono bg-slate-950 px-2 py-1 rounded border border-slate-800">
              <ScanLine className="w-3 h-3 mr-1.5 text-cyan-500" />
              <span>OCR_READY</span>
            </div>
            <div className="flex items-center text-[10px] text-slate-400 font-mono bg-slate-950 px-2 py-1 rounded border border-slate-800">
              <ImageIcon className="w-3 h-3 mr-1.5 text-purple-500" />
              <span>IMG_PROCESSOR</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;