import { useToastStore } from '@visitly/app-store';
import { useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const ToastProvider = () => {
    const { toast: toastData, clearToast } = useToastStore();
    useEffect(() => {
        if (!toastData) return;
        const { message, type = 'info', options } = toastData;
        toast[type](message, options);
        clearToast();
    }, [toastData, clearToast]);
    return (
        <ToastContainer
            position="top-right"
            autoClose={3000}
            newestOnTop
        />
    );
};
