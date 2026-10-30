import { createContext, use, useCallback, useMemo, useState } from 'react';
import Toaster from '@/components/feedback/Toaster';

const ToastContext = createContext(null);
const MAX_VISIBLE = 3;

let nextId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback(
    ({ title, description, variant = 'success', duration = 3200 }) => {
      const id = ++nextId;
      setToasts((current) => [...current.slice(-(MAX_VISIBLE - 1)), { id, title, description, variant }]);
      setTimeout(() => dismiss(id), duration);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext value={value}>
      {children}
      <Toaster toasts={toasts} onDismiss={dismiss} />
    </ToastContext>
  );
}

export function useToast() {
  const context = use(ToastContext);
  if (!context) throw new Error('useToast must be used inside <ToastProvider>');
  return context.toast;
}
