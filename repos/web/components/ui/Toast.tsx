"use client";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ToastVariant = "success" | "error" | "info";

interface Toast {
  id: string;
  variant: ToastVariant;
  message: string;
  exiting?: boolean;
}

interface ToastContextValue {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const ToastContext = createContext<ToastContextValue | null>(null);

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used inside <ToastProvider>");
  }
  return ctx;
}

// ---------------------------------------------------------------------------
// Variant styles
// ---------------------------------------------------------------------------

const VARIANT_BORDER: Record<ToastVariant, string> = {
  success: "border-l-4 border-l-success",
  error: "border-l-4 border-l-alert-red",
  info: "border-l-4 border-l-concrete",
};

const VARIANT_ICON: Record<ToastVariant, string> = {
  success: "check_circle",
  error: "error",
  info: "info",
};

const VARIANT_ICON_COLOR: Record<ToastVariant, string> = {
  success: "text-success",
  error: "text-alert-red",
  info: "text-stone",
};

// ---------------------------------------------------------------------------
// ToastItem
// ---------------------------------------------------------------------------

const AUTO_DISMISS_MS = 3000;

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: string) => void;
}) {
  return (
    <div
      className={`
        bg-canvas-white border border-ash-graphite/10 rounded-md
        px-14 py-10 flex items-center gap-10 shadow-md max-w-300
        text-13 text-ash-graphite
        ${VARIANT_BORDER[toast.variant]}
        ${toast.exiting ? "toast-exit" : "toast-enter"}
      `}
      role="alert"
      aria-live="assertive"
    >
      <span
        className={`material-symbols-outlined text-18 shrink-0 ${VARIANT_ICON_COLOR[toast.variant]}`}
      >
        {VARIANT_ICON[toast.variant]}
      </span>
      <span className="flex-1 leading-snug">{toast.message}</span>
      <button
        onClick={() => onDismiss(toast.id)}
        className="material-symbols-outlined text-16 text-stone hover:text-ash-graphite transition-colors shrink-0 cursor-pointer"
        aria-label="Cerrar notificación"
      >
        close
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ToastProvider
// ---------------------------------------------------------------------------

const MAX_TOASTS = 3;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  // Track timeouts so we can clear them on unmount
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    // Mark as exiting first for animation
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
    );
    // Remove after animation
    const t = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      timers.current.delete(id);
    }, 200);
    timers.current.set(`exit-${id}`, t);
  }, []);

  const addToast = useCallback(
    (variant: ToastVariant, message: string) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => {
        const next = [{ id, variant, message }, ...prev];
        // Keep max 3, dismiss the oldest if needed
        if (next.length > MAX_TOASTS) {
          return next.slice(0, MAX_TOASTS);
        }
        return next;
      });

      // Auto-dismiss after 3s
      const t = setTimeout(() => {
        dismiss(id);
      }, AUTO_DISMISS_MS);
      timers.current.set(id, t);
    },
    [dismiss]
  );

  // Clean up timers on unmount
  useEffect(() => {
    const t = timers.current;
    return () => {
      t.forEach((timer) => clearTimeout(timer));
    };
  }, []);

  const ctx: ToastContextValue = {
    success: (msg) => addToast("success", msg),
    error: (msg) => addToast("error", msg),
    info: (msg) => addToast("info", msg),
  };

  return (
    <ToastContext.Provider value={ctx}>
      {children}
      {/* Portal-like fixed container */}
      <div
        className="fixed bottom-24 right-24 z-50 flex flex-col gap-8 pointer-events-none"
        aria-label="Notificaciones"
      >
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onDismiss={dismiss} />
          </div>
        ))}
      </div>

      {/* Keyframe animations injected inline */}
      <style>{`
        .toast-enter {
          animation: toast-slide-in 0.2s ease forwards;
        }
        .toast-exit {
          animation: toast-fade-out 0.15s ease forwards;
        }
        @keyframes toast-slide-in {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes toast-fade-out {
          from {
            opacity: 1;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            transform: translateY(4px);
          }
        }
      `}</style>
    </ToastContext.Provider>
  );
}
