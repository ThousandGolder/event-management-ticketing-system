"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "user" | "admin";
}

export function ProtectedRoute({
  children,
  requiredRole = "user",
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [debugInfo, setDebugInfo] = useState("Initializing...");

  useEffect(() => {
    const debug = {
      timestamp: new Date().toISOString(),
      isLoading,
      isAuthenticated,
      user,
      requiredRole,
      hasLocalStorageUser: !!localStorage.getItem("user"),
      cookie: document.cookie,
    };

    console.log(" ProtectedRoute debug:", debug);
    setDebugInfo(JSON.stringify(debug, null, 2));

    if (!isLoading && !isAuthenticated) {
      console.log(" Not authenticated, redirecting to login");
      setTimeout(() => {
        router.push("/login");
      }, 100);
    }

    if (
      !isLoading &&
      isAuthenticated &&
      user &&
      requiredRole === "admin" &&
      user.role !== "admin"
    ) {
      console.log(" User not admin, redirecting to user dashboard");
      setTimeout(() => {
        router.push("/user");
      }, 100);
    }
  }, [isAuthenticated, isLoading, router, user, requiredRole]);

  if (isLoading) {
    console.log(" ProtectedRoute showing loader");
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Checking authentication...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log("🚫 ProtectedRoute: not authenticated, rendering null");
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">
            Redirecting to login...
          </p>
          <pre className="mt-4 text-xs text-left bg-gray-100 p-4 rounded max-w-lg overflow-auto">
            {debugInfo}
          </pre>
        </div>
      </div>
    );
  }

  if (requiredRole === "admin" && user?.role !== "admin") {
    console.log(" ProtectedRoute: insufficient permissions");
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold mb-2">Insufficient Permissions</p>
          <p className="text-sm text-muted-foreground mb-4">
            Redirecting to user dashboard...
          </p>
          <pre className="mt-4 text-xs text-left bg-gray-100 p-4 rounded max-w-lg overflow-auto">
            {debugInfo}
          </pre>
        </div>
      </div>
    );
  }


  return <>{children}</>;
}
