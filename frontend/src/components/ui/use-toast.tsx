"use client";

import { useState, useCallback } from "react";

export type ToastProps = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
};

export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const toast = useCallback(
    ({ title, description, variant = "default" }: ToastProps) => {
      const newToast = { title, description, variant };
      setToasts((prev) => [...prev, newToast]);

      // Auto remove after 5 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t !== newToast));
      }, 5000);
    },
    []
  );

  return { toast, toasts };
}
