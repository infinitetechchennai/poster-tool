import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 3500);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-500 shrink-0" />
  };

  const bgStyles = {
    success: 'border-emerald-200 bg-white shadow-lg shadow-emerald-500/5',
    error: 'border-rose-200 bg-white shadow-lg shadow-rose-500/5',
    info: 'border-blue-200 bg-white shadow-lg shadow-blue-500/5'
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-subtle">
      <div className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border ${bgStyles[toast.type || 'info']} text-slate-800 text-sm font-medium transition-all`}>
        {icons[toast.type || 'info']}
        <span>{toast.message}</span>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 ml-2 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
