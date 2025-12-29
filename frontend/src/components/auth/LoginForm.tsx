"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/providers/AuthProvider";
import { toastError } from "@/components/ui/toaster-simple";
import { Loader2, Mail, Lock } from "lucide-react";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, isLoading: authLoading } = useAuth(); // Rename to avoid conflict
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("from") || "/user"; // Default user dashboard

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!email || !password) {
      toastError("Missing fields", "Please fill in all required fields.");
      setIsSubmitting(false);
      return;
    }

    try {
      // Call login without checking return value
      await login(email, password);
      // The redirect logic should be handled by your AuthProvider
    } catch (error) {
      console.error("Login error:", error);
      // Error is already handled by the login function
    } finally {
      setIsSubmitting(false);
    }
  };

  // Demo credentials helper function
  const fillDemoCredentials = (type: "admin" | "organizer" | "attendee") => {
    switch (type) {
      case "admin":
        setEmail("admin@events.com");
        setPassword("password123");
        break;
      case "organizer":
        setEmail("organizer@events.com");
        setPassword("password123");
        break;
      case "attendee":
        setEmail("john.doe@example.com");
        setPassword("password123");
        break;
    }
  };

  const isLoading = authLoading || isSubmitting;

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Login</CardTitle>
        <CardDescription>
          Enter your credentials to access your account.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="pl-10"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password *</Label>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="pl-10"
              />
            </div>
          </div>

          {/* Demo Credentials Buttons */}
          <div className="space-y-2 pt-2">
            <p className="text-sm font-medium text-gray-700">Quick Login:</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fillDemoCredentials("admin")}
                disabled={isLoading}
                className="text-xs"
              >
                Admin
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fillDemoCredentials("organizer")}
                disabled={isLoading}
                className="text-xs"
              >
                Organizer
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fillDemoCredentials("attendee")}
                disabled={isLoading}
                className="text-xs"
              >
                Attendee
              </Button>
            </div>
          </div>
        </CardContent>
        <CardContent>
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </Button>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Button
              type="button"
              variant="link"
              className="p-0"
              onClick={() => router.push("/register")}
              disabled={isLoading}
            >
              Sign up here
            </Button>
          </div>
        </CardContent>
      </form>
    </Card>
  );
}
