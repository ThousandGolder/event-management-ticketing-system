"use client";

import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

// Toast Component
interface ToastProps {
  title: string;
  description?: string;
  type?: "default" | "destructive" | "success" | "warning" | "error" | "info";
  onClose?: () => void;
}

function Toast({ title, description, type = "default", onClose }: ToastProps) {
  return (
    <div
      className={cn(
        "pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-lg border p-6 pr-8 shadow-lg transition-all duration-300 animate-in slide-in-from-right-full",
        {
          "border-border bg-background text-foreground":
            type === "default" || type === "info",
          "border-destructive bg-destructive text-destructive-foreground":
            type === "destructive" || type === "error",
          "border-green-500 bg-green-50 text-green-900 dark:bg-green-900 dark:text-green-50":
            type === "success",
          "border-yellow-500 bg-yellow-50 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-50":
            type === "warning",
        }
      )}
    >
      <div className="grid gap-1">
        <div className="text-sm font-semibold">{title}</div>
        {description && <div className="text-sm opacity-90">{description}</div>}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="absolute right-2 top-2 rounded-md p-1 opacity-70 transition-opacity hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          aria-label="Close toast"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

// Toast Type Definitions
export type ToastType =
  | "default"
  | "destructive"
  | "success"
  | "warning"
  | "error"
  | "info";

export interface ToastData {
  id: string;
  title: string;
  description?: string;
  type: ToastType;
  duration?: number;
}

// Toaster Component
export function ToasterSimple() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  useEffect(() => {
    const handleToast = (event: CustomEvent<Omit<ToastData, "id">>) => {
      const newToast: ToastData = {
        id: Math.random().toString(36).substring(2, 9),
        ...event.detail,
      };

      setToasts((prev) => [newToast, ...prev].slice(0, 5));

      // Auto dismiss after duration (default: 5 seconds)
      const duration = event.detail.duration || 5000;
      if (duration > 0) {
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
        }, duration);
      }
    };

    // Listen for custom toast events
    window.addEventListener("show-toast", handleToast as EventListener);

    return () => {
      window.removeEventListener("show-toast", handleToast as EventListener);
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          title={toast.title}
          description={toast.description}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}

// Main toast function
export function toast(props: Omit<ToastData, "id">) {
  const event = new CustomEvent("show-toast", { detail: props });
  window.dispatchEvent(event);
}

// Convenience functions for common toast types
export function toastSuccess(
  title: string,
  description?: string,
  duration?: number
) {
  toast({ title, description, type: "success", duration });
}

export function toastError(
  title: string,
  description?: string,
  duration?: number
) {
  toast({ title, description, type: "error", duration });
}

export function toastWarning(
  title: string,
  description?: string,
  duration?: number
) {
  toast({ title, description, type: "warning", duration });
}

export function toastInfo(
  title: string,
  description?: string,
  duration?: number
) {
  toast({ title, description, type: "info", duration });
}

// Alias for destructive/error
export function toastDestructive(
  title: string,
  description?: string,
  duration?: number
) {
  toast({ title, description, type: "destructive", duration });
}

// Export Toast component separately if needed
export { Toast as ToastSimple };
