import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import DocumentList from './components/DocumentList';
import AIInsights from './components/AIInsights';
import PreviewModal from './components/PreviewModal';
import { DocImage, AIAnalysisResult, QualityOption, ScanMode } from './types';
import { analyzeDocuments } from './services/geminiService';
import { generatePDFBlob } from './services/pdfService';
import { FileOutput, Trash2, Layers, Zap, Image, FileText, Settings2 } from 'lucide-react';

const App: React.FC = () => {
  const [images, setImages] = useState<DocImage[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [filename, setFilename] = useState('paperwork_scan');
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
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
    if (saved === 'original' || saved === 'grayscale' || saved === 'document') {
      return saved;
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
    
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (!file.type.startsWith('image/')) continue;
      
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
      }
    }

    setImages(prev => [...prev, ...newImages]);
    // Reset analysis when new images are added to encourage re-analysis
    setAnalysis(null);
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
    try {
      const result = await analyzeDocuments(targetImages);
      setAnalysis(result);
      if (result.suggestedFilename) {
        setFilename(result.suggestedFilename);
      }
    } catch (error) {
      console.error("Analysis failed", error);
      alert("AI Analysis failed. Please check your API key.");
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

      const blob = await generatePDFBlob(targetImages, quality, scanMode);
      setPdfBlob(blob);
    } catch (error) {
      console.error("PDF Generation failed", error);
      alert("Failed to generate PDF.");
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
    }
  };

  return (
    <div className="min-h-screen pb-20 text-slate-200">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Intro */}
        <div className="mb-10 text-center md:text-left">
          <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Data Ingestion</h2>
          <p className="text-slate-400 max-w-2xl text-lg font-light">
            Upload raw visual data. Deploy neural networks for content classification. Compile final artifact.
          </p>
        </div>

        {/* Upload Area */}
        <ImageUploader onImagesSelected={handleImagesSelected} />

        {/* Document Grid */}
        <DocumentList 
          images={images} 
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onRemove={handleRemoveImage}
          onMove={handleMoveImage}
        />

        {/* Actions & AI */}
        {images.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
            <div className="lg:col-span-2">
               <AIInsights 
                analysis={analysis}
                isAnalyzing={isAnalyzing}
                onAnalyze={handleAnalyze}
                hasImages={images.length > 0}
                selectedCount={selectedIds.size}
                filename={filename}
                setFilename={setFilename}
               />
            </div>

            <div className="lg:col-span-1">
              <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 sticky top-24 shadow-2xl">
                <div className="flex items-center mb-6">
                  <div className="p-1.5 bg-slate-800 rounded mr-3">
                    <Layers className="w-4 h-4 text-cyan-500" />
                  </div>
                  <h3 className="text-lg font-bold text-white">COMPILER_CONFIG</h3>
                </div>

                {/* Scan Mode Selector */}
                <div className="mb-6">
                  <label className="block text-[10px] font-mono text-slate-500 mb-3 uppercase tracking-wider flex items-center">
                    <Settings2 className="w-3 h-3 mr-1.5" />
                    Processing_Mode
                  </label>
                  <div className="space-y-2">
                    <button
                      onClick={() => setScanMode('original')}
                      className={`w-full flex items-center px-3 py-2.5 text-xs font-mono rounded border transition-all duration-200 ${
                        scanMode === 'original'
                        ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      <Image className="w-3.5 h-3.5 mr-2.5 opacity-70" />
                      <span>PHOTO_ORIGINAL</span>
                    </button>
                    <button
                      onClick={() => setScanMode('grayscale')}
                      className={`w-full flex items-center px-3 py-2.5 text-xs font-mono rounded border transition-all duration-200 ${
                        scanMode === 'grayscale'
                        ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      <div className="w-3.5 h-3.5 mr-2.5 rounded-sm bg-gradient-to-br from-white to-black opacity-70" />
                      <span>GRAYSCALE</span>
                    </button>
                    <button
                      onClick={() => setScanMode('document')}
                      className={`w-full flex items-center px-3 py-2.5 text-xs font-mono rounded border transition-all duration-200 ${
                        scanMode === 'document'
                        ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5 mr-2.5 opacity-70" />
                      <span>DOCUMENT_ENHANCED</span>
                      <span className="ml-auto text-[9px] bg-cyan-900/40 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-800/50">REC</span>
                    </button>
                  </div>
                </div>
                
                {/* Quality Selector */}
                <div className="mb-8">
                  <label className="block text-[10px] font-mono text-slate-500 mb-3 uppercase tracking-wider">
                    Compression_Level
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['low', 'medium', 'high'] as const).map((q) => (
                      <button
                        key={q}
                        onClick={() => setQuality(q)}
                        className={`
                          px-2 py-2.5 text-xs font-mono font-medium rounded border text-center uppercase transition-all duration-200
                          ${quality === q 
                            ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)]' 
                            : 'bg-slate-950 border-slate-700 text-slate-500 hover:border-slate-600 hover:text-slate-300'
                          }
                        `}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                  <p className="mt-3 text-[10px] text-slate-500 font-mono border-l-2 border-slate-700 pl-2">
                    {quality === 'low' && "OPTIMIZED: FAST EMAIL"}
                    {quality === 'medium' && "OPTIMIZED: BALANCED"}
                    {quality === 'high' && "OPTIMIZED: PRINT"}
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleGeneratePDF}
                    disabled={isGenerating}
                    className="w-full group relative overflow-hidden flex items-center justify-center px-4 py-3.5 border border-transparent text-sm font-bold text-white rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500 disabled:opacity-75 disabled:cursor-wait transition-all shadow-lg shadow-cyan-900/20"
                  >
                    <span className="relative z-10 flex items-center">
                      {isGenerating ? 'COMPILING...' : (
                        <>
                          <Zap className="w-4 h-4 mr-2" />
                          {selectedIds.size > 0 ? `COMPILE (${selectedIds.size})` : 'EXECUTE_COMPILE'}
                        </>
                      )}
                    </span>
                    {/* Hover Shine Effect */}
                    <div className="absolute inset-0 h-full w-full scale-0 rounded-lg transition-all duration-300 group-hover:scale-100 group-hover:bg-white/10"></div>
                  </button>

                  <button
                    onClick={handleClearAll}
                    className="w-full flex items-center justify-center px-4 py-3 border border-slate-700 text-xs font-mono text-slate-400 rounded-lg bg-slate-950 hover:bg-slate-800 hover:text-red-400 hover:border-red-900/50 transition-all focus:outline-none"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-2" />
                    PURGE_DATA
                  </button>
                </div>
                
                <div className="mt-6 pt-6 border-t border-slate-800 text-[10px] text-slate-600 font-mono">
                  <p>
                    <strong>SYSTEM_NOTE:</strong> Filters are applied during compilation. 'DOCUMENT' mode recommended for text clarity.
                  </p>
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