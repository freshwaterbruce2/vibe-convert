import React, { useState, useCallback, useEffect, useRef } from 'react';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import DocumentList from './components/DocumentList';
import AIInsights from './components/AIInsights';
import PreviewModal from './components/PreviewModal';
import OnboardingHero from './components/OnboardingHero';
import { ToastContainer, ToastMessage, ToastType } from './components/Toast';
import { DocImage, AIAnalysisResult, QualityOption, ScanMode } from './types';
import { analyzeDocuments } from './services/geminiService';
import { generatePDFBlob } from './services/pdfService';
import { FileOutput, Trash2, Layers, Zap, Image, FileText, Settings2, Check, Sparkles, Binary, Eraser } from 'lucide-react';

const App: React.FC = () => {
  const [images, setImages] = useState<DocImage[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [filename, setFilename] = useState('paperwork_scan');
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Refs for auto-scrolling
  const documentListRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  
  // Initialize quality from localStorage
  const [quality, setQuality] = useState<QualityOption>(() => {
    const saved = localStorage.getItem('docuflow_pdf_quality');
    if (saved === 'low' || saved === 'medium' || saved === 'high') {
      return saved;
    }
    return 'medium';
  });

  // Initialize Scan Mode (Default to Document for better results)
  const [scanMode, setScanMode] = useState<ScanMode>(() => {
    const saved = localStorage.getItem('docuflow_scan_mode');
    if (saved === 'original' || saved === 'grayscale' || saved === 'document' || saved === 'enhanced') {
      return saved as ScanMode;
    }
    return 'document';
  });

  // Persist settings
  useEffect(() => {
    localStorage.setItem('docuflow_pdf_quality', quality);
  }, [quality]);

  useEffect(() => {
    localStorage.setItem('docuflow_scan_mode', scanMode);
  }, [scanMode]);

  // Toast Helper
  const addToast = (type: ToastType, title: string, message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, type, title, message }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Helper to convert File to Base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleImagesSelected = useCallback(async (fileList: FileList) => {
    const newImages: DocImage[] = [];
    let errorCount = 0;
    
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (!file.type.startsWith('image/')) {
        errorCount++;
        continue;
      }
      
      try {
        const base64 = await fileToBase64(file);
        newImages.push({
          id: Math.random().toString(36).substr(2, 9),
          file,
          previewUrl: URL.createObjectURL(file),
          base64
        });
      } catch (err) {
        console.error("Error processing file", file.name, err);
        errorCount++;
      }
    }

    if (errorCount > 0) {
      addToast('error', 'Upload Issue', `Failed to load ${errorCount} file(s). Images only.`);
    }

    if (newImages.length > 0) {
      setImages(prev => [...prev, ...newImages]);
      setAnalysis(null); // Reset analysis on new upload
      addToast('success', 'Data Ingested', `Successfully loaded ${newImages.length} new image(s).`);
      
      // Auto-scroll to list
      setTimeout(() => {
        documentListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, []);

  const handleToggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleRemoveImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
    if (selectedIds.has(id)) {
      const newSelected = new Set(selectedIds);
      newSelected.delete(id);
      setSelectedIds(newSelected);
    }
  };

  const handleMoveImage = (index: number, direction: 'up' | 'down') => {
    const newImages = [...images];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex >= 0 && newIndex < newImages.length) {
      [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];
      setImages(newImages);
    }
  };

  const handleAnalyze = async () => {
    if (images.length === 0) return;
    
    // Determine which images to analyze
    const targetImages = selectedIds.size > 0 
      ? images.filter(img => selectedIds.has(img.id))
      : images;

    setIsAnalyzing(true);
    
    // Auto-scroll to results area immediately
    setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);

    try {
      const result = await analyzeDocuments(targetImages);
      setAnalysis(result);
      if (result.suggestedFilename) {
        setFilename(result.suggestedFilename);
      }
      addToast('success', 'Analysis Complete', 'Document structure and data extracted successfully.');
    } catch (error) {
      console.error("Analysis failed", error);
      addToast('error', 'Neural Link Failed', 'AI Analysis failed. Please check your API key and connection.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGeneratePDF = async () => {
    if (images.length === 0) return;
    
    setIsGenerating(true);
    try {
      const targetImages = selectedIds.size > 0 
        ? images.filter(img => selectedIds.has(img.id))
        : images;

      // Pass analysis result to PDF generator to include metadata/headers
      const blob = await generatePDFBlob(targetImages, quality, scanMode, analysis);
      setPdfBlob(blob);
      addToast('success', 'Compilation Successful', 'PDF artifact generated and ready for review.');
    } catch (error) {
      console.error("PDF Generation failed", error);
      addToast('error', 'Compilation Error', 'Failed to generate PDF artifact.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to clear all images?")) {
      setImages([]);
      setSelectedIds(new Set());
      setAnalysis(null);
      setFilename('paperwork_scan');
      addToast('info', 'Buffer Purged', 'All data cleared from local memory.');
    }
  };

  return (
    <div className="min-h-screen pb-20 text-slate-200 font-sans selection:bg-cyan-500/30 selection:text-cyan-100 flex flex-col">
      <Header />
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* State 1: Empty Workspace (Landing Page Mode) */}
        {images.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[80vh] py-12">
             <OnboardingHero />
             <div className="w-full max-w-3xl mt-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
               <ImageUploader onImagesSelected={handleImagesSelected} variant="hero" />
             </div>
          </div>
        ) : (
          /* State 2: Active Workspace */
          <div className="py-8">
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between border-b border-slate-800/60 pb-6 animate-in slide-in-from-top-4 fade-in duration-500">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1 tracking-tight flex items-center">
                  <Binary className="w-5 h-5 mr-3 text-cyan-500" />
                  Active Workspace
                </h2>
                <p className="text-slate-500 text-sm font-light font-mono">
                  {images.length} FILE{images.length !== 1 && 'S'} QUEUED // READY FOR PROCESSING
                </p>
              </div>
              
              <div className="mt-4 md:mt-0 flex items-center space-x-4 bg-slate-900 px-4 py-2 rounded-lg border border-slate-800">
                <div className="text-right">
                  <p className="text-[10px] text-slate-500 font-mono uppercase">Total Files</p>
                  <p className="text-xl font-bold text-white leading-none">{images.length}</p>
                </div>
                <div className="h-8 w-[1px] bg-slate-800"></div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-500 font-mono uppercase">Selection</p>
                  <p className="text-xl font-bold text-cyan-400 leading-none">{selectedIds.size > 0 ? selectedIds.size : 'ALL'}</p>
                </div>
              </div>
            </div>

            {/* Compact Uploader when working */}
            <div className="mb-8">
              <ImageUploader onImagesSelected={handleImagesSelected} variant="compact" />
            </div>

            {/* Document Grid */}
            <div ref={documentListRef}>
              <DocumentList 
                images={images} 
                selectedIds={selectedIds}
                onToggleSelect={handleToggleSelect}
                onRemove={handleRemoveImage}
                onMove={handleMoveImage}
              />
            </div>

            {/* Actions & AI */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8 animate-in slide-in-from-bottom-8 fade-in duration-700" ref={resultsRef}>
              <div className="lg:col-span-8 space-y-8">
                 <AIInsights 
                  analysis={analysis}
                  isAnalyzing={isAnalyzing}
                  onAnalyze={handleAnalyze}
                  hasImages={images.length > 0}
                  selectedCount={selectedIds.size}
                  totalCount={images.length}
                  filename={filename}
                  setFilename={setFilename}
                 />
              </div>

              <div className="lg:col-span-4">
                <div className="bg-slate-900 rounded-xl border border-slate-700 p-1 sticky top-24 shadow-2xl relative overflow-hidden group">
                  {/* Metallic gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-800/50 to-slate-950/80 pointer-events-none"></div>
                  
                  <div className="relative bg-slate-950/90 rounded-lg p-5 border border-slate-800/50 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
                      <div className="flex items-center">
                        <div className="p-1.5 bg-cyan-950/30 rounded border border-cyan-900/50 mr-3">
                          <Layers className="w-4 h-4 text-cyan-400" />
                        </div>
                        <h3 className="text-sm font-bold text-white font-mono tracking-wide uppercase">Compiler_Config</h3>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></div>
                    </div>

                    {/* Scan Mode Selector */}
                    <div className="mb-6">
                      <label className="block text-[10px] font-mono text-slate-500 mb-2 uppercase tracking-wider flex items-center">
                        <Settings2 className="w-3 h-3 mr-1.5" />
                        Filter_Matrix
                      </label>
                      <div className="grid grid-cols-4 gap-1.5">
                        <button
                          onClick={() => setScanMode('original')}
                          title="Original Image"
                          className={`
                            flex flex-col items-center justify-center
                            px-2 py-2.5 text-[9px] font-mono font-bold rounded border text-center uppercase transition-all duration-200 relative
                            ${scanMode === 'original'
                              ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                              : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-600 hover:text-slate-300'
                            }
                          `}
                        >
                          <Image className="w-3.5 h-3.5 mb-1.5 opacity-80" />
                          <span>RAW</span>
                        </button>

                        <button
                          onClick={() => setScanMode('grayscale')}
                          title="Black & White"
                          className={`
                            flex flex-col items-center justify-center
                            px-2 py-2.5 text-[9px] font-mono font-bold rounded border text-center uppercase transition-all duration-200 relative
                            ${scanMode === 'grayscale'
                              ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                              : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-600 hover:text-slate-300'
                            }
                          `}
                        >
                          <div className="w-3.5 h-3.5 mb-1.5 rounded-sm bg-gradient-to-br from-slate-200 to-slate-800 opacity-80 border border-slate-600" />
                          <span>B&W</span>
                        </button>

                        <button
                          onClick={() => setScanMode('document')}
                          title="High Contrast Document"
                          className={`
                            flex flex-col items-center justify-center
                            px-2 py-2.5 text-[9px] font-mono font-bold rounded border text-center uppercase transition-all duration-200 relative
                            ${scanMode === 'document'
                              ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                              : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-600 hover:text-slate-300'
                            }
                          `}
                        >
                          <FileText className="w-3.5 h-3.5 mb-1.5 opacity-80" />
                          <span>DOC</span>
                        </button>

                        <button
                          onClick={() => setScanMode('enhanced')}
                          title="Shadow Removal & Cleanup"
                          className={`
                            flex flex-col items-center justify-center
                            px-2 py-2.5 text-[9px] font-mono font-bold rounded border text-center uppercase transition-all duration-200 relative
                            ${scanMode === 'enhanced'
                              ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                              : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-600 hover:text-slate-300'
                            }
                          `}
                        >
                          <Eraser className="w-3.5 h-3.5 mb-1.5 opacity-80" />
                          <span>CLEAN</span>
                        </button>
                      </div>
                    </div>
                    
                    {/* Quality Selector */}
                    <div className="mb-8">
                      <label className="block text-[10px] font-mono text-slate-500 mb-2 uppercase tracking-wider flex items-center">
                         <Zap className="w-3 h-3 mr-1.5" />
                         Compression_Ratio
                      </label>
                      <div className="bg-slate-900 p-1 rounded border border-slate-800 flex justify-between relative">
                        {/* Active slider background (simulated) */}
                        <div className={`absolute top-1 bottom-1 w-1/3 bg-cyan-900/40 rounded transition-all duration-300 border border-cyan-500/30 ${
                            quality === 'low' ? 'left-1' : quality === 'medium' ? 'left-[34%]' : 'left-[65.5%]'
                        }`}></div>

                        {(['low', 'medium', 'high'] as const).map((q) => (
                          <button
                            key={q}
                            onClick={() => setQuality(q)}
                            className={`
                              relative z-10 flex-1 text-[10px] font-mono font-bold uppercase py-1.5 rounded transition-colors
                              ${quality === q ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'}
                            `}
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                      <div className="mt-2 text-[9px] text-slate-500 font-mono text-right">
                        {quality === 'low' && "TARGET: MIN_SIZE [EMAIL]"}
                        {quality === 'medium' && "TARGET: BALANCED [WEB]"}
                        {quality === 'high' && "TARGET: MAX_RES [PRINT]"}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <button
                        onClick={handleGeneratePDF}
                        disabled={isGenerating}
                        className="w-full relative overflow-hidden flex items-center justify-center px-4 py-4 border border-cyan-600 bg-cyan-900/20 text-sm font-bold text-cyan-400 rounded hover:bg-cyan-900/40 focus:outline-none transition-all shadow-[0_0_20px_rgba(8,145,178,0.1)] group-hover/btn:shadow-[0_0_20px_rgba(8,145,178,0.3)]"
                      >
                        <span className="relative z-10 flex items-center tracking-widest uppercase">
                          {isGenerating ? 'COMPILING...' : (
                            <>
                              <Zap className="w-4 h-4 mr-2" />
                              EXECUTE_COMPILE
                            </>
                          )}
                        </span>
                      </button>

                      <button
                        onClick={handleClearAll}
                        className="w-full flex items-center justify-center px-4 py-3 border border-slate-800 text-[10px] font-mono text-slate-500 rounded bg-transparent hover:bg-red-950/20 hover:text-red-400 hover:border-red-900/50 transition-all uppercase tracking-wider"
                      >
                        <Trash2 className="w-3 h-3 mr-2" />
                        PURGE_BUFFER
                      </button>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-slate-800">
                      <div className="flex justify-between items-center text-[9px] text-slate-600 font-mono uppercase">
                        <span>Mem_Usage: 12%</span>
                        <span>Queue: {selectedIds.size > 0 ? selectedIds.size : images.length}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <PreviewModal 
        pdfBlob={pdfBlob} 
        filename={filename} 
        onClose={() => setPdfBlob(null)} 
      />

    </div>
  );
};

export default App;