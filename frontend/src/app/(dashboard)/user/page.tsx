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

// Define interfaces based on ACTUAL backend responses
interface UserEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  city: string;
  category: string;
  ticketsSold: number;
  totalTickets: number;
  revenue: number;
  status: "active" | "upcoming" | "completed" | "draft" | "cancelled";
  role: "organizer" | "attendee";
  registrationDate?: string;
  ticketCount?: number;
  ticketNumbers?: string[];
  isSaved?: boolean;
  imageUrl?: string;
  organizer?: string;
}

interface UserTicket {
  id: string;
  ticketId: string;
  ticketNumber: string;
  eventId: string;
  eventName: string;
  userId: string;
  purchaseDate: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  status: "confirmed" | "pending" | "cancelled" | "checked_in";
  paymentMethod?: string;
  paymentStatus?: string;
  transactionId?: string;
  checkInTime?: string;
  checkInBy?: string;
  createdAt: string;
  updatedAt: string;
  eventDate?: string;
  location?: string;
  city?: string;
}

interface UserStats {
  totalTickets: number;
  ticketsPurchased: number;
  organizedEvents: number;
  attendingEvents: number;
  upcomingOrganized: number;
  pastOrganized: number;
  upcomingAttending: number;
  pastAttending: number;
  organizedTicketsSold: number;
  organizedRevenue: number;
  totalSpent: number;
  averageTicketPrice: number;
  organizedCompletionRate: number;
  attendanceRate: number;
}

// Response interfaces with error handling
interface UserTicketsResponse {
  success: boolean;
  data: UserTicket[];
  tickets: UserTicket[];
  count: number;
  userId: string;
  timestamp: string;
  error?: string;
  message?: string;
}

interface UserEventsResponse {
  success: boolean;
  events: UserEvent[];
  counts: {
    attending: number;
    organizing: number;
    past: number;
    saved: number;
  };
  user: {
    id: string;
  };
  error?: string;
  message?: string;
}

interface UserStatsResponse {
  success: boolean;
  stats: UserStats;
  user: {
    id: string;
    name: string;
    email: string;
  };
  summary: {
    message: string;
    activeTickets: number;
  };
  error?: string;
  message?: string;
}

export default function UserDashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [userEvents, setUserEvents] = useState<UserEvent[]>([]);
  const [userTickets, setUserTickets] = useState<UserTicket[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [userId, setUserId] = useState<string>("");

  // Determine which user ID to use
  useEffect(() => {
    const currentUserId = user?.id || "test-user-001";
    setUserId(currentUserId);
  }, [user]);

  // Fetch user tickets from backend
  const fetchUserTickets = async (): Promise<UserTicket[]> => {
    try {
      const response = await fetch(
        `http://localhost:3001/user/tickets?userId=${userId}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Check if response is not OK
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: UserTicketsResponse = await response.json();

      if (result.success) {
        // Use either data or tickets array (they're duplicates)
        const tickets = result.data || result.tickets || [];
        setUserTickets(tickets);
        return tickets;
      } else {
        // Handle case where success is false
        const errorMessage =
          result.error || result.message || "Failed to fetch tickets";
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("Error fetching user tickets:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to load your tickets",
        variant: "destructive",
      });
      setUserTickets([]);
      return [];
    }
  };

  // Fetch user events from backend
  const fetchUserEvents = async (): Promise<UserEvent[]> => {
    try {
      const response = await fetch(
        `http://localhost:3001/user/events?userId=${userId}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Check if response is not OK
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: UserEventsResponse = await response.json();

      if (result.success) {
        setUserEvents(result.events || []);
        return result.events || [];
      } else {
        // Handle case where success is false
        const errorMessage =
          result.error || result.message || "Failed to fetch events";
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("Error fetching user events:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to load your events",
        variant: "destructive",
      });
      setUserEvents([]);
      return [];
    }
  };

  // Fetch user statistics from backend
  const fetchUserStats = async (): Promise<UserStats | null> => {
    try {
      const response = await fetch(
        `http://localhost:3001/user/stats?userId=${userId}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Check if response is not OK
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: UserStatsResponse = await response.json();

      if (result.success) {
        setUserStats(result.stats);
        return result.stats;
      } else {
        // Handle case where success is false
        const errorMessage =
          result.error || result.message || "Failed to fetch stats";
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("Error fetching user stats:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to load your statistics",
        variant: "destructive",
      });
      setUserStats(null);
      return null;
    }
  };

  // Fetch all user data
  const fetchUserData = async () => {
    try {
      setLoading(true);

      // Fetch all data in parallel
      const [tickets, events, stats] = await Promise.all([
        fetchUserTickets(),
        fetchUserEvents(),
        fetchUserStats(),
      ]);

      // If stats weren't fetched, calculate basic stats from tickets and events
      if (!stats) {
        const calculatedStats: UserStats = {
          totalTickets: tickets.length,
          ticketsPurchased: tickets.reduce(
            (sum, ticket) => sum + ticket.quantity,
            0
          ),
          organizedEvents: 0, // This user is not an organizer
          attendingEvents: events.filter((e) => e.role === "attendee").length,
          upcomingOrganized: 0,
          pastOrganized: 0,
          upcomingAttending: events.filter(
            (e) =>
              e.role === "attendee" &&
              (e.status === "upcoming" || e.status === "active")
          ).length,
          pastAttending: events.filter(
            (e) => e.role === "attendee" && e.status === "completed"
          ).length,
          organizedTicketsSold: 0,
          organizedRevenue: 0,
          totalSpent: tickets.reduce(
            (sum, ticket) => sum + ticket.totalAmount,
            0
          ),
          averageTicketPrice:
            tickets.length > 0
              ? tickets.reduce((sum, ticket) => sum + ticket.unitPrice, 0) /
                tickets.length
              : 0,
          organizedCompletionRate: 0,
          attendanceRate: 0,
        };
        setUserStats(calculatedStats);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
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
      case "upcoming":
        return "text-orange-600 bg-orange-100";
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
      case "upcoming":
        return <Calendar className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

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

  // Calculate derived values for display
  const totalTicketsQuantity = userTickets.reduce(
    (sum, ticket) => sum + ticket.quantity,
    0
  );
  const totalSpent = userTickets.reduce(
    (sum, ticket) => sum + ticket.totalAmount,
    0
  );
  const checkedInTickets = userTickets.filter(
    (ticket) => ticket.status === "checked_in"
  ).length;
  const favoriteCategory = getMostFrequentCategory(userEvents);
  const upcomingEventsCount = userEvents.filter(
    (event) =>
      event.role === "attendee" &&
      (event.status === "upcoming" || event.status === "active")
  ).length;

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
          disabled={loading}
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
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
              <div className="text-2xl font-bold">{totalTicketsQuantity}</div>
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
                {formatCurrency(totalSpent)}
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
              <div className="text-2xl font-bold">{checkedInTickets}</div>
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
                {favoriteCategory.toLowerCase()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Most attended
              </p>
            </CardContent>
          </Card>
        </div>
      ) : loading ? (
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
                {loading ? (
                  <div className="text-sm text-muted-foreground">
                    <span className="inline-block h-4 w-32 bg-muted animate-pulse rounded"></span>
                  </div>
                ) : (
                  <CardDescription>
                    {userTickets.length} purchases • {checkedInTickets} checked
                    in
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
                <CardTitle>Your Events</CardTitle>
                {loading ? (
                  <div className="text-sm text-muted-foreground">
                    <span className="inline-block h-4 w-32 bg-muted animate-pulse rounded"></span>
                  </div>
                ) : (
                  <CardDescription>
                    {userEvents.length} events • {upcomingEventsCount} upcoming
                  </CardDescription>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                View events you're attending or organizing
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

      {/* Your Events */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Your Events</h2>
          <Link href="/user/events">
            <Button variant="ghost" size="sm">
              View All Events
            </Button>
          </Link>
        </div>

        {loading ? (
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
                        {event.date}
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
                      <Users className="h-4 w-4 mr-2" />
                      {event.ticketsSold} sold • {event.totalTickets} total
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
                You haven't purchased tickets for any events yet
              </p>
              <Link href="/events">
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

        {loading ? (
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
                            Qty: {ticket.quantity} • {ticket.city}
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
              <Link href="/events">
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
          {loading
            ? " Loading..."
            : ` Tickets: ${userTickets.length} • Events: ${userEvents.length}`}{" "}
          • Last updated: {new Date().toLocaleTimeString()}
        </p>
        <p className="text-xs mt-1">
          Using user ID: {userId} • All data fetched from your backend server
        </p>
      </div>
    </div>
  );
}
