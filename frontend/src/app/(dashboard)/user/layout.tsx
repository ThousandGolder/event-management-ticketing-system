"use client";

import { ReactNode, useEffect, useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";

export default function UserDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const [isClient, setIsClient] = useState(false);

  // Ensure this runs only on client to avoid SSR mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient || isLoading) return <p>Loading...</p>;
  if (!user) return <p>You must be logged in to view this page.</p>;

  return (
    <div className="space-y-6">
      {/* User-specific header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
        <h1 className="text-2xl lg:text-3xl font-bold mb-2">
          Welcome Back, {user.name}!
        </h1>
        <p className="opacity-90">
          Manage your tickets and discover new events
        </p>
      </div>

      {children}
    </div>
  );
}
