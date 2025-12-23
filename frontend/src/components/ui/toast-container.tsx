"use client";

import { useToast } from "./use-toast";
import { X } from "lucide-react";

export function ToastContainer() {
  const { toasts } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast, index) => (
        <div
          key={index}
          className={`flex items-center justify-between p-4 rounded-md shadow-lg max-w-sm ${
            toast.variant === "destructive"
              ? "bg-red-100 border border-red-200 text-red-800"
              : "bg-green-100 border border-green-200 text-green-800"
          }`}
        >
          <div>
            {toast.title && <p className="font-semibold">{toast.title}</p>}
            {toast.description && (
              <p className="text-sm">{toast.description}</p>
            )}
          </div>
          <button
            onClick={() => {
              // Remove this toast
              // You might need to add a remove function to your useToast hook
            }}
            className="ml-4"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
