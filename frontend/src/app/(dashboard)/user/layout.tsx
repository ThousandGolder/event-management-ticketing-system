"use client";

import type { ReactNode } from "react";
import { ProtectedRoute } from "../../../components/providers/ProtectedRoute";
export default function UserDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ProtectedRoute requiredRole="user">
      <section className="space-y-6">
        {/* User Header */}
        <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-purple-700 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold lg:text-3xl">User Dashboard</h1>
              <p className="mt-1 opacity-90">
                View your events, tickets, and account information
              </p>
            </div>

            {/* Icon */}
            <div className="hidden lg:flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
              <span className="text-2xl">👤</span>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div>{children}</div>
      </section>
    </ProtectedRoute>
  );
}
