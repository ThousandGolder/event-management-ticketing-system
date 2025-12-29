"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { useRouter } from "next/navigation";
import {
  toastSuccess,
  toastError,
  toastInfo,
} from "@/components/ui/toaster-simple";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null; // Add token to context
  setUser?: (user: User) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null); // Add token state
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Load user AND token from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } catch {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:3001/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toastError("Login failed", data.error || "Invalid credentials");
        return;
      }

      // Map backend response
      const loggedInUser: User = {
        id: data.user.userId,
        name: data.user.username || data.user.name || email.split("@")[0],
        email: data.user.email,
        role: data.user.userType,
      };

      // Store BOTH user and token
      setUser(loggedInUser);
      setToken(data.token);
      localStorage.setItem("user", JSON.stringify(loggedInUser));
      localStorage.setItem("token", data.token); // CRITICAL: Store token

      toastSuccess("Login successful", `Welcome ${loggedInUser.name}`);

      // Role-based redirect
      router.push(loggedInUser.role === "admin" ? "/admin" : "/user");
    } catch (err) {
      console.error(err);
      toastError("Login error", "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token"); // Remove token too

    toastInfo("Logged out", "See you again!");
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token, // Expose token
        setUser,
        login,
        logout,
        isAuthenticated: !!user && !!token, // Check both
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
