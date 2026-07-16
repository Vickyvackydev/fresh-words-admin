import { useState, useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

type ToastCallback = (toast: ToastItem) => void;
const toastListeners = new Set<ToastCallback>();

export const toast = {
  success(message: string) {
    this.show(message, "success");
  },
  error(message: string) {
    this.show(message, "error");
  },
  info(message: string) {
    this.show(message, "info");
  },
  warning(message: string) {
    this.show(message, "warning");
  },
  show(message: string, type: ToastType = "info") {
    const newToast: ToastItem = {
      id: Math.random().toString(36).substring(2, 11),
      message,
      type,
    };
    toastListeners.forEach((listener) => listener(newToast));
  },
};

export const ToastContainer = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const addToast = (newToast: ToastItem) => {
      setToasts((prev) => [...prev, newToast]);
      setTimeout(() => {
        removeToast(newToast.id);
      }, 4000);
    };

    toastListeners.add(addToast);
    return () => {
      toastListeners.delete(addToast);
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => {
        let bgColor = "bg-slate-900 border-slate-800 text-white";
        let icon = <Info className="w-4 h-4 text-sky-400" />;

        if (t.type === "success") {
          bgColor = "bg-white border-emerald-100 text-slate-800 shadow-lg shadow-emerald-500/5";
          icon = <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />;
        } else if (t.type === "error") {
          bgColor = "bg-white border-rose-100 text-slate-800 shadow-lg shadow-rose-500/5";
          icon = <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />;
        } else if (t.type === "warning") {
          bgColor = "bg-white border-amber-100 text-slate-800 shadow-lg shadow-amber-500/5";
          icon = <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />;
        }

        return (
          <div
            key={t.id}
            className={`flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl border font-sans text-xs font-semibold leading-normal pointer-events-auto transition-all shadow-md transform translate-y-0 opacity-100 ${bgColor}`}
            style={{
              animation: "slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
            }}
          >
            <div className="flex items-center gap-2.5">
              {icon}
              <span>{t.message}</span>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-slate-400 hover:text-slate-600 transition-colors p-0.5 rounded-md hover:bg-slate-50 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
      
      {/* Inject slideIn keyframes inline */}
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%) translateY(-10px);
            opacity: 0;
          }
          to {
            transform: translateX(0) translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default toast;