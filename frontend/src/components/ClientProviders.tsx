// src/components/ClientProviders.tsx
"use client";

import { ReactNode } from "react";
import { ThemeProvider } from "./providers/ThemeProvider";
import { QueryProvider } from "./providers/QueryProvider";
import { AuthProvider } from "./providers/AuthProvider";
import { ToasterSimple } from "./ui/toaster-simple";

export default function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <QueryProvider>
        <AuthProvider>
          {children}
          <ToasterSimple />
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
