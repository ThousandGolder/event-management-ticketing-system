"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  Download,
  Eye,
  Filter,
  Search,
  Ticket,
  Calendar,
  MapPin,
  Users,
  CreditCard,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  ChevronRight,
} from "lucide-react";
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
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";

// Simple Separator component
const Separator = ({ className }: { className?: string }) => (
  <div className={`h-[1px] w-full bg-gray-200 ${className}`} />
);

// Simple Badge component
const Badge = ({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: "default" | "secondary" | "destructive" | "outline" | "success";
  className?: string;
}) => {
  const variantStyles = {
    default: "bg-blue-100 text-blue-800",
    secondary: "bg-gray-100 text-gray-800",
    destructive: "bg-red-100 text-red-800",
    outline: "border border-gray-300 text-gray-700 bg-transparent",
    success: "bg-green-100 text-green-800",
  };

  return (
    <div
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${variantStyles[variant]} ${className}`}
    >
      {children}
    </div>
  );
};

interface TicketItem {
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
  status: "confirmed" | "pending" | "cancelled" | "checked_in" | "refunded";
  paymentMethod: string;
  paymentStatus: string;
  transactionId?: string;
  checkInTime?: string;
  checkInBy?: string;
  createdAt: string;
  updatedAt: string;
  eventDate?: string;
  location?: string;
  city?: string;
}

export default function UserTicketsPage() {
  const router = useRouter();
  const { user, token, logout } = useAuth();
  const { toast } = useToast();

  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<TicketItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const filters = [
    { id: "all", label: "All", icon: Ticket },
    { id: "confirmed", label: "Confirmed", icon: CheckCircle },
    { id: "pending", label: "Pending", icon: Clock },
    { id: "cancelled", label: "Cancelled", icon: XCircle },
    { id: "checked_in", label: "Attended", icon: CheckCircle },
  ];

  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      setRefreshing(true);

      if (!token || !user) {
        console.log("No token or user found");
        showMockTickets();
        return;
      }

      const url = `http://localhost:3001/user/tickets?userId=${user.id}`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      if (res.status === 401) {
        toast({
          title: "Session expired",
          description: "Please login again",
          variant: "destructive",
        });
        logout();
        showMockTickets();
        return;
      }

      if (!res.ok) {
        console.log(`HTTP ${res.status}: ${res.statusText}`);
        showMockTickets();
        return;
      }

      const data = await res.json();

      const ticketsData = data.data || data.tickets || [];

      if (Array.isArray(ticketsData)) {
        const transformedTickets: TicketItem[] = ticketsData.map(
          (ticket: any) => ({
            id: ticket.id || ticket.ticketId || `ticket-${Date.now()}`,
            ticketId: ticket.ticketId || ticket.id || `TKT-${Date.now()}`,
            ticketNumber:
              ticket.ticketNumber ||
              ticket.ticketId ||
              `TKT-${ticket.id?.substring(0, 8) || "000000"}`,
            eventId: ticket.eventId || "event-unknown",
            eventName: ticket.eventName || ticket.event?.title || "Event",
            userId: ticket.userId || user.id,
            purchaseDate:
              ticket.purchaseDate ||
              ticket.createdAt ||
              new Date().toISOString(),
            quantity: ticket.quantity || 1,
            unitPrice: ticket.unitPrice || ticket.price || 0,
            totalAmount:
              ticket.totalAmount ||
              (ticket.quantity || 1) * (ticket.unitPrice || 0),
            status: (ticket.status || "pending") as TicketItem["status"],
            paymentMethod: ticket.paymentMethod || "unknown",
            paymentStatus: ticket.paymentStatus || "pending",
            transactionId: ticket.transactionId,
            checkInTime: ticket.checkInTime,
            checkInBy: ticket.checkInBy,
            createdAt: ticket.createdAt || new Date().toISOString(),
            updatedAt: ticket.updatedAt || new Date().toISOString(),
            eventDate: ticket.eventDate || ticket.event?.date,
            location: ticket.location || ticket.event?.location,
            city: ticket.city || ticket.event?.city,
          })
        );

        setTickets(transformedTickets);
        setFilteredTickets(transformedTickets);

        toast({
          title: "Tickets loaded successfully",
          description: `Found ${transformedTickets.length} ticket(s)`,
        });
      } else {
        showMockTickets();
      }
    } catch (err: any) {
      console.error("Error fetching tickets:", err);
      showMockTickets();

      toast({
        title: "Using demo data",
        description: "Could not connect to server, showing demo data",
        variant: "default",
      });
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const showMockTickets = () => {
    const mockTickets: TicketItem[] = [
      {
        id: "ticket-001",
        ticketId: "TKT-001234",
        ticketNumber: "TKT-001234",
        eventId: "event-001",
        eventName: "Tech Conference 2024",
        userId: user?.id || "user-001",
        purchaseDate: "2024-12-01",
        quantity: 2,
        unitPrice: 50,
        totalAmount: 100,
        status: "confirmed",
        paymentMethod: "card",
        paymentStatus: "paid",
        transactionId: "TRX-123456",
        checkInTime: "2024-12-15 09:15",
        checkInBy: "Staff-001",
        createdAt: "2024-12-01T10:30:00Z",
        updatedAt: "2024-12-15T09:15:00Z",
        eventDate: "2024-12-15",
        location: "Convention Center",
        city: "San Francisco",
      },
      {
        id: "ticket-002",
        ticketId: "TKT-001235",
        ticketNumber: "TKT-001235",
        eventId: "event-002",
        eventName: "Music Festival",
        userId: user?.id || "user-001",
        purchaseDate: "2024-11-25",
        quantity: 1,
        unitPrice: 75,
        totalAmount: 75,
        status: "pending",
        paymentMethod: "wallet",
        paymentStatus: "processing",
        transactionId: "TRX-123457",
        createdAt: "2024-11-25T14:20:00Z",
        updatedAt: "2024-11-25T14:20:00Z",
        eventDate: "2025-01-20",
        location: "Central Park",
        city: "New York",
      },
      {
        id: "ticket-003",
        ticketId: "TKT-001236",
        ticketNumber: "TKT-001236",
        eventId: "event-003",
        eventName: "Business Networking",
        userId: user?.id || "user-001",
        purchaseDate: "2024-10-15",
        quantity: 1,
        unitPrice: 30,
        totalAmount: 30,
        status: "checked_in",
        paymentMethod: "card",
        paymentStatus: "paid",
        transactionId: "TRX-123458",
        checkInTime: "2024-11-10 18:30",
        checkInBy: "Staff-002",
        createdAt: "2024-10-15T09:45:00Z",
        updatedAt: "2024-11-10T18:30:00Z",
        eventDate: "2024-11-10",
        location: "Business Center",
        city: "Chicago",
      },
    ];

    setTickets(mockTickets);
    setFilteredTickets(mockTickets);
  };

  useEffect(() => {
    if (user) {
      fetchTickets();
    } else {
      setIsLoading(true);
    }
  }, [user]);

  useEffect(() => {
    let results = tickets;

    if (activeFilter !== "all") {
      results = results.filter((ticket) => ticket.status === activeFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        (ticket) =>
          ticket.eventName.toLowerCase().includes(query) ||
          ticket.ticketNumber.toLowerCase().includes(query) ||
          ticket.location?.toLowerCase().includes(query) ||
          ticket.city?.toLowerCase().includes(query)
      );
    }

    setFilteredTickets(results);
  }, [activeFilter, searchQuery, tickets]);

  const handleDownloadTicket = async (ticket: TicketItem) => {
    try {
      setDownloadingId(ticket.id);

      const ticketContent = `
==========================================
            EVENT TICKET
==========================================

EVENT: ${ticket.eventName}
TICKET: ${ticket.ticketNumber}
DATE: ${
        ticket.eventDate
          ? new Date(ticket.eventDate).toLocaleDateString()
          : "N/A"
      }
QUANTITY: ${ticket.quantity} ticket(s)
TOTAL: $${ticket.totalAmount}
STATUS: ${ticket.status.toUpperCase()}

==========================================
       TICKET HOLDER INFORMATION
==========================================

NAME: ${user?.name || "Ticket Holder"}
EMAIL: ${user?.email || "N/A"}
PURCHASE DATE: ${new Date(ticket.purchaseDate).toLocaleDateString()}

==========================================
         EVENT INFORMATION
==========================================

LOCATION: ${ticket.location || "N/A"}
CITY: ${ticket.city || "N/A"}

==========================================
         IMPORTANT INFORMATION
==========================================

1. Please bring this ticket and valid ID
2. Ticket is non-transferable
3. No refunds after event starts
4. Valid for one entry only

==========================================
Generated on: ${new Date().toLocaleDateString()}
==========================================
      `;

      const blob = new Blob([ticketContent], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ticket-${ticket.ticketNumber}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Ticket downloaded",
        description: `Ticket ${ticket.ticketNumber} downloaded successfully`,
      });
    } catch (error) {
      console.error("Error downloading ticket:", error);
      toast({
        title: "Download failed",
        description: "Failed to download ticket. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDownloadingId(null);
    }
  };

  const getStatusBadge = (status: TicketItem["status"]) => {
    const config = {
      confirmed: {
        label: "Confirmed",
        variant: "success" as const,
        icon: CheckCircle,
      },
      pending: { label: "Pending", variant: "secondary" as const, icon: Clock },
      cancelled: {
        label: "Cancelled",
        variant: "destructive" as const,
        icon: XCircle,
      },
      checked_in: {
        label: "Attended",
        variant: "success" as const,
        icon: CheckCircle,
      },
      refunded: {
        label: "Refunded",
        variant: "outline" as const,
        icon: XCircle,
      },
    };

    const { label, variant, icon: Icon } = config[status];
    return (
      <Badge variant={variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {label}
      </Badge>
    );
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case "card":
        return <CreditCard className="h-4 w-4" />;
      case "cash":
        return <span className="text-lg">💵</span>;
      case "transfer":
        return <span className="text-lg">🔄</span>;
      default:
        return <span className="text-lg">💳</span>;
    }
  };

  const formatDate = (dateString: string) => {
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Loading Tickets
        </h2>
        <p className="text-gray-600">Fetching your ticket information...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with refresh button */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Tickets</h1>
          <p className="text-gray-600 mt-2">
            Manage and view all your purchased tickets
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Welcome, {user?.name} ({user?.role})
          </p>
        </div>
        <Button
          onClick={fetchTickets}
          disabled={refreshing}
          variant="outline"
          className="flex items-center gap-2"
        >
          {refreshing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Refresh
        </Button>
      </div>

      {/* Stats Summary */}
      {tickets.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">{tickets.length}</CardTitle>
              <CardDescription>Total Tickets</CardDescription>
            </CardHeader>
            <CardContent>
              <Ticket className="h-8 w-8 text-blue-500" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">
                {formatCurrency(
                  tickets.reduce((sum, t) => sum + t.totalAmount, 0)
                )}
              </CardTitle>
              <CardDescription>Total Spent</CardDescription>
            </CardHeader>
            <CardContent>
              <CreditCard className="h-8 w-8 text-green-500" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">
                {tickets.filter((t) => t.status === "confirmed").length}
              </CardTitle>
              <CardDescription>Confirmed</CardDescription>
            </CardHeader>
            <CardContent>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">
                {tickets.filter((t) => t.status === "checked_in").length}
              </CardTitle>
              <CardDescription>Attended</CardDescription>
            </CardHeader>
            <CardContent>
              <Users className="h-8 w-8 text-purple-500" />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search & Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="search"
                placeholder="Search tickets by event, ticket number, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex items-center gap-4">
              <Filter className="h-5 w-5 text-gray-500" />
              <div className="flex flex-wrap gap-2">
                {filters.map((filter) => {
                  const Icon = filter.icon;
                  return (
                    <Button
                      key={filter.id}
                      variant={
                        activeFilter === filter.id ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setActiveFilter(filter.id)}
                      className="flex items-center gap-2"
                    >
                      <Icon className="h-4 w-4" />
                      {filter.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tickets Grid */}
      {filteredTickets.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredTickets.map((ticket) => (
            <div
              key={ticket.id}
              className="relative group cursor-pointer"
              onClick={() => router.push(`/user/tickets/${ticket.id}`)}
            >
              <Card className="overflow-hidden hover:shadow-lg transition-shadow hover:border-blue-300 border-2 border-transparent">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusBadge(ticket.status)}
                        <span className="text-sm text-gray-500 font-mono">
                          #{ticket.ticketNumber}
                        </span>
                      </div>
                      <CardTitle className="text-xl line-clamp-1 group-hover:text-blue-600 transition-colors">
                        {ticket.eventName}
                      </CardTitle>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">
                        {formatCurrency(ticket.totalAmount)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {ticket.quantity} ticket{ticket.quantity > 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {ticket.eventDate && (
                      <div className="flex items-center text-gray-700">
                        <Calendar className="h-4 w-4 mr-3 text-gray-400 flex-shrink-0" />
                        <div>
                          <span className="font-medium">Event Date: </span>
                          <span>{formatDate(ticket.eventDate)}</span>
                        </div>
                      </div>
                    )}

                    {(ticket.location || ticket.city) && (
                      <div className="flex items-center text-gray-700">
                        <MapPin className="h-4 w-4 mr-3 text-gray-400 flex-shrink-0" />
                        <div className="truncate">
                          <span className="font-medium">Location: </span>
                          <span>
                            {ticket.location || "Location not specified"}
                          </span>
                          {ticket.city && (
                            <span className="text-gray-500">
                              , {ticket.city}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center text-gray-700">
                      <Calendar className="h-4 w-4 mr-3 text-gray-400 flex-shrink-0" />
                      <div>
                        <span className="font-medium">Purchased: </span>
                        <span>{formatDate(ticket.purchaseDate)}</span>
                      </div>
                    </div>

                    <div className="flex items-center text-gray-700">
                      {getPaymentMethodIcon(ticket.paymentMethod)}
                      <span className="ml-3">
                        <span className="font-medium">Payment: </span>
                        <span className="capitalize">
                          {ticket.paymentMethod}
                        </span>
                        <span className="ml-2 text-sm px-2 py-0.5 bg-gray-100 rounded">
                          {ticket.paymentStatus}
                        </span>
                      </span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <div>
                      <span className="font-medium">Transaction: </span>
                      <span className="font-mono">
                        {ticket.transactionId || "N/A"}
                      </span>
                    </div>
                    {ticket.checkInTime && (
                      <div className="text-right">
                        <span className="font-medium">Checked in: </span>
                        <span>{formatDate(ticket.checkInTime)}</span>
                      </div>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="bg-gray-50 pt-4">
                  <div className="flex gap-3 w-full">
                    <Button
                      variant="outline"
                      className="flex-1"
                      // Change from:
                      onClick={() => router.push(`/user/tickets/${ticket.id}`)}

                      // To (use ticketNumber since that's what you have
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Event
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadTicket(ticket);
                      }}
                      disabled={downloadingId === ticket.id}
                    >
                      {downloadingId === ticket.id ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Downloading...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </>
                      )}
                    </Button>
                  </div>
                </CardFooter>
              </Card>

              {/* Click hint indicator */}
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight className="h-4 w-4 text-blue-500" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Ticket className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchQuery || activeFilter !== "all"
                ? "No matching tickets found"
                : "No tickets yet"}
            </h3>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              {searchQuery
                ? "Try a different search term or clear the search"
                : activeFilter !== "all"
                ? `You don't have any ${activeFilter} tickets`
                : "You haven't purchased any tickets yet. Browse events and get your first ticket!"}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={fetchTickets}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Retry Loading
              </Button>
              <Link href="/events">
                <Button variant="outline" className="flex items-center gap-2">
                  Browse Events
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
