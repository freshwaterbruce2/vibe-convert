import React from 'react';
import { FileText, Sparkles, Activity, ShieldCheck, Wifi } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-slate-950/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between relative overflow-hidden">
        
        {/* Animated bottom border line */}
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
        
        <div className="flex items-center space-x-4">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-600 to-blue-600 rounded blur opacity-25 group-hover:opacity-60 transition duration-500"></div>
            <div className="relative bg-slate-900 p-2 rounded border border-slate-700/50 flex items-center justify-center">
              <FileText className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center font-mono">
              DOCUFLOW<span className="text-cyan-500">_AI</span>
            </h1>
            <div className="flex items-center space-x-2">
               <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
               <p className="text-[9px] text-slate-400 font-mono tracking-widest uppercase">System Operational</p>
            </div>
          </div>
        </div>

        <div className="hidden md:flex items-center space-x-6">
          <div className="flex items-center space-x-6 text-[10px] font-mono text-slate-500">
             <div className="flex items-center space-x-1.5" title="Security Protocol">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-600" />
                <span>SECURE_LINK</span>
             </div>
             <div className="flex items-center space-x-1.5" title="Network Status">
                <Wifi className="w-3.5 h-3.5 text-slate-600" />
                <span>NET_ACTIVE</span>
             </div>
          </div>
          
          <div className="h-4 w-[1px] bg-slate-800"></div>

          <div className="flex items-center space-x-2 bg-slate-900/50 px-3 py-1.5 rounded border border-slate-800 hover:border-cyan-500/30 transition-colors">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-[10px] font-mono font-bold text-slate-300">GEMINI_3_FLASH</span>
            <span className="flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-1.5 w-1.5 rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-purple-500"></span>
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;