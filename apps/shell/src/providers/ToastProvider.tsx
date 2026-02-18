import { useToastStore } from '@visitly/app-store';
import { useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { Check, X, Info, AlertTriangle } from 'lucide-react';
import 'react-toastify/dist/ReactToastify.css';

type ToastType = 'success' | 'error' | 'info' | 'warning';

const ICONS: Record<ToastType, any> = {
  success: Check,
  error: X,
  info: Info,
  warning: AlertTriangle,
};

const CustomToast = ({
  message,
  type,
}: {
  message: string;
  type: ToastType;
}) => {
  const Icon = ICONS[type];

  return (
    <div className="toast-content">
      <div className={`toast-icon toast-${type}`}>
        <Icon size={14} />
      </div>
      <span>{message}</span>
    </div>
  );
};

export const ToastProvider = () => {
  const { toast: toastData, clearToast } = useToastStore();

  useEffect(() => {
    if (!toastData) return;

    const { message, type = 'info', options } = toastData;

    toast(<CustomToast message={message} type={type} />, {
      ...options,
      position: 'top-right',
      hideProgressBar: true,
      closeButton: false,
      className: 'custom-toast', 
      toastId : message
    });

    clearToast();

  }, [toastData, clearToast]);

  return <ToastContainer newestOnTop draggable={false} />;
};
