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
import { useToast } from "@/components/ui/use-toast";

export default function LoginPage() {
  const { toast } = useToast();

  // Function to show demo credentials in a toast
 const showDemoCredentials = () => {
   toast({
     title: "Demo Credentials",
     description: "Use these credentials to test the login:",
     variant: "default",
   });

   // Show a second toast with the details
   setTimeout(() => {
     toast({
       title: "Login Details",
       description:
         "Admin: admin@events.com (password123)\nOrganizer: organizer@events.com (password123)\nAttendee: john.doe@example.com (password123)",
       variant: "default",
     });
   }, 100);
 };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Your LoginForm component handles the actual login */}
            <LoginForm />

            {/* Demo credentials section */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
              <p className="text-sm font-medium text-gray-700 mb-2 text-center">
                Need test credentials?
              </p>
              <div className="flex justify-center">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={showDemoCredentials}
                  className="w-full"
                >
                  Show Demo Credentials
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Other options card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-center text-lg">Other Options</CardTitle>
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
              <Link
                href="/register"
                className="text-primary hover:underline font-medium"
              >
                Sign up here
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Quick access info */}
        <div className="mt-4 text-center text-xs text-gray-500">
          <p>Note: You must click the "Sign In" button in the form to login.</p>
          <p className="mt-1">No auto-login feature is enabled.</p>
        </div>
      </div>
    </div>
  );
}
