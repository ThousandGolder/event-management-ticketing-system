"use client";

import LoginForm from "@/components/auth/LoginForm";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <div className="w-full max-w-md">
      <LoginForm />

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-center">Other Options</CardTitle>
          <CardDescription className="text-center">
            Need help accessing your account?
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button variant="outline" >
            <Link href="/forgot-password">Forgot Password?</Link>
          </Button>
          <div className="text-center text-sm text-muted-foreground mt-4">
            Don't have an account?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
