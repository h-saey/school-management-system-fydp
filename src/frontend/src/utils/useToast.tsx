import { useState, useCallback } from "react";
import React from "react";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

let nextId = 0;

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = ++nextId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const success = useCallback(
    (msg: string) => showToast(msg, "success"),
    [showToast],
  );
  const error = useCallback(
    (msg: string) => showToast(msg, "error"),
    [showToast],
  );
  const warning = useCallback(
    (msg: string) => showToast(msg, "warning"),
    [showToast],
  );
  const info = useCallback(
    (msg: string) => showToast(msg, "info"),
    [showToast],
  );

  return { toasts, success, error, warning, info };
}

// ── Toast Container Component ────────────────────────────────────────────────
// Drop <ToastContainer toasts={toasts} /> anywhere near the root of each page.

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />,
  error: <XCircle className="w-5 h-5 text-red-500   flex-shrink-0" />,
  warning: <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0" />,
  info: <Info className="w-5 h-5 text-blue-500  flex-shrink-0" />,
};

const bgColors: Record<ToastType, string> = {
  success: "bg-green-50  border-green-200",
  error: "bg-red-50    border-red-200",
  warning: "bg-yellow-50 border-yellow-200",
  info: "bg-blue-50   border-blue-200",
};

const textColors: Record<ToastType, string> = {
  success: "text-green-800",
  error: "text-red-800",
  warning: "text-yellow-800",
  info: "text-blue-800",
};

interface ToastContainerProps {
  toasts: Toast[];
}

export function ToastContainer({ toasts }: ToastContainerProps) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-start gap-3 p-4 rounded-xl border shadow-lg ${bgColors[t.type]} animate-in`}
        >
          {icons[t.type]}
          <p className={`text-sm font-medium flex-1 ${textColors[t.type]}`}>
            {t.message}
          </p>
        </div>
      ))}
    </div>
  );
}
