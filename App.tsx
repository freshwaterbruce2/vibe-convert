import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import DocumentList from './components/DocumentList';
import AIInsights from './components/AIInsights';
import PreviewModal from './components/PreviewModal';
import { DocImage, AIAnalysisResult, QualityOption } from './types';
import { analyzeDocuments } from './services/geminiService';
import { generatePDFBlob } from './services/pdfService';
import { FileOutput, Trash2 } from 'lucide-react';

const App: React.FC = () => {
  const [images, setImages] = useState<DocImage[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [filename, setFilename] = useState('paperwork_scan');
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [quality, setQuality] = useState<QualityOption>('medium');

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

  const handleRemoveImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
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
    
    setIsAnalyzing(true);
    try {
      const result = await analyzeDocuments(images);
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
      const blob = await generatePDFBlob(images, quality);
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
      setAnalysis(null);
      setFilename('paperwork_scan');
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <Header />
      
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Intro */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Convert Photos to PDF</h2>
          <p className="text-gray-600">
            Upload your paperwork photos. Let AI organize and name them. Verify with a preview before sending.
          </p>
        </div>

        {/* Upload Area */}
        <ImageUploader onImagesSelected={handleImagesSelected} />

        {/* Document Grid */}
        <DocumentList 
          images={images} 
          onRemove={handleRemoveImage}
          onMove={handleMoveImage}
        />

        {/* Actions & AI */}
        {images.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            <div className="lg:col-span-2">
               <AIInsights 
                analysis={analysis}
                isAnalyzing={isAnalyzing}
                onAnalyze={handleAnalyze}
                hasImages={images.length > 0}
                filename={filename}
                setFilename={setFilename}
               />
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
                
                {/* Quality Selector */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">PDF Quality</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['low', 'medium', 'high'] as const).map((q) => (
                      <button
                        key={q}
                        onClick={() => setQuality(q)}
                        className={`
                          px-2 py-2 text-sm font-medium rounded-md border text-center capitalize transition-colors
                          ${quality === q 
                            ? 'bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500' 
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                          }
                        `}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    {quality === 'low' && "Smallest file size. Good for text docs."}
                    {quality === 'medium' && "Balanced. Best for email sharing."}
                    {quality === 'high' && "Highest detail. Best for printing."}
                  </p>
                </div>

                <button
                  onClick={handleGeneratePDF}
                  disabled={isGenerating}
                  className="w-full mb-3 flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-75 disabled:cursor-wait"
                >
                  {isGenerating ? 'Generating...' : (
                    <>
                      <FileOutput className="w-5 h-5 mr-2" />
                      Preview & Download PDF
                    </>
                  )}
                </button>

                <button
                  onClick={handleClearAll}
                  className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-red-600 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All
                </button>
                
                <div className="mt-6 pt-6 border-t border-gray-100 text-xs text-gray-500">
                  <p>
                    <strong>Tip:</strong> Drag and drop images into the upload area or click to select multiple files at once.
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