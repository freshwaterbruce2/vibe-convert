import React from 'react';
import { FileText, Sparkles } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">DocuFlow AI</h1>
            <p className="text-xs text-gray-500">Smart PDF Compiler</p>
          </div>
        </div>
        <div className="hidden md:flex items-center space-x-2 text-sm text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
          <Sparkles className="w-4 h-4" />
          <span>Powered by Gemini 2.5 Flash</span>
        </div>
      </div>
    </header>
  );
};

export default Header;