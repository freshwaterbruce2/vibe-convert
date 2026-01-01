import React, { useEffect, useState } from 'react';
import { X, Download, FileCheck, Eye, AlertTriangle } from 'lucide-react';

interface PreviewModalProps {
  pdfBlob: Blob | null;
  filename: string;
  onClose: () => void;
}

const PreviewModal: React.FC<PreviewModalProps> = ({ pdfBlob, filename, onClose }) => {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    if (pdfBlob) {
      const url = URL.createObjectURL(pdfBlob);
      setBlobUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [pdfBlob]);

  if (!pdfBlob) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto font-sans" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        
        {/* Backdrop */}
        <div className="fixed inset-0 transition-opacity bg-slate-950/90 backdrop-blur-sm" aria-hidden="true" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block w-full overflow-hidden text-left align-bottom transition-all transform bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 sm:my-8 sm:align-middle sm:max-w-5xl h-[90vh] flex flex-col">
          
          {/* Modal Header */}
          <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900 flex-shrink-0">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center" id="modal-title">
                <Eye className="w-5 h-5 mr-3 text-cyan-500" />
                VISUAL_VERIFICATION
              </h3>
              <p className="text-[10px] text-slate-500 font-mono mt-1">
                VERIFY_INTEGRITY: {filename}.pdf
              </p>
            </div>
            <button
              onClick={onClose}
              type="button"
              className="text-slate-500 bg-slate-800/50 rounded-lg p-2 hover:text-white hover:bg-slate-700 focus:outline-none transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Content - Object Preview (Robust PDF Embedding) */}
          <div className="flex-1 bg-slate-800 relative w-full h-full overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(15,23,42,1)_25%,transparent_25%,transparent_75%,rgba(15,23,42,1)_75%,rgba(15,23,42,1)),linear-gradient(45deg,rgba(15,23,42,1)_25%,transparent_25%,transparent_75%,rgba(15,23,42,1)_75%,rgba(15,23,42,1))] bg-[length:20px_20px] opacity-10 pointer-events-none"></div>
            
            {blobUrl && (
              <object
                data={blobUrl}
                type="application/pdf"
                className="w-full h-full block"
              >
                {/* Fallback for browsers that don't support PDF embedding (e.g. mobile Safari/Chrome sometimes) */}
                <div className="flex flex-col items-center justify-center h-full p-10 text-center">
                  <div className="bg-slate-900/80 p-8 rounded-2xl border border-slate-700 max-w-md backdrop-blur-md">
                    <AlertTriangle className="w-12 h-12 text-yellow-500 mb-4 mx-auto" />
                    <h4 className="text-xl font-bold text-white mb-2">Preview Not Available</h4>
                    <p className="text-slate-400 mb-6 text-sm leading-relaxed">
                      Your browser's security settings or PDF plugin may be preventing the inline preview. The file is still generated correctly.
                    </p>
                    <a
                      href={blobUrl}
                      download={`${filename}.pdf`}
                      className="inline-flex items-center justify-center w-full px-5 py-3 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-500 shadow-lg shadow-blue-900/20"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF Directly
                    </a>
                  </div>
                </div>
              </object>
            )}
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-4 bg-slate-900 border-t border-slate-800 flex-shrink-0 sm:flex sm:flex-row-reverse gap-3">
            <a
              href={blobUrl || '#'}
              download={`${filename}.pdf`}
              className="w-full inline-flex justify-center items-center rounded-lg border border-transparent shadow-[0_0_15px_rgba(59,130,246,0.5)] px-6 py-3 bg-blue-600 text-sm font-bold text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-500 sm:w-auto transition-all"
            >
              <Download className="w-4 h-4 mr-2" />
              CONFIRM_&_DOWNLOAD
            </a>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center items-center rounded-lg border border-slate-700 shadow-sm px-6 py-3 bg-slate-800 text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-slate-500 sm:mt-0 sm:w-auto transition-all"
            >
              Back to Editor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;