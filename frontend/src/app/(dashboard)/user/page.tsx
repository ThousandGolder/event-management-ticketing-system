"use client";

import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Users, Ticket, Calendar, User } from "lucide-react";

export default function UserDashboardPage() {
  const { user, isLoading } = useAuth();
  const [isClient, setIsClient] = useState(false);

  // Ensure this runs only on client to avoid SSR mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient || isLoading) return <p>Loading...</p>;

  if (!user) return <p>You must be logged in to view this page.</p>;

  return (
    <div className="p-6 space-y-6">
      {/* Welcome */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Welcome, {user.name}!</h1>
        <p className="text-sm text-muted-foreground">
          Role: {user.role} | Email: {user.email}
        </p>
      </div>

      {/* Dashboard cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Tickets */}
        <Link href="/dashboard/user/tickets">
          <Card className="hover:shadow-lg transition">
            <CardHeader className="flex items-center gap-2">
              <Ticket className="h-5 w-5 text-primary" />
              <CardTitle>Your Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>View all your booked tickets</CardDescription>
            </CardContent>
          </Card>
        </Link>

        {/* Events */}
        <Link href="/dashboard/user/events">
          <Card className="hover:shadow-lg transition">
            <CardHeader className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <CardTitle>Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>See events you are attending</CardDescription>
            </CardContent>
          </Card>
        </Link>

        {/* Profile */}
        <Link href="/dashboard/user/profile">
          <Card className="hover:shadow-lg transition">
            <CardHeader className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Update your personal information
              </CardDescription>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
