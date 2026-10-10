import React, { createContext, useContext, useState } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2">
        {toasts.map((toast) => (
          <div key={toast.id} className={`flex items-center justify-between px-4 py-3 rounded-lg shadow-float text-sm font-medium min-w-[250px] animate-in slide-in-from-right-4 bg-white border`}>
            <div className="flex items-center space-x-2">
              {toast.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-sage-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              <span className="text-navy-900">{toast.message}</span>
            </div>
            <button onClick={() => removeToast(toast.id)} className="text-gray-400 hover:text-gray-600 ml-4">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
