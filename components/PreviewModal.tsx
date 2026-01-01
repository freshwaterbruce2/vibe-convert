import React, { useEffect, useState } from 'react';
import { X, Download, FileCheck } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Modal Header */}
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center" id="modal-title">
              <FileCheck className="w-5 h-5 mr-2 text-green-600" />
              Verify PDF
            </h3>
            <button
              onClick={onClose}
              type="button"
              className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Modal Content - Iframe Preview */}
          <div className="bg-gray-100 p-4 sm:p-6 h-[60vh] sm:h-[70vh]">
            {blobUrl && (
              <iframe 
                src={blobUrl} 
                className="w-full h-full border border-gray-300 rounded shadow-sm bg-white"
                title="PDF Preview"
              />
            )}
          </div>

          {/* Modal Footer */}
          <div className="bg-white px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <a
              href={blobUrl || '#'}
              download={`${filename}.pdf`}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Final PDF
            </a>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;