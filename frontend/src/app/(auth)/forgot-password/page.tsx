"use client";

import { useState } from "react";
import Link from "next/link";
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
import {
  ArrowLeft,
  CheckCircle,
  Loader2,
  Copy,
  ExternalLink,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resetToken, setResetToken] = useState("");
  const [resetLink, setResetLink] = useState("");
  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setResetToken("");
    setResetLink("");

    try {
      const response = await fetch(
        "http://localhost:3001/auth/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setIsSubmitted(true);

        // Store the reset token if returned
        if (data.resetToken) {
          setResetToken(data.resetToken);
          const link = `http://localhost:3000/reset-password?token=${data.resetToken}`;
          setResetLink(link);

          // Also save to localStorage for easy testing
          localStorage.setItem("last_reset_token", data.resetToken);
        }

        toast({
          title: "Success!",
          description: "Password reset link generated",
          variant: "default",
        });
      } else {
        throw new Error(data.message || "Failed to send reset link");
      }
    } catch (error: any) {
      console.error("Failed to send reset email:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send password reset link",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Copied to clipboard",
      variant: "default",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {!isSubmitted && (
                <Button variant="ghost" size="icon" className="h-6 w-6" >
                  <Link href="/login">
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                </Button>
              )}
              {isSubmitted ? "Check Your Email" : "Forgot Password"}
            </CardTitle>
            <CardDescription>
              {isSubmitted
                ? "We've sent you a password reset link"
                : "Enter your email to receive a password reset link"}
            </CardDescription>
          </CardHeader>

          {!isSubmitted ? (
            <form onSubmit={handleSubmit}>
              <CardContent>
                <div className="grid w-full items-center gap-4">
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Enter the email address associated with your account and
                    we'll send you a link to reset your password.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>
                <Button variant="ghost" className="w-full" >
                  <Link href="/login">Back to Login</Link>
                </Button>
              </CardFooter>
            </form>
          ) : (
            <CardContent>
              <div className="text-center py-8">
                <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Reset Link Generated!
                </h3>
                <p className="text-muted-foreground mb-6">
                  If an account exists with <strong>{email}</strong>, you will
                  receive a password reset link.
                </p>

                {/* Show reset token and link for testing */}
                {resetToken && (
                  <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">


                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs text-yellow-800 mb-1 block">
                          Reset Token:
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            value={resetToken}
                            readOnly
                            className="h-9 text-sm font-mono bg-white"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(resetToken)}
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs text-yellow-800 mb-1 block">
                          Reset Link:
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            value={resetLink}
                            readOnly
                            className="h-9 text-sm bg-white"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(resetLink)}
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="sm" variant="outline" >
                            <Link href={resetLink} target="_blank">
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground space-y-2">
                    <p>
                      ⚠️ <strong>Important:</strong> Check your spam folder if
                      you don't see the email.
                    </p>
                    <p>
                      Didn't receive the email?{" "}
                      <button
                        onClick={() => setIsSubmitted(false)}
                        className="text-primary hover:underline font-medium"
                        type="button"
                      >
                        Try again
                      </button>
                    </p>
                  </div>
                  <Button className="w-full" >
                    <Link href="/login">Return to Login</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
