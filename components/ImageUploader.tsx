import React, { useRef } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';

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
      className="border-2 border-dashed border-gray-300 rounded-xl p-8 hover:border-blue-500 hover:bg-blue-50 transition-colors cursor-pointer group text-center"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input 
        type="file" 
        multiple 
        accept="image/*" 
        className="hidden" 
        ref={inputRef} 
        onChange={handleChange}
      />
      <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
        <Upload className="w-8 h-8 text-blue-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900">Click or drop photos here</h3>
      <p className="text-gray-500 mt-2 text-sm">Supports JPG, PNG (Max 10MB per file)</p>
      <div className="mt-6 flex justify-center space-x-4">
        <div className="flex items-center text-xs text-gray-400">
          <ImageIcon className="w-4 h-4 mr-1" />
          <span>Multi-page Support</span>
        </div>
      </div>
    </div>
  );
};

export default ImageUploader;