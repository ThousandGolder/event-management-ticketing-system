"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Ticket,
  Calendar,
  User,
  Clock,
  MapPin,
  Users,
  DollarSign,
  AlertCircle,
  RefreshCw,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import Link from "next/link";

interface UserEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  price: number;
  ticketsSold: number;
  capacity: number;
  status: "active" | "pending" | "completed" | "cancelled";
  imageUrl?: string;
}

interface UserTicket {
  id: string;
  eventId: string;
  eventName: string;
  ticketNumber: string;
  purchaseDate: string;
  quantity: number;
  totalAmount: number;
  status: "confirmed" | "pending" | "cancelled" | "checked_in";
  checkInTime?: string;
  unitPrice?: number;
  transactionId?: string;
  paymentMethod?: string;
  paymentStatus?: string;
}

interface UserStats {
  totalTickets: number;
  upcomingEvents: number;
  totalSpent: number;
  favoriteCategory: string;
  checkedInTickets: number;
}

export default function UserDashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [userEvents, setUserEvents] = useState<UserEvent[]>([]);
  const [userTickets, setUserTickets] = useState<UserTicket[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [userId, setUserId] = useState<string>("");

  // Determine which user ID to use
  useEffect(() => {
    // For development, use test-user-001
    // In production, replace with actual user ID from auth
    const currentUserId = user?.id || "test-user-001";
    setUserId(currentUserId);
  }, [user]);

  // Fetch user tickets from backend
  const fetchUserTickets = async () => {
    if (!userId) return;

    try {
      setLoadingTickets(true);

      const response = await fetch(
        `http://localhost:3001/user/tickets?userId=${userId}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (result.success) {
        setUserTickets(result.data);
        console.log("✅ Fetched tickets:", result.data.length, "tickets");
      } else {
        console.error("Failed to fetch tickets:", result.error);
        toast({
          title: "Error",
          description: "Failed to load your tickets",
          variant: "destructive",
        });
        setUserTickets([]);
      }
    } catch (error) {
      console.error("Error fetching user tickets:", error);
      toast({
        title: "Network Error",
        description: "Could not connect to backend",
        variant: "destructive",
      });
      setUserTickets([]);
    } finally {
      setLoadingTickets(false);
    }
  };

  // Fetch user events from backend
  const fetchUserEvents = async () => {
    try {
      setLoadingEvents(true);

      const response = await fetch(`http://localhost:3001/events`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (result.success) {
        const allEvents = result.events || result.data || [];

        // Get event IDs from user's tickets
        const userEventIds = [
          ...new Set(userTickets.map((ticket) => ticket.eventId)),
        ];

        // Filter events to only show events user has tickets for
        const userEvents = allEvents.filter((event: UserEvent) =>
          userEventIds.includes(event.id)
        );

        setUserEvents(userEvents.slice(0, 10)); // Show up to 10 events
        console.log(" Fetched user events:", userEvents.length, "events");
      } else {
        console.error("Failed to fetch events:", result.error);
        setUserEvents([]);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      setUserEvents([]);
    } finally {
      setLoadingEvents(false);
    }
  };

  // Calculate user statistics from real data
  const calculateUserStats = () => {
    if (userTickets.length === 0 && userEvents.length === 0) {
      setUserStats(null);
      return;
    }

    const stats: UserStats = {
      totalTickets: userTickets.reduce(
        (sum, ticket) => sum + ticket.quantity,
        0
      ),
      upcomingEvents: userEvents.filter(
        (event) =>
          new Date(event.date) > new Date() && event.status === "active"
      ).length,
      totalSpent: userTickets.reduce(
        (sum, ticket) => sum + ticket.totalAmount,
        0
      ),
      favoriteCategory: getMostFrequentCategory(userEvents),
      checkedInTickets: userTickets.filter(
        (ticket) => ticket.status === "checked_in"
      ).length,
    };

    setUserStats(stats);
  };

  // Fetch all user data
  const fetchUserData = async () => {
    try {
      setLoading(true);

      // Fetch tickets first
      await fetchUserTickets();

      // Then fetch events (depends on tickets data)
      await fetchUserEvents();

      // Calculate stats after both are fetched
      calculateUserStats();
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Refresh data when userId changes
  useEffect(() => {
    if (userId && !authLoading) {
      fetchUserData();
    }
  }, [userId, authLoading]);

  const getMostFrequentCategory = (events: UserEvent[]) => {
    if (events.length === 0) return "No events";

    const categories = events.map((event) => event.category || "General");
    const frequency: Record<string, number> = {};

    categories.forEach((category) => {
      frequency[category] = (frequency[category] || 0) + 1;
    });

    const mostFrequent = Object.entries(frequency).sort(
      (a, b) => b[1] - a[1]
    )[0]?.[0];
    return mostFrequent || "General";
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Date not set";

    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "Invalid date";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
      case "confirmed":
        return "text-green-600 bg-green-100";
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "cancelled":
        return "text-red-600 bg-red-100";
      case "completed":
        return "text-blue-600 bg-blue-100";
      case "checked_in":
        return "text-purple-600 bg-purple-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
      case "confirmed":
        return <CheckCircle className="h-4 w-4" />;
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      case "checked_in":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  // Get confirmed tickets
  const confirmedTickets = userTickets.filter(
    (t) => t.status === "confirmed" || t.status === "checked_in"
  );

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
        <p className="text-muted-foreground mb-4">
          You need to be logged in to view your dashboard
        </p>
        <Link href="/auth/login">
          <Button>Login to Continue</Button>
        </Link>
      </div>
    );
  }

  const totalLoading = loading || loadingTickets || loadingEvents;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold">
            Welcome back, {user.name || "User"}!
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Here's what's happening with your events and tickets
          </p>
          <p className="text-xs text-muted-foreground">
            User ID: {userId} • Data from backend API
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchUserData}
          disabled={totalLoading}
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${totalLoading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Stats Overview */}
      {userStats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Tickets
              </CardTitle>
              <Ticket className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.totalTickets}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {userTickets.length} purchases
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <DollarSign className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(userStats.totalSpent)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Across all tickets
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Checked In</CardTitle>
              <CheckCircle className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {userStats.checkedInTickets}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Tickets used</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Favorite Category
              </CardTitle>
              <Users className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">
                {userStats.favoriteCategory.toLowerCase()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Most attended
              </p>
            </CardContent>
          </Card>
        </div>
      ) : totalLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="h-4 w-20 bg-muted animate-pulse rounded"></div>
                <div className="h-5 w-5 bg-muted animate-pulse rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-muted animate-pulse rounded mb-2"></div>
                <div className="h-3 w-24 bg-muted animate-pulse rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No Data Available</h3>
            <p className="text-muted-foreground mb-4">
              Purchase tickets to see your dashboard stats
            </p>
            <Link href="/user/events">
              <Button>Browse Events</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/user/tickets">
          <Card className="hover:shadow-lg transition cursor-pointer border-primary/20 hover:border-primary/40 h-full">
            <CardHeader className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Ticket className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Your Tickets</CardTitle>
                {loadingTickets ? (
                  <div className="text-sm text-muted-foreground">
                    <span className="inline-block h-4 w-32 bg-muted animate-pulse rounded"></span>
                  </div>
                ) : (
                  <CardDescription>
                    {userTickets.length} purchases • {confirmedTickets.length}{" "}
                    confirmed
                  </CardDescription>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                View all your booked tickets and check-in status
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/user/events">
          <Card className="hover:shadow-lg transition cursor-pointer border-primary/20 hover:border-primary/40 h-full">
            <CardHeader className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Browse Events</CardTitle>
                {loadingEvents ? (
                  <div className="text-sm text-muted-foreground">
                    <span className="inline-block h-4 w-32 bg-muted animate-pulse rounded"></span>
                  </div>
                ) : (
                  <CardDescription>
                    {userEvents.length} your events •{" "}
                    {userStats?.upcomingEvents || 0} upcoming
                  </CardDescription>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Discover and book tickets for exciting events
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/user/profile">
          <Card className="hover:shadow-lg transition cursor-pointer border-primary/20 hover:border-primary/40 h-full">
            <CardHeader className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>
                  Update your personal information
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Manage your account details and preferences
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Your Events with Tickets */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Your Events</h2>
          <Link href="/events">
            <Button variant="ghost" size="sm">
              Browse All Events
            </Button>
          </Link>
        </div>

        {loadingEvents ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="h-6 w-32 bg-muted animate-pulse rounded mb-2"></div>
                  <div className="h-4 w-full bg-muted animate-pulse rounded"></div>
                  <div className="h-4 w-3/4 bg-muted animate-pulse rounded mt-1"></div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="h-4 w-24 bg-muted animate-pulse rounded"></div>
                  <div className="h-4 w-32 bg-muted animate-pulse rounded"></div>
                  <div className="h-4 w-20 bg-muted animate-pulse rounded"></div>
                  <div className="h-10 w-full bg-muted animate-pulse rounded mt-2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : userEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userEvents.slice(0, 3).map((event) => {
              const eventTickets = userTickets.filter(
                (t) => t.eventId === event.id
              );
              const totalTickets = eventTickets.reduce(
                (sum, t) => sum + t.quantity,
                0
              );

              return (
                <Card
                  key={event.id}
                  className="overflow-hidden hover:shadow-md transition"
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg line-clamp-1">
                        {event.title || `Event ${event.id}`}
                      </CardTitle>
                      <span
                        className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 ${getStatusColor(
                          event.status
                        )}`}
                      >
                        {getStatusIcon(event.status)}
                        {event.status}
                      </span>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {event.description || "No description available"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-2" />
                        {formatDate(event.date)}
                      </div>
                      <div className="text-sm font-medium">
                        {totalTickets} ticket{totalTickets !== 1 ? "s" : ""}
                      </div>
                    </div>
                    {event.location && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    )}
                    <div className="flex items-center text-sm text-muted-foreground">
                      <DollarSign className="h-4 w-4 mr-2" />
                      {formatCurrency(event.price || 0)}
                    </div>
                    <div className="pt-2">
                      <Link href={`/events/${event.id}`} className="w-full">
                        <Button className="w-full">View Details</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No Events Found</h3>
              <p className="text-muted-foreground mb-4">
                {userTickets.length > 0
                  ? "We couldn't find event details for your tickets"
                  : "You haven't purchased tickets for any events yet"}
              </p>
              <Link href="/user/events">
                <Button>Browse Events</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Tickets */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Recent Tickets</h2>
          <Link href="/user/tickets">
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </Link>
        </div>

        {loadingTickets ? (
          <Card>
            <CardContent className="p-0">
              <div className="p-4 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="space-y-2">
                      <div className="h-4 w-32 bg-muted animate-pulse rounded"></div>
                      <div className="h-3 w-24 bg-muted animate-pulse rounded"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 w-20 bg-muted animate-pulse rounded"></div>
                      <div className="h-3 w-16 bg-muted animate-pulse rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : userTickets.length > 0 ? (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-4 font-medium">Event</th>
                      <th className="text-left p-4 font-medium">Ticket #</th>
                      <th className="text-left p-4 font-medium">
                        Purchase Date
                      </th>
                      <th className="text-left p-4 font-medium">Amount</th>
                      <th className="text-left p-4 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {userTickets.slice(0, 5).map((ticket) => (
                      <tr key={ticket.id} className="hover:bg-muted/30">
                        <td className="p-4">
                          <div className="font-medium">{ticket.eventName}</div>
                          <div className="text-sm text-muted-foreground">
                            Qty: {ticket.quantity}
                          </div>
                        </td>
                        <td className="p-4">
                          <code className="text-sm bg-muted px-2 py-1 rounded">
                            {ticket.ticketNumber}
                          </code>
                        </td>
                        <td className="p-4 text-sm">
                          {formatDate(ticket.purchaseDate)}
                        </td>
                        <td className="p-4 font-medium">
                          {formatCurrency(ticket.totalAmount)}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 w-fit ${getStatusColor(
                              ticket.status
                            )}`}
                          >
                            {getStatusIcon(ticket.status)}
                            {ticket.status.replace("_", " ")}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <Ticket className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No Tickets Yet</h3>
              <p className="text-muted-foreground mb-4">
                Purchase tickets to events to see them here
              </p>
              <Link href="/user/events">
                <Button>Browse Events</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Data Source Info */}
      <div className="text-center text-sm text-muted-foreground pt-4 border-t">
        <p>
          Dashboard data loaded from backend API •
          {loadingTickets
            ? " Loading tickets..."
            : ` Tickets: ${userTickets.length}`}{" "}
          •
          {loadingEvents
            ? " Loading events..."
            : ` Events: ${userEvents.length}`}{" "}
          • Last updated: {new Date().toLocaleTimeString()}
        </p>
        <p className="text-xs mt-1">
          Using user ID: {userId} • All data fetched from your backend server
        </p>
      </div>
    </div>
  );
}
