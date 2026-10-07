import React from 'react';
import { useToast } from '../context/DataContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-2 pointer-events-none max-w-sm w-full">
      {toasts.map(toast => {
        const icons = {
          success: <CheckCircle2 className="text-emerald-500 shrink-0" size={18} />,
          error: <AlertCircle className="text-rose-500 shrink-0" size={18} />,
          warning: <AlertTriangle className="text-amber-500 shrink-0" size={18} />,
          info: <Info className="text-sky-500 shrink-0" size={18} />
        };

        const borders = {
          success: 'border-emerald-200/80 bg-white',
          error: 'border-rose-200/80 bg-white',
          warning: 'border-amber-200/80 bg-white',
          info: 'border-sky-200/80 bg-white'
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-xl border shadow-lg shadow-slate-900/5 ${borders[toast.type]} animate-in slide-in-from-bottom-3 duration-200`}
          >
            <div className="flex items-center space-x-3 text-slate-800 text-sm font-medium">
              {icons[toast.type]}
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-3 text-slate-400 hover:text-slate-600 rounded-md p-1 hover:bg-slate-100 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
