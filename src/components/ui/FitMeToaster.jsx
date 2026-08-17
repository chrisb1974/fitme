import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

const ToastContext = createContext(null);

// Max toasts visible at once
const MAX_TOASTS = 2;

let idCounter = 0;

export function FitMeToasterProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timeoutsRef = useRef({});

  const dismiss = useCallback((id) => {
    // Start fade-out
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
    );
    // Remove from DOM after animation
    timeoutsRef.current[`remove_${id}`] = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      delete timeoutsRef.current[`dismiss_${id}`];
      delete timeoutsRef.current[`remove_${id}`];
    }, 300);
  }, []);

  const toast = useCallback(({ description, title }) => {
    const id = ++idCounter;

    setToasts((prev) => {
      let next = [...prev];

      // If already at max, immediately start exiting the oldest one
      if (next.length >= MAX_TOASTS) {
        const oldest = next[0];
        // Clear its scheduled dismiss
        clearTimeout(timeoutsRef.current[`dismiss_${oldest.id}`]);
        // Mark exiting, schedule removal
        next = next.map((t, i) => (i === 0 ? { ...t, exiting: true } : t));
        timeoutsRef.current[`remove_${oldest.id}`] = setTimeout(() => {
          setToasts((p) => p.filter((t) => t.id !== oldest.id));
        }, 300);
      }

      return [...next, { id, title, description, exiting: false }];
    });

    // Auto-dismiss after 2500ms
    timeoutsRef.current[`dismiss_${id}`] = setTimeout(() => {
      dismiss(id);
    }, 2500);
  }, [dismiss]);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Bottom position: pb-24 keeps it above the nav bar (nav is ~80px) */}
      <div className="fixed bottom-0 left-0 right-0 z-[200] flex flex-col items-center gap-2 pb-24 px-4 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            style={{
              animation: t.exiting
                ? 'fitme-toast-out 0.3s ease forwards'
                : 'fitme-toast-in 0.2s ease forwards',
            }}
            className="w-full max-w-sm bg-foreground text-background rounded-2xl px-4 py-3 soft-shadow pointer-events-auto"
          >
            {t.title && <p className="text-sm font-extrabold leading-tight">{t.title}</p>}
            {t.description && <p className="text-sm font-semibold opacity-90">{t.description}</p>}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes fitme-toast-in {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fitme-toast-out {
          from { opacity: 1; transform: translateY(0); }
          to   { opacity: 0; transform: translateY(8px); }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useFitMeToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useFitMeToast must be used within FitMeToasterProvider');
  return ctx;
}