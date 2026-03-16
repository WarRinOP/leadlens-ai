"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

type ToastType = "success" | "error" | "info";

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast container */}
      <div
        aria-live="polite"
        className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none"
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} item={t} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ item }: { item: ToastItem }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (el) {
      el.animate(
        [
          { opacity: 0, transform: "translateY(8px)" },
          { opacity: 1, transform: "translateY(0)" },
        ],
        { duration: 200, fill: "forwards" }
      );
    }
  }, []);

  const icons: Record<ToastType, string> = {
    success: "✓",
    error: "✕",
    info: "i",
  };

  const colors: Record<ToastType, string> = {
    success: "bg-[#22c55e]/10 border-[#22c55e]/30 text-[#22c55e]",
    error: "bg-[#ef4444]/10 border-[#ef4444]/30 text-[#ef4444]",
    info: "bg-[#3b82f6]/10 border-[#3b82f6]/30 text-[#3b82f6]",
  };

  return (
    <div
      ref={ref}
      className={`pointer-events-auto flex items-center gap-2.5 min-w-[260px] max-w-sm px-4 py-3 rounded-xl border backdrop-blur-sm bg-[#13161c] border-[#252a35] shadow-xl text-sm text-[#e2e8f0]`}
    >
      <span
        className={`flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold ${colors[item.type]}`}
      >
        {icons[item.type]}
      </span>
      <span>{item.message}</span>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}
