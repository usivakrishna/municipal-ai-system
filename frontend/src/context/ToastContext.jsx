import { createContext, useContext, useMemo, useState } from 'react';

const ToastContext = createContext(null);

const toastStyles = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  error: 'border-rose-200 bg-rose-50 text-rose-900',
  info: 'border-brand-200 bg-white text-slate-900'
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const dismissToast = (id) => {
    setToasts((current) => current.filter((item) => item.id !== id));
  };

  const notify = ({ title, message, type = 'info' }) => {
    const id = `${Date.now()}-${Math.round(Math.random() * 100000)}`;
    setToasts((current) => [...current, { id, title, message, type }]);
    window.setTimeout(() => dismissToast(id), 3800);
  };

  const value = useMemo(
    () => ({
      notify,
      dismissToast
    }),
    []
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[70] flex w-full max-w-sm flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-2xl border px-4 py-3 shadow-soft backdrop-blur ${toastStyles[toast.type] || toastStyles.info}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold">{toast.title}</p>
                {toast.message ? <p className="mt-1 text-xs opacity-80">{toast.message}</p> : null}
              </div>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                className="rounded-full border border-current/15 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide"
              >
                Close
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used inside ToastProvider');
  }
  return context;
};
