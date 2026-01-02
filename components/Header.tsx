import React from 'react';
import { FileText, Sparkles, Cpu } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-slate-950/70 backdrop-blur-lg border-b border-slate-800/60 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg blur opacity-60 group-hover:opacity-100 transition duration-200"></div>
            <div className="relative bg-slate-900 p-2 rounded-lg ring-1 ring-slate-800">
              <FileText className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-wide flex items-center">
              DOCUFLOW<span className="text-cyan-500 ml-0.5">.AI</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">Neural PDF Compiler v2.0</p>
          </div>
        </div>
        <div className="hidden md:flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-[11px] font-mono text-cyan-400 bg-cyan-950/20 px-3 py-1.5 rounded-full border border-cyan-900/50 shadow-[0_0_10px_rgba(34,211,238,0.1)]">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <Sparkles className="w-3 h-3" />
            <span>GEMINI_3_FLASH: ONLINE</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;