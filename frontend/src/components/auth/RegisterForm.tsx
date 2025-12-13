"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toastError, toastSuccess } from "@/components/ui/toaster-simple";

export function RegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    userType: "attendee", // ✅ backend-required field
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ Strong frontend validation
    if (
      !formData.username.trim() ||
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.password.trim()
    ) {
      toastError("Validation error", "All fields are required");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toastError("Validation error", "Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      toastError(
        "Weak password",
        "Password must be at least 6 characters"
      );
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        "http://localhost:3001/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: formData.username.trim(),
            name: formData.name.trim(),
            email: formData.email.trim().toLowerCase(),
            password: formData.password,
            userType: formData.userType,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || data?.error || "Registration failed");
      }

      toastSuccess(
        "Account created 🎉",
        "You can now log in to your account"
      );

      router.push("/login");
    } catch (error: any) {
      toastError("Registration failed", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-[420px]">
      <CardHeader>
        <CardTitle>Create Account</CardTitle>
        <CardDescription>
          Register to access EventHub
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              placeholder="john_doe"
              value={formData.username}
              onChange={handleChange}
              disabled={isLoading}
              required
            />
          </div>

          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              disabled={isLoading}
              required
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
              required
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
              required
            />
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={isLoading}
              required
            />
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/login")}
            disabled={isLoading}
          >
            Back to Login
          </Button>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Creating..." : "Register"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
