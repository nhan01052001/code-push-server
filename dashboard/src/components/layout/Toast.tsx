import { Toaster, toast } from 'react-hot-toast';
import '../../styles/Toast.css';

interface CustomToastOptions {
  message: string;
  type: 'success' | 'error';
  duration?: number;
}

// Export Toaster component để sử dụng ở App.tsx
export const ToastContainer = () => {
  return (
    <Toaster 
      position="bottom-right"
      toastOptions={{
        className: 'custom-toast',
        duration: 5000, // Mặc định là 5s
        style: {
          padding: '16px',
          borderRadius: '8px',
          color: '#fff',
        },
      }}
    />
  );
};

// Custom toast functions
export const showToast = ({ message, type, duration }: CustomToastOptions) => {
  const toastDuration = duration || (type === 'success' ? 3000 : 5000);
  
  return toast.custom(
    (t) => (
      <div 
        className={`toast-container ${type} ${t.visible ? 'toast-visible' : 'toast-hidden'}`}
        style={{ 
          animation: `${t.visible ? 'toast-slide-in' : 'toast-slide-out'} 0.3s ease-in-out`,
        }}
      >
        <div className="toast-content">
          <div className="toast-icon">
            {type === 'success' ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 12L11 15L16 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M15 9L9 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 9L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
          <div className="toast-message">{message}</div>
        </div>
        <div className="toast-progress-container">
          <div 
            className="toast-progress" 
            style={{ 
              animationDuration: `${toastDuration}ms`,
              animationPlayState: t.visible ? 'running' : 'paused'
            }} 
          />
        </div>
      </div>
    ),
    { duration: toastDuration }
  );
};

// Các hàm helper để sử dụng dễ dàng hơn
export const showSuccessToast = (message: string, duration?: number) => {
  return showToast({ message, type: 'success', duration: duration || 3000 });
};

export const showErrorToast = (message: string, duration?: number) => {
  return showToast({ message, type: 'error', duration: duration || 5000 });
}; 