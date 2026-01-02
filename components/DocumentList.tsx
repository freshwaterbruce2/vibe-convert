import React from 'react';
import { X, ArrowUp, ArrowDown, FileImage, CheckCircle2, Circle } from 'lucide-react';
import { DocImage } from '../types';

interface DocumentListProps {
  images: DocImage[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onMove: (index: number, direction: 'up' | 'down') => void;
}

const DocumentList: React.FC<DocumentListProps> = ({ images, selectedIds, onToggleSelect, onRemove, onMove }) => {
  if (images.length === 0) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mt-8">
      {images.map((img, index) => {
        const isSelected = selectedIds.has(img.id);
        
        return (
          <div 
            key={img.id} 
            onClick={() => onToggleSelect(img.id)}
            className={`relative group bg-slate-900 rounded-lg border overflow-hidden transition-all duration-300 cursor-pointer ${
              isSelected 
                ? 'border-cyan-500 ring-1 ring-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.15)]' 
                : 'border-slate-800 hover:border-cyan-500/30'
            }`}
          >
            
            {/* Top Bar Decoration */}
            <div className={`absolute top-0 left-0 w-full h-0.5 transition-opacity ${isSelected ? 'bg-cyan-500 opacity-100' : 'bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-0 group-hover:opacity-100'}`} />

            {/* Image Preview */}
            <div className="aspect-[3/4] relative bg-slate-950">
              <img 
                src={img.previewUrl} 
                alt={`Page ${index + 1}`} 
                className={`w-full h-full object-cover transition-all duration-300 ${isSelected ? 'opacity-90' : 'opacity-70 group-hover:opacity-100'}`}
              />
              
              {/* Selection Checkbox (Top Left) */}
              <div className="absolute top-2 left-2 z-10">
                {isSelected ? (
                   <div className="bg-cyan-500 text-slate-950 rounded-full p-0.5 shadow-lg">
                     <CheckCircle2 className="w-5 h-5 fill-cyan-500 text-white" />
                   </div>
                ) : (
                   <div className="bg-slate-950/50 text-slate-400 rounded-full p-0.5 border border-slate-600 opacity-60 group-hover:opacity-100 transition-opacity">
                     <Circle className="w-5 h-5" />
                   </div>
                )}
              </div>

              {/* Page Number Badge (Bottom Left now) */}
              <div className="absolute bottom-2 left-2 bg-slate-950/80 backdrop-blur text-cyan-400 text-[10px] font-mono border border-slate-800 px-2 py-0.5 rounded">
                #{String(index + 1).padStart(2, '0')}
              </div>

              {/* Remove Button */}
              <button 
                onClick={(e) => { e.stopPropagation(); onRemove(img.id); }}
                className="absolute top-2 right-2 p-1.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded hover:bg-red-500 hover:text-white hover:border-red-500 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                title="Remove page"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Controls */}
            <div className="p-3 bg-slate-900 border-t border-slate-800">
              <div className="flex items-center mb-2">
                <FileImage className={`w-3 h-3 mr-1.5 transition-colors ${isSelected ? 'text-cyan-500' : 'text-slate-500'}`} />
                <span className={`text-[10px] font-mono truncate w-full transition-colors ${isSelected ? 'text-cyan-100' : 'text-slate-400'}`}>
                  {img.file.name}
                </span>
              </div>
              
              <div className="flex space-x-1">
                <button 
                  onClick={(e) => { e.stopPropagation(); onMove(index, 'up'); }}
                  disabled={index === 0}
                  className="flex-1 p-1 flex justify-center items-center rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-400 border border-slate-700 hover:border-slate-600 transition-colors"
                  title="Move up"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onMove(index, 'down'); }}
                  disabled={index === images.length - 1}
                  className="flex-1 p-1 flex justify-center items-center rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-400 border border-slate-700 hover:border-slate-600 transition-colors"
                  title="Move down"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DocumentList;