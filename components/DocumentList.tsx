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
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">
      {images.map((img, index) => {
        const isSelected = selectedIds.has(img.id);
        
        return (
          <div 
            key={img.id} 
            onClick={() => onToggleSelect(img.id)}
            className={`relative group rounded border transition-all duration-300 cursor-pointer overflow-hidden ${
              isSelected 
                ? 'bg-cyan-950/10 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.15)]' 
                : 'bg-slate-900/40 border-slate-800 hover:border-slate-600'
            }`}
          >
            {/* Tech Decoration Lines */}
            <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-slate-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-slate-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            {/* Selection Overlay */}
            <div className={`absolute inset-0 bg-cyan-500/5 pointer-events-none transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0'}`} />

            {/* Image Preview Area */}
            <div className="aspect-[3/4] relative bg-slate-950/50 m-1 rounded-sm overflow-hidden border border-slate-800/50">
              <img 
                src={img.previewUrl} 
                alt={`Page ${index + 1}`} 
                className={`w-full h-full object-cover transition-all duration-500 ${isSelected ? 'scale-105 opacity-90 grayscale-[20%]' : 'opacity-70 group-hover:opacity-100 group-hover:scale-105'}`}
              />
              
              {/* Scanline effect on image - Visible on hover only */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_2px,2px_100%] opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity" />

              {/* Selection Checkbox (Top Left) - Always visible if selected, otherwise hover/mobile visible */}
              <div className="absolute top-2 left-2 z-10">
                {isSelected ? (
                   <div className="bg-slate-900 text-cyan-400 rounded-sm p-0.5 border border-cyan-500 shadow-lg">
                     <CheckCircle2 className="w-4 h-4" />
                   </div>
                ) : (
                   <div className="bg-slate-900/80 text-slate-500 rounded-sm p-0.5 border border-slate-700 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                     <Circle className="w-4 h-4" />
                   </div>
                )}
              </div>

              {/* Index Badge */}
              <div className="absolute bottom-2 left-2 bg-slate-900/90 text-[10px] font-mono font-bold text-slate-400 border border-slate-700 px-1.5 py-0.5 rounded-sm">
                ID_{String(index + 1).padStart(2, '0')}
              </div>

              {/* Remove Button - Always visible on mobile, hover on desktop */}
              <button 
                onClick={(e) => { e.stopPropagation(); onRemove(img.id); }}
                className="absolute top-2 right-2 p-1 bg-slate-900/80 text-slate-400 border border-slate-700 rounded-sm hover:bg-red-950 hover:text-red-400 hover:border-red-500/50 transition-all opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
              >
                <X className="w-3 h-3" />
              </button>
            </div>

            {/* Info Footer */}
            <div className="px-3 py-2 border-t border-slate-800/50 bg-slate-950/30">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center overflow-hidden">
                   <FileImage className="w-3 h-3 text-slate-600 mr-1.5 flex-shrink-0" />
                   <span className="text-[10px] font-mono text-slate-400 truncate">{img.file.name}</span>
                </div>
              </div>
              
              <div className="flex space-x-1">
                <button 
                  onClick={(e) => { e.stopPropagation(); onMove(index, 'up'); }}
                  disabled={index === 0}
                  className="flex-1 py-1 flex justify-center items-center bg-slate-800/50 hover:bg-slate-800 disabled:opacity-20 text-slate-400 border border-slate-700/50 hover:border-slate-600 rounded-sm transition-all"
                >
                  <ArrowUp className="w-3 h-3" />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onMove(index, 'down'); }}
                  disabled={index === images.length - 1}
                  className="flex-1 py-1 flex justify-center items-center bg-slate-800/50 hover:bg-slate-800 disabled:opacity-20 text-slate-400 border border-slate-700/50 hover:border-slate-600 rounded-sm transition-all"
                >
                  <ArrowDown className="w-3 h-3" />
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