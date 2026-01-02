import React, { useState } from 'react';
import { Sparkles, Loader2, CheckCircle2, FileText, AlertCircle, Terminal, Cpu, Database, Copy, Check, FileJson } from 'lucide-react';
import { AIAnalysisResult } from '../types';

interface AIInsightsProps {
  analysis: AIAnalysisResult | null;
  isAnalyzing: boolean;
  onAnalyze: () => void;
  hasImages: boolean;
  selectedCount: number;
  filename: string;
  setFilename: (name: string) => void;
}

const AIInsights: React.FC<AIInsightsProps> = ({ 
  analysis, 
  isAnalyzing, 
  onAnalyze, 
  hasImages,
  selectedCount,
  filename,
  setFilename
}) => {
  const [editedName, setEditedName] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilename(e.target.value);
    setEditedName(true);
  };

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const copyAllAsJSON = async () => {
    if (!analysis?.extractedData) return;
    try {
      const jsonStr = JSON.stringify(analysis.extractedData, null, 2);
      await navigator.clipboard.writeText(jsonStr);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    } catch (err) {
      console.error('Failed to copy JSON: ', err);
    }
  };

  return (
    <div className="relative bg-slate-900 rounded-xl border border-slate-800 overflow-hidden mt-6">
      {/* Decorative top border gradient */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50" />

      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white flex items-center tracking-tight">
            <Terminal className="w-5 h-5 text-purple-400 mr-2.5" />
            NEURAL_ANALYSIS_UNIT
          </h2>
          
          {!analysis && (
            <button
              onClick={onAnalyze}
              disabled={!hasImages || isAnalyzing}
              className={`group relative inline-flex items-center justify-center px-4 py-2 font-mono text-xs font-medium text-white transition-all duration-200 border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-purple-500 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed ${
                selectedCount > 0 
                  ? 'bg-purple-600 border-purple-500 shadow-[0_0_15px_rgba(147,51,234,0.3)] hover:bg-purple-500' 
                  : 'bg-purple-600/10 border-purple-500/50 hover:bg-purple-600 hover:border-purple-500'
              }`}
            >
              <span className={`absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-black ${selectedCount > 0 ? 'hidden' : 'block'}`}></span>
              {isAnalyzing ? (
                <span className="relative flex items-center">
                  <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin text-purple-300" />
                  PROCESSING...
                </span>
              ) : (
                <span className={`relative flex items-center ${selectedCount > 0 ? 'text-white' : 'text-purple-300 group-hover:text-white'}`}>
                  <Sparkles className="w-3.5 h-3.5 mr-2" />
                  {selectedCount > 0 ? `ANALYZE SELECTION (${selectedCount})` : 'INITIATE SCAN (ALL)'}
                </span>
              )}
            </button>
          )}
        </div>

        {isAnalyzing && (
          <div className="flex flex-col items-center justify-center py-12 border border-dashed border-slate-800 bg-slate-950/50 rounded-lg">
            <div className="relative">
              <div className="absolute inset-0 bg-purple-500 blur-xl opacity-20 animate-pulse"></div>
              <Loader2 className="relative w-10 h-10 text-purple-500 animate-spin" />
            </div>
            <p className="mt-4 text-xs font-mono text-purple-400 animate-pulse">
              ACCESSING GEMINI NEURAL NET...
            </p>
            <p className="text-[10px] font-mono text-slate-600 mt-2">
              {selectedCount > 0 
                ? `PROCESSING_BATCH: ${selectedCount} FILES...` 
                : 'PROCESSING_FULL_BATCH...'}
            </p>
          </div>
        )}

        {analysis && !isAnalyzing && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Summary Section */}
            <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-5">
              <div className="flex items-start">
                <div className="mt-1 mr-4 p-1.5 bg-slate-900 rounded border border-slate-800">
                   <Cpu className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-500 font-mono uppercase mb-2">
                    DETECTED_CONTENT: <span className="text-purple-400">{analysis.documentType}</span>
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed font-light">
                    {analysis.summary}
                  </p>
                </div>
              </div>
            </div>

            {/* Extracted Data Grid */}
            {analysis.extractedData && analysis.extractedData.length > 0 && (
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <Database className="w-4 h-4 text-cyan-500 mr-2" />
                    <h3 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                      Extracted_Form_Data
                    </h3>
                  </div>
                  <button 
                    onClick={copyAllAsJSON}
                    className="flex items-center space-x-1.5 text-[10px] font-mono text-slate-500 hover:text-cyan-400 transition-colors"
                  >
                    {copiedAll ? <Check className="w-3 h-3" /> : <FileJson className="w-3 h-3" />}
                    <span>{copiedAll ? 'COPIED_JSON' : 'COPY_JSON'}</span>
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {analysis.extractedData.map((item, idx) => (
                    <div 
                      key={idx} 
                      className="group relative bg-slate-950/80 border border-slate-800/60 p-3 rounded hover:border-cyan-500/30 transition-all flex flex-col justify-between"
                    >
                      <div className="flex justify-between items-start mb-1">
                         <div className="text-[10px] font-mono text-slate-500 uppercase truncate pr-4">{item.label}</div>
                         <button
                           onClick={() => copyToClipboard(item.value, idx)}
                           className="text-slate-600 hover:text-cyan-400 focus:outline-none transition-colors"
                           title="Copy value"
                         >
                           {copiedIndex === idx ? (
                             <Check className="w-3.5 h-3.5 text-green-500" />
                           ) : (
                             <Copy className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                           )}
                         </button>
                      </div>
                      
                      <div 
                        className="text-sm font-mono text-cyan-400 truncate cursor-pointer" 
                        title="Click to copy"
                        onClick={() => copyToClipboard(item.value, idx)}
                      >
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-[10px] text-slate-600 font-mono text-center">
                  * Click any value to copy to clipboard for easy form filling.
                </p>
              </div>
            )}

            {/* Filename Section */}
            <div className="pt-2 border-t border-slate-800/50">
              <label className="block text-[10px] font-mono font-medium text-slate-500 mb-2 uppercase tracking-wider">
                Output_Filename_Structure
              </label>
              <div className="flex group">
                <input
                  type="text"
                  value={filename}
                  onChange={handleNameChange}
                  className="flex-1 bg-slate-950 border border-slate-700 border-r-0 rounded-l-md px-4 py-2.5 text-sm font-mono text-cyan-400 placeholder-slate-700 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                  placeholder="filename_here"
                />
                <span className="inline-flex items-center px-4 rounded-r-md border border-slate-700 bg-slate-900 text-slate-500 text-sm font-mono border-l-0">
                  .pdf
                </span>
              </div>
              {!editedName && (
                <p className="mt-2 text-[10px] text-green-500 font-mono flex items-center">
                  <CheckCircle2 className="w-3 h-3 mr-1.5" />
                  AI_NAMING_PROTOCOL_ACTIVE
                </p>
              )}
            </div>
          </div>
        )}

        {!analysis && !isAnalyzing && hasImages && (
          <div className="text-sm text-slate-400 bg-slate-950/30 border border-slate-800 p-4 rounded-lg flex items-start">
            <AlertCircle className="w-5 h-5 text-slate-600 mr-3 flex-shrink-0" />
            <p className="font-light">
              <span className="text-white font-medium">System Ready.</span> Select specific images or scan entire batch for content analysis.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIInsights;