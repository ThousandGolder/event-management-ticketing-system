"use client";

import React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ToastSimpleProps {
  title: string;
  description?: string;
  type?: "default" | "destructive" | "success" | "warning" | "error" | "info";
  onClose?: () => void;
}

export function ToastSimple({
  title,
  description,
  type = "default",
  onClose,
}: ToastSimpleProps) {
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
