"use client";

import { useEffect, useState, useCallback } from "react";
import { UserManagement, User } from "@/components/admin/UserManagement";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  BarChart3,
  Settings,
  ShieldAlert,
  RefreshCw,
  UserPlus,
  AlertCircle,
} from "lucide-react";
import { UserChart } from "@/components/admin/UserChart";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/ui/use-toast";

// Create a simple Skeleton component inline since we don't have it
const Skeleton = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={`animate-pulse rounded-md bg-muted ${className}`}
    {...props}
  />
);

// Interface for API response
interface ApiUser {
  userId: string;
  email: string;
  username: string;
  name: string;
  userType: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  id: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: {
    users: ApiUser[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      nextKey: string | null;
    };
    stats: {
      totalUsers: number;
      activeUsers: number;
      adminUsers: number;
      organizerUsers: number;
      attendeeUsers: number;
      totalEvents: number;
      activeEvents: number;
      ticketsSold: number;
      totalRevenue: number;
    };
  };
}

export default function AdminDashboardPage() {
  const { user: authUser, token, logout, isAuthenticated } = useAuth(); // Get token from AuthProvider
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("users");
  const [error, setError] = useState<string | null>(null);

  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    activeEvents: 0,
    ticketsSold: 0,
    adminUsers: 0,
    organizerUsers: 0,
    attendeeUsers: 0,
    totalRevenue: 0,
  });

  // Fetch users from backend
  const fetchUsers = useCallback(async () => {
    try {
      setError(null);

      // Check if we have a token from AuthProvider
      if (!token || !isAuthenticated) {
        toast({
          title: "Authentication required",
          description: "Please login again",
          variant: "destructive",
        });
        logout();
        return;
      }

      const response = await fetch("http://localhost:3001/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401) {
        toast({
          title: "Session expired",
          description: "Please login again",
          variant: "destructive",
        });
        logout();
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();

      if (data.success) {
        // Transform API users to UserManagement component User type
        const transformedUsers: User[] = data.data.users.map(
          (apiUser, index) => ({
            id: index + 1, // Sequential ID for frontend
            name: apiUser.name,
            email: apiUser.email,
            role: formatRole(apiUser.userType),
            status: apiUser.status === "Active" ? "Active" : "Inactive",
            userId: apiUser.userId,
          })
        );

        setUsers(transformedUsers);
        setStats(data.data.stats);
      } else {
        throw new Error(data.message || "Failed to fetch users");
      }
    } catch (error: any) {
      console.error("Error fetching users:", error);
      setError(error.message || "Could not load data from server");
      toast({
        title: "Error fetching data",
        description: error.message || "Could not load users from server",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, isAuthenticated, logout, toast]);

  // Helper to format role for UserManagement component
  const formatRole = (userType: string): "Admin" | "Moderator" | "User" => {
    switch (userType.toLowerCase()) {
      case "admin":
        return "Admin";
      case "moderator":
        return "Moderator";
      case "organizer":
        return "Moderator";
      case "attendee":
        return "User";
      default:
        return "User";
    }
  };

  // Initial fetch - only if we have a token
  useEffect(() => {
    if (token && isAuthenticated) {
      fetchUsers();
    } else {
      setLoading(false);
    }
  }, [fetchUsers, token, isAuthenticated]);

  // Handle refresh
  const handleRefresh = () => {
    if (!token || !isAuthenticated) {
      toast({
        title: "Not authenticated",
        description: "Please login again",
        variant: "destructive",
      });
      logout();
      return;
    }
    setRefreshing(true);
    fetchUsers();
  };

  // Handle user updates from UserManagement component
  const handleUserUpdate = (updatedUsers: User[]) => {
    setUsers(updatedUsers);
    toast({
      title: "Users updated",
      description: "User list has been updated (frontend only)",
    });
  };

  // Handle create new user
  const handleCreateUser = () => {
    toast({
      title: "Feature coming soon",
      description: "User creation will be available in the next update",
    });
  };

  // Render loading state
  if (loading && !refreshing) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Stats skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>

        {/* Content skeleton */}
        <Skeleton className="h-64 rounded-lg" />
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Unable to load dashboard</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <div className="flex gap-2 justify-center">
            <Button onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
            <Button variant="outline" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Render not authenticated state
  if (!isAuthenticated || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Not Authenticated</h2>
          <p className="text-muted-foreground mb-6">
            Please login to access the admin dashboard
          </p>
          <div className="flex gap-2 justify-center">
            <Button onClick={() => (window.location.href = "/login")}>
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome,{" "}
            <span className="font-semibold text-primary">{authUser?.name}</span>
            ! Manage platform users and settings
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex-1 sm:flex-none"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
            />
            {refreshing ? "Refreshing..." : "Refresh Data"}
          </Button>
          <Button onClick={handleCreateUser} className="flex-1 sm:flex-none">
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
          <Button variant="destructive" className="flex-1 sm:flex-none">
            <ShieldAlert className="h-4 w-4 mr-2" />
            System Health
          </Button>
        </div>
      </div>

      {/* REAL-TIME STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          change={`${stats.activeUsers} active`}
        />
        <StatCard
          title="Admins"
          value={stats.adminUsers}
          change="Platform managers"
        />
        <StatCard
          title="Organizers"
          value={stats.organizerUsers}
          change="Event creators"
        />
        <StatCard
          title="Attendees"
          value={stats.attendeeUsers}
          change="Event participants"
        />
      </div>

      {/* MAIN CONTENT TABS */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid grid-cols-3 max-w-md">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Users</span>
            <BadgeCount count={users.length} />
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span>Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </TabsTrigger>
        </TabsList>

        {/* ================= USERS TAB ================= */}
        <TabsContent value="users" className="space-y-4">
          {/* Using the UserManagement component */}
          <UserManagement users={users} setUsers={handleUserUpdate} />
        </TabsContent>

        {/* ================= ANALYTICS TAB ================= */}
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Platform Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              {users.length > 0 ? (
                <UserChart users={users} />
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No user data available for analytics
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================= SETTINGS TAB ================= */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Platform Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold">General Settings</h3>
                <Button variant="outline" className="w-full justify-start">
                  Site Configuration
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Email Templates
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Notification Settings
                </Button>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Security</h3>
                <Button variant="outline" className="w-full justify-start">
                  Password Policies
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Session Management
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  API Keys
                </Button>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Advanced</h3>
                <Button variant="outline" className="w-full justify-start">
                  Database Management
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Backup & Restore
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Logs & Monitoring
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* -----------------------------
   STAT CARD COMPONENT
-------------------------------- */
function StatCard({
  title,
  value,
  change,
}: {
  title: string;
  value: number;
  change: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          <p className="text-xs text-muted-foreground mt-1">{change}</p>
        </div>
      </CardContent>
    </Card>
  );
}

/* -----------------------------
   BADGE COUNT COMPONENT
-------------------------------- */
function BadgeCount({ count }: { count: number }) {
  return (
    <span className="inline-flex items-center justify-center min-w-6 h-6 text-xs font-medium bg-primary text-primary-foreground rounded-full px-1.5">
      {count > 99 ? "99+" : count}
    </span>
  );
}

/* -----------------------------
   STAT ROW COMPONENT
-------------------------------- */
function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
