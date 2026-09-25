import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';

export const Toast = ({ message, type = 'info', onClose, duration = 4000 }) => {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [message, duration, onClose]);

  if (!message) return null;

  const config = {
    success: {
      bg: 'bg-emerald-50 border-emerald-200',
      icon: <CheckCircle size={18} className="text-emerald-600 flex-shrink-0" />,
      text: 'text-emerald-800',
    },
    error: {
      bg: 'bg-red-50 border-red-200',
      icon: <AlertCircle size={18} className="text-red-600 flex-shrink-0" />,
      text: 'text-red-800',
    },
    warning: {
      bg: 'bg-amber-50 border-amber-200',
      icon: <AlertTriangle size={18} className="text-amber-600 flex-shrink-0" />,
      text: 'text-amber-800',
    },
    info: {
      bg: 'bg-blue-50 border-blue-200',
      icon: <Info size={18} className="text-blue-600 flex-shrink-0" />,
      text: 'text-blue-800',
    },
  };
  const c = config[type] || config.info;

  return (
    <div
      className={`fixed top-5 right-5 z-50 flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg max-w-sm w-full animate-[fadeInSlide_0.3s_ease-out] ${c.bg}`}
      style={{ animation: 'slideIn 0.3s ease-out' }}
    >
      {c.icon}
      <p className={`text-sm font-medium flex-1 leading-relaxed ${c.text}`}>{message}</p>
      <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0 mt-0.5">
        <X size={15} />
      </button>
    </div>
  );
};

// Simple global toast hook
export const useToast = () => {
  const [toast, setToast] = useState({ message: '', type: 'info' });
  const showToast = (message, type = 'info') => setToast({ message, type });
  const closeToast = () => setToast({ message: '', type: 'info' });
  return { toast, showToast, closeToast };
};
