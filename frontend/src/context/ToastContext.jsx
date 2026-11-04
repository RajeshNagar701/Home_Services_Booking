import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Notification Container */}
      <div
        className="toast-container position-fixed top-0 end-0 p-3"
        style={{ zIndex: 9999, pointerEvents: 'none' }}
      >
        {toasts.map((toast) => {
          let bgClass = 'bg-primary text-white';
          let iconClass = 'bi-info-circle-fill';

          if (toast.type === 'success') {
            bgClass = 'bg-success text-white';
            iconClass = 'bi-check-circle-fill';
          } else if (toast.type === 'error') {
            bgClass = 'bg-danger text-white';
            iconClass = 'bi-exclamation-triangle-fill';
          } else if (toast.type === 'warning') {
            bgClass = 'bg-warning text-dark';
            iconClass = 'bi-exclamation-circle-fill';
          }

          return (
            <div
              key={toast.id}
              className={`toast show align-items-center ${bgClass} border-0 shadow-lg mb-2`}
              role="alert"
              aria-live="assertive"
              aria-atomic="true"
              style={{ pointerEvents: 'auto', minWidth: '280px', borderRadius: '10px' }}
            >
              <div className="d-flex p-2 px-3 align-items-center">
                <i className={`bi ${iconClass} fs-5 me-2`}></i>
                <div className="toast-body p-0 flex-grow-1 fw-medium" style={{ fontSize: '0.9rem' }}>
                  {toast.message}
                </div>
                <button
                  type="button"
                  className={`btn-close ${toast.type !== 'warning' ? 'btn-close-white' : ''} ms-2`}
                  onClick={() => removeToast(toast.id)}
                  aria-label="Close"
                ></button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
