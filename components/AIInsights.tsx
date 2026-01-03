import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2, CheckCircle2, FileText, AlertCircle, Terminal, Cpu, Database, Copy, Check, FileJson, Pencil, Trash2, Plus, Save, X, Code2, Activity } from 'lucide-react';
import { AIAnalysisResult, ExtractedDataPoint } from '../types';

interface AIInsightsProps {
  analysis: AIAnalysisResult | null;
  isAnalyzing: boolean;
  onAnalyze: () => void;
  hasImages: boolean;
  selectedCount: number;
  totalCount: number;
  filename: string;
  setFilename: (name: string) => void;
}

const AIInsights: React.FC<AIInsightsProps> = ({ 
  analysis, 
  isAnalyzing, 
  onAnalyze, 
  hasImages,
  selectedCount,
  totalCount,
  filename,
  setFilename
}) => {
  const [editedName, setEditedName] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  
  // Local state for editable fields
  const [formFields, setFormFields] = useState<ExtractedDataPoint[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [tempEditField, setTempEditField] = useState<ExtractedDataPoint>({ label: '', value: '' });

  // Sync analysis data to local state when it arrives
  useEffect(() => {
    if (analysis?.extractedData) {
      setFormFields(analysis.extractedData);
    }
  }, [analysis]);

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
    if (formFields.length === 0) return;
    try {
      const jsonStr = JSON.stringify(formFields, null, 2);
      await navigator.clipboard.writeText(jsonStr);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    } catch (err) {
      console.error('Failed to copy JSON: ', err);
    }
  };

  // Editing Handlers
  const startEditing = (index: number) => {
    setEditingIndex(index);
    setTempEditField({ ...formFields[index] });
  };

  const cancelEditing = () => {
    setEditingIndex(null);
    setTempEditField({ label: '', value: '' });
  };

  const saveField = (index: number) => {
    const newFields = [...formFields];
    newFields[index] = tempEditField;
    setFormFields(newFields);
    setEditingIndex(null);
  };

  const deleteField = (index: number) => {
    const newFields = formFields.filter((_, i) => i !== index);
    setFormFields(newFields);
    if (editingIndex === index) cancelEditing();
  };

  const addNewField = () => {
    const newField = { label: 'NEW_FIELD', value: 'Value' };
    setFormFields([...formFields, newField]);
    setEditingIndex(formFields.length);
    setTempEditField(newField);
  };

  const activeCount = selectedCount > 0 ? selectedCount : totalCount;

  return (
    <div className="relative bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Header Bar */}
      <div className="bg-slate-950 border-b border-slate-800 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
           <Terminal className="w-4 h-4 text-purple-400" />
           <h2 className="text-xs font-bold text-slate-300 font-mono tracking-widest uppercase">
             Neural_Analysis_Unit <span className="text-slate-600">// v2.0</span>
           </h2>
        </div>
        
        <button
          onClick={onAnalyze}
          disabled={!hasImages || isAnalyzing}
          className={`group relative inline-flex items-center justify-center px-4 py-1.5 font-mono text-[10px] font-bold text-white transition-all duration-200 border rounded focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide overflow-hidden ${
            selectedCount > 0 
              ? 'bg-purple-600/20 border-purple-500/50 text-purple-300 hover:bg-purple-600/40 hover:text-white hover:border-purple-400' 
              : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:border-slate-500'
          }`}
        >
          {isAnalyzing ? (
            <span className="flex items-center">
              <Loader2 className="w-3 h-3 mr-2 animate-spin" />
              ANALYZING...
            </span>
          ) : (
            <span className="flex items-center">
              <Sparkles className="w-3 h-3 mr-2" />
              {analysis 
                ? (selectedCount > 0 ? `RE-ANALYZE (${selectedCount})` : `RE-SCAN ALL`)
                : (selectedCount > 0 ? `ANALYZE (${selectedCount})` : `ANALYZE & NAME`)
              }
            </span>
          )}
        </button>
      </div>

      <div className="p-6 relative">
        {isAnalyzing && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-2 border-purple-500/20"></div>
              <div className="absolute inset-0 rounded-full border-t-2 border-purple-500 animate-spin"></div>
              <Cpu className="absolute inset-0 m-auto w-6 h-6 text-purple-400 animate-pulse" />
            </div>
            <div className="mt-6 font-mono text-center">
              <p className="text-xs text-purple-300 animate-pulse">ESTABLISHING NEURAL LINK...</p>
              <p className="text-[10px] text-slate-600 mt-1">
                TARGET: {activeCount} FILE{activeCount !== 1 ? 'S' : ''}
              </p>
            </div>
          </div>
        )}

        {analysis && !isAnalyzing && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Classification Card */}
            <div className="bg-slate-950/50 border-l-2 border-purple-500 p-4 rounded-r-md">
              <h3 className="text-[10px] font-mono font-bold text-purple-400 uppercase mb-1">
                Content_Classification
              </h3>
              <div className="flex items-center space-x-2 mb-2">
                 <span className="text-lg text-white font-bold tracking-tight">{analysis.documentType}</span>
                 <CheckCircle2 className="w-4 h-4 text-green-500" />
              </div>
              <p className="text-sm text-slate-400 font-light leading-relaxed border-t border-slate-800/50 pt-2">
                {analysis.summary}
              </p>
            </div>

            {/* Extracted Data Terminal */}
            {formFields.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3 bg-slate-950/80 p-2 rounded-t-md border border-slate-800 border-b-0">
                  <div className="flex items-center">
                    <Code2 className="w-4 h-4 text-cyan-500 mr-2" />
                    <h3 className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                      Extracted_Data_Stream
                    </h3>
                  </div>
                  <button 
                    onClick={copyAllAsJSON}
                    className="text-[10px] font-mono text-slate-500 hover:text-cyan-400 flex items-center transition-colors"
                  >
                    {copiedAll ? 'COPIED' : '[COPY_JSON]'}
                  </button>
                </div>
                
                <div className="bg-black/40 border border-slate-800 rounded-b-md p-1 max-h-[500px] overflow-y-auto font-mono text-sm">
                  {formFields.map((item, idx) => (
                    <div 
                      key={idx} 
                      className={`group flex items-start p-2 border-b border-slate-800/50 last:border-0 hover:bg-slate-800/30 transition-colors ${editingIndex === idx ? 'bg-slate-800/50' : ''}`}
                    >
                      <div className="w-6 text-slate-600 text-[10px] pt-1 select-none">{String(idx + 1).padStart(2, '0')}</div>
                      
                      <div className="flex-1 grid grid-cols-12 gap-4">
                        {editingIndex === idx ? (
                          // Edit Mode
                          <>
                            <div className="col-span-4">
                               <input 
                                 type="text" 
                                 value={tempEditField.label}
                                 onChange={(e) => setTempEditField({...tempEditField, label: e.target.value})}
                                 className="w-full bg-slate-900 text-purple-400 border border-slate-700 px-2 py-1 text-xs focus:outline-none focus:border-purple-500"
                               />
                            </div>
                            <div className="col-span-7">
                               <input 
                                 type="text" 
                                 value={tempEditField.value}
                                 onChange={(e) => setTempEditField({...tempEditField, value: e.target.value})}
                                 className="w-full bg-slate-900 text-green-400 border border-slate-700 px-2 py-1 text-xs focus:outline-none focus:border-green-500"
                                 autoFocus
                               />
                            </div>
                            <div className="col-span-1 flex items-center justify-end space-x-1">
                              <button onClick={() => saveField(idx)} className="text-green-500 hover:text-white"><Save className="w-3.5 h-3.5" /></button>
                              <button onClick={cancelEditing} className="text-red-500 hover:text-white"><X className="w-3.5 h-3.5" /></button>
                            </div>
                          </>
                        ) : (
                          // View Mode
                          <>
                            <div className="col-span-4 text-xs text-purple-400/80 uppercase tracking-tight pt-0.5 truncate" title={item.label}>
                              {item.label}
                            </div>
                            <div 
                              className="col-span-7 text-slate-300 break-all cursor-pointer hover:text-cyan-400 flex items-center"
                              onClick={() => copyToClipboard(item.value, idx)}
                            >
                              <span className="mr-2">"</span>{item.value}<span className="ml-2">"</span>
                              {copiedIndex === idx && <Check className="w-3 h-3 ml-2 text-green-500 inline" />}
                            </div>
                            <div className="col-span-1 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                               <button onClick={() => startEditing(idx)} className="mr-2 text-slate-500 hover:text-white"><Pencil className="w-3 h-3" /></button>
                               <button onClick={() => deleteField(idx)} className="text-slate-500 hover:text-red-400"><Trash2 className="w-3 h-3" /></button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  <button
                    onClick={addNewField}
                    className="w-full py-2 text-[10px] text-slate-600 hover:text-purple-400 hover:bg-slate-900/50 border-t border-slate-800/50 flex items-center justify-center font-mono uppercase tracking-widest transition-colors"
                  >
                    <Plus className="w-3 h-3 mr-1" /> Add_Data_Point
                  </button>
                </div>
              </div>
            )}

            {/* Filename Input */}
            <div className="pt-4 border-t border-slate-800">
               <div className="flex items-center mb-2">
                 <FileText className="w-3.5 h-3.5 text-slate-500 mr-2" />
                 <label className="text-[10px] font-mono text-slate-500 uppercase">Target_Filename</label>
               </div>
               <div className="flex group">
                  <span className="bg-slate-950 border border-slate-700 border-r-0 text-slate-500 px-3 py-2 text-xs font-mono flex items-center rounded-l">
                    ./docs/
                  </span>
                  <input
                    type="text"
                    value={filename}
                    onChange={handleNameChange}
                    className="flex-1 bg-slate-900 border border-slate-700 text-sm font-mono text-cyan-400 px-3 py-2 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                  />
                  <span className="bg-slate-950 border border-slate-700 border-l-0 text-slate-500 px-3 py-2 text-xs font-mono flex items-center rounded-r">
                    .pdf
                  </span>
               </div>
            </div>
          </div>
        )}

        {!analysis && !isAnalyzing && hasImages && (
          <div className="flex items-center justify-center h-32 text-slate-600 border border-dashed border-slate-800 rounded bg-slate-950/30">
            <div className="text-center">
              <div className="inline-block p-2 rounded-full bg-slate-900 mb-2">
                 <Activity className="w-4 h-4 text-slate-600" />
              </div>
              <p className="text-xs font-mono">Awaiting_Analysis_Command...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIInsights;