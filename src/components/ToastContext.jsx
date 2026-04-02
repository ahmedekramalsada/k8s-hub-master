import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) throw new Error("useToast must be used within a ToastProvider");
    return context;
}

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'info', duration = 4000) => {
        const id = Date.now().toString();
        setToasts(prev => [...prev, { id, message, type, duration }]);
        
        // Auto-remove after duration
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, duration);
        
        return id;
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast, removeToast }}>
            {children}
            {/* Toast Container */}
            <div style={{
                position: 'fixed',
                bottom: 'var(--sp-6)',
                right: 'var(--sp-6)',
                zIndex: 'var(--z-tooltip)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--sp-3)',
                pointerEvents: 'none' // Let clicks pass through container
            }}>
                {toasts.map(toast => (
                    <ToastItem 
                        key={toast.id} 
                        toast={toast} 
                        onClose={() => removeToast(toast.id)} 
                    />
                ))}
            </div>
        </ToastContext.Provider>
    );
}

function ToastItem({ toast, onClose }) {
    // Determine styles based on type
    let icon = 'ℹ️';
    let borderColor = 'var(--color-cyan)';
    let bgLight = 'rgba(6, 182, 212, 0.1)';
    
    if (toast.type === 'success') {
        icon = '✅'; borderColor = 'var(--color-emerald)'; bgLight = 'rgba(16, 185, 129, 0.1)';
    } else if (toast.type === 'warning') {
        icon = '⚠️'; borderColor = 'var(--color-amber)'; bgLight = 'rgba(245, 158, 11, 0.1)';
    } else if (toast.type === 'error') {
        icon = '❌'; borderColor = 'var(--color-rose)'; bgLight = 'rgba(244, 63, 94, 0.1)';
    }

    return (
        <div style={{
            pointerEvents: 'auto', // Important so you can click the toast
            background: 'var(--bg-panel)',
            border: `1px solid ${borderColor}`,
            boxShadow: 'var(--shadow-lg)',
            padding: 'var(--sp-3) var(--sp-4)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--sp-3)',
            minWidth: '280px',
            maxWidth: '350px',
            animation: 'slideInRight var(--duration-normal) var(--ease-out-expo), fadeOut var(--duration-normal) ease forwards',
            animationDelay: `0s, ${toast.duration - 300}ms`
        }}>
            <div style={{ 
                background: bgLight, 
                width: 32, height: 32, 
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0
            }}>
                {icon}
            </div>
            
            <div style={{ flex: 1 }}>
                <div style={{ color: 'var(--text-primary)', fontSize: '13.5px', fontWeight: 500, lineHeight: 1.4 }}>
                    {toast.message}
                </div>
            </div>

            <button 
                onClick={onClose}
                className="btn-ghost"
                style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: 4,
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 16
                }}
            >
                ✕
            </button>
            
            {/* Progress bar line at the absolute bottom */}
            <div style={{
                position: 'absolute',
                bottom: 0, left: 0,
                height: 3,
                background: borderColor,
                borderRadius: '0 0 var(--radius-md) var(--radius-md)',
                animation: `toast-progress ${toast.duration}ms linear forwards`
            }}></div>
        </div>
    );
}
