import React, { useRef } from 'react';
import { Upload, Image as ImageIcon, ScanLine } from 'lucide-react';

interface ImageUploaderProps {
  onImagesSelected: (files: FileList) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImagesSelected }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
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

  return (
    <div 
      className="relative border border-dashed border-slate-700 bg-slate-900/30 rounded-xl p-10 transition-all duration-300 cursor-pointer group hover:border-cyan-500/50 hover:bg-slate-800/50 overflow-hidden"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      {/* Decorative Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:40px_40px] opacity-10 pointer-events-none" />
      
      <input 
        type="file" 
        multiple 
        accept="image/*" 
        className="hidden" 
        ref={inputRef} 
        onChange={handleChange}
      />
      
      <div className="relative z-10 flex flex-col items-center">
        <div className="w-20 h-20 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:border-cyan-500/50 group-hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] transition-all duration-300">
          <Upload className="w-8 h-8 text-slate-400 group-hover:text-cyan-400 transition-colors" />
        </div>
        
        <h3 className="text-xl font-medium text-slate-200 group-hover:text-white transition-colors">
          Initialize Data Stream
        </h3>
        <p className="text-slate-500 mt-2 text-sm font-light">
          Drop source files or click to browse system
        </p>
        
        <div className="mt-8 flex justify-center space-x-4">
          <div className="flex items-center text-[10px] text-slate-400 font-mono bg-slate-950/50 py-1.5 px-3 rounded border border-slate-800">
            <ScanLine className="w-3 h-3 mr-2 text-blue-500" />
            <span>MULTI_PAGE_SUPPORT</span>
          </div>
          <div className="flex items-center text-[10px] text-slate-400 font-mono bg-slate-950/50 py-1.5 px-3 rounded border border-slate-800">
            <ImageIcon className="w-3 h-3 mr-2 text-violet-500" />
            <span>JPG/PNG_READY</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageUploader;