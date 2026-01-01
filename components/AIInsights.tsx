import React, { useState } from 'react';
import { Sparkles, Loader2, CheckCircle2, FileText, AlertCircle } from 'lucide-react';
import { AIAnalysisResult } from '../types';

interface AIInsightsProps {
  analysis: AIAnalysisResult | null;
  isAnalyzing: boolean;
  onAnalyze: () => void;
  hasImages: boolean;
  filename: string;
  setFilename: (name: string) => void;
}

const AIInsights: React.FC<AIInsightsProps> = ({ 
  analysis, 
  isAnalyzing, 
  onAnalyze, 
  hasImages,
  filename,
  setFilename
}) => {
  const [editedName, setEditedName] = useState(false);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilename(e.target.value);
    setEditedName(true);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <Sparkles className="w-5 h-5 text-purple-600 mr-2" />
          AI Document Assistant
        </h2>
        
        {!analysis && !isAnalyzing && (
          <button
            onClick={onAnalyze}
            disabled={!hasImages}
            className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-all"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Analyze & Name
          </button>
        )}
      </div>

      {isAnalyzing && (
        <div className="flex flex-col items-center justify-center py-8 text-gray-500 bg-gray-50 rounded-lg animate-pulse">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin mb-3" />
          <p className="text-sm">Reading documents with Gemini 2.5...</p>
        </div>
      )}

      {analysis && !isAnalyzing && (
        <div className="space-y-5 animate-in fade-in duration-500">
          {/* Summary Section */}
          <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
            <div className="flex items-start">
              <FileText className="w-5 h-5 text-purple-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-purple-900 mb-1">
                  Document Content ({analysis.documentType})
                </h3>
                <p className="text-sm text-purple-800 leading-relaxed">
                  {analysis.summary}
                </p>
              </div>
            </div>
          </div>

          {/* Filename Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filename (Preview)
            </label>
            <div className="flex rounded-md shadow-sm">
              <input
                type="text"
                value={filename}
                onChange={handleNameChange}
                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-l-md border border-gray-300 text-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="filename_here"
              />
              <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                .pdf
              </span>
            </div>
            {!editedName && (
              <p className="mt-1.5 text-xs text-green-600 flex items-center">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                AI suggested name applied
              </p>
            )}
          </div>
        </div>
      )}

      {!analysis && !isAnalyzing && hasImages && (
        <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg flex items-start">
          <AlertCircle className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0" />
          <p>
            Click "Analyze & Name" to let Gemini scan your documents, auto-generate a summary, and suggest a professional filename before you create the PDF.
          </p>
        </div>
      )}
    </div>
  );
};

export default AIInsights;