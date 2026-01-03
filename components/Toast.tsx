import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message: string;
}

interface ToastProps {
  toast: ToastMessage;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [toast.id, onClose]);

  const styles = {
    success: {
      border: 'border-green-500/50',
      bg: 'bg-slate-900/90',
      icon: <CheckCircle2 className="w-5 h-5 text-green-400" />,
      title: 'text-green-400'
    },
    error: {
      border: 'border-red-500/50',
      bg: 'bg-slate-900/90',
      icon: <AlertTriangle className="w-5 h-5 text-red-400" />,
      title: 'text-red-400'
    },
    info: {
      border: 'border-cyan-500/50',
      bg: 'bg-slate-900/90',
      icon: <Info className="w-5 h-5 text-cyan-400" />,
      title: 'text-cyan-400'
    }
  };

  const style = styles[toast.type];

  return (
    <div className={`mb-3 w-80 transform transition-all duration-300 ease-in-out hover:scale-[1.02] ${style.bg} backdrop-blur-md border-l-4 ${style.border} shadow-2xl rounded-r flex overflow-hidden animate-in slide-in-from-right fade-in`}>
      <div className="flex-1 p-4 flex items-start space-x-3">
        <div className="flex-shrink-0 mt-0.5">
          {style.icon}
        </div>
        <div className="flex-1">
          <h4 className={`text-sm font-bold font-mono uppercase tracking-wide ${style.title}`}>
            {toast.title}
          </h4>
          <p className="mt-1 text-xs text-slate-300 leading-relaxed">
            {toast.message}
          </p>
        </div>
      </div>
      <button 
        onClick={() => onClose(toast.id)}
        className="px-3 hover:bg-white/5 text-slate-500 hover:text-white transition-colors flex items-center justify-center border-l border-white/5"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

interface ToastContainerProps {
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col items-end pointer-events-none">
      <div className="pointer-events-auto">
        {toasts.map(toast => (
          <Toast key={toast.id} toast={toast} onClose={removeToast} />
        ))}
      </div>
    </div>
  );
};

export default ToastContainer;