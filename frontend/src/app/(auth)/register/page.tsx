"use client";

import { RegisterForm } from "@/components/auth/RegisterForm";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  return (
    <div className="w-full max-w-md">
      <RegisterForm />

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-center">
            Already have an account?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="w-full" >
            <Link href="/login">Sign In</Link>
          </Button>
          <div className="text-center text-sm text-muted-foreground mt-4">
            By registering, you agree to our{" "}
            <Link href="/terms" className="text-primary hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
