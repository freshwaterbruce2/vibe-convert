import React from 'react';
import { Upload, Sparkles, FileText, ArrowRight } from 'lucide-react';

const OnboardingHero: React.FC = () => {
  return (
    <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
          Turn Chaos into <span className="text-cyan-400">Structure</span>
        </h2>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          DocuFlow AI transforms your scattered phone photos into professional, searchable PDF documents using advanced computer vision.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto relative">
        {/* Connection Lines (Desktop) */}
        <div className="hidden md:block absolute top-12 left-[20%] right-[20%] h-[2px] bg-gradient-to-r from-slate-800 via-cyan-900/50 to-slate-800 -z-10"></div>

        {/* Step 1 */}
        <div className="relative group">
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:border-cyan-500/30 transition-all duration-300 hover:-translate-y-1 hover:bg-slate-900">
            <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mb-4 text-cyan-400 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(34,211,238,0.1)]">
              <Upload className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">1. Upload Photos</h3>
            <p className="text-sm text-slate-400">
              Drag and drop images of your documents, receipts, or contracts.
            </p>
          </div>
          <div className="hidden md:block absolute top-1/2 -right-6 transform -translate-y-1/2 text-slate-700">
            <ArrowRight className="w-5 h-5" />
          </div>
        </div>

        {/* Step 2 */}
        <div className="relative group">
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:border-purple-500/30 transition-all duration-300 hover:-translate-y-1 hover:bg-slate-900">
            <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mb-4 text-purple-400 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(168,85,247,0.1)]">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">2. AI Analysis</h3>
            <p className="text-sm text-slate-400">
              Our AI extracts data, fixes text, and automatically renames your file.
            </p>
          </div>
          <div className="hidden md:block absolute top-1/2 -right-6 transform -translate-y-1/2 text-slate-700">
            <ArrowRight className="w-5 h-5" />
          </div>
        </div>

        {/* Step 3 */}
        <div className="relative group">
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:border-green-500/30 transition-all duration-300 hover:-translate-y-1 hover:bg-slate-900">
            <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mb-4 text-green-400 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(34,197,94,0.1)]">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">3. Export PDF</h3>
            <p className="text-sm text-slate-400">
              Download a clean, optimized PDF ready for email or archiving.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingHero;