import React from 'react';
import { X, ArrowUp, ArrowDown } from 'lucide-react';
import { DocImage } from '../types';

interface DocumentListProps {
  images: DocImage[];
  onRemove: (id: string) => void;
  onMove: (index: number, direction: 'up' | 'down') => void;
}

const DocumentList: React.FC<DocumentListProps> = ({ images, onRemove, onMove }) => {
  if (images.length === 0) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">
      {images.map((img, index) => (
        <div key={img.id} className="relative group bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
          {/* Image Preview */}
          <div className="aspect-[3/4] relative bg-gray-100">
            <img 
              src={img.previewUrl} 
              alt={`Page ${index + 1}`} 
              className="w-full h-full object-cover"
            />
            {/* Page Number Badge */}
            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
              Page {index + 1}
            </div>
            {/* Remove Button */}
            <button 
              onClick={(e) => { e.stopPropagation(); onRemove(img.id); }}
              className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              title="Remove page"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Controls */}
          <div className="p-2 flex justify-between items-center bg-gray-50 border-t border-gray-100">
            <span className="text-xs font-medium text-gray-500 truncate max-w-[50%]">
              {img.file.name}
            </span>
            <div className="flex space-x-1">
              <button 
                onClick={() => onMove(index, 'up')}
                disabled={index === 0}
                className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed text-gray-600"
                title="Move up"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
              <button 
                onClick={() => onMove(index, 'down')}
                disabled={index === images.length - 1}
                className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed text-gray-600"
                title="Move down"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
      
      {/* Empty State / Add More Hint could go here if needed */}
    </div>
  );
};

export default DocumentList;