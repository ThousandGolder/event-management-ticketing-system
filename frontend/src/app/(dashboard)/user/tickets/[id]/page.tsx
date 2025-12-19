"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Users,
  Ticket,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Download,
  Share2,
  QrCode,
  CheckCircle,
  Clock,
  XCircle,
  CreditCard,
  User,
  Mail,
  Phone,
  FileText,
  Printer,
  Copy,
  Eye,
  RefreshCw,
  ChevronRight,
  Home,
  ExternalLink,
} from "lucide-react";

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
    default: "bg-blue-100 text-blue-800 border border-blue-200",
    secondary: "bg-gray-100 text-gray-800 border border-gray-200",
    destructive: "bg-red-100 text-red-800 border border-red-200",
    outline: "border border-gray-300 text-gray-700 bg-transparent",
    success: "bg-green-100 text-green-800 border border-green-200",
  };

  return (
    <div
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${variantStyles[variant]} ${className}`}
    >
      {children}
    </div>
  );
};

// Update the interface based on your actual database structure
interface TicketDetail {
  id: string; // This might be ticketNumber or a combination
  ticketId: string;
  ticketNumber: string;
  eventId: string;
  eventName: string;
  eventDescription?: string;
  eventDate: string;
  eventTime?: string;
  eventLocation?: string;
  eventCity?: string;
  eventCategory?: string;
  eventImageUrl?: string;
  eventOrganizer?: string;
  eventOrganizerEmail?: string;
  eventOrganizerPhone?: string;
  userId: string;
  userName: string;
  userEmail: string;
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
  seatNumber?: string;
  section?: string;
  ticketType: string;
  terms?: string[];
  qrCodeUrl?: string;
}

export default function TicketDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const ticketId = params.id as string; // This is ticketNumber from URL
  const { user, token, logout } = useAuth();
  const { toast } = useToast();

  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showAllTerms, setShowAllTerms] = useState(false);

  // Fetch ticket details from backend
  const fetchTicketDetails = async (forceRefresh = false) => {
    try {
      if (forceRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      // Check authentication first
      if (!token || !user) {
        toast({
          title: "Authentication required",
          description: "Please login to view ticket details",
          variant: "destructive",
        });
        router.push("/login");
        return;
      }

      // Since there's no direct endpoint for single ticket,
      // we need to fetch all tickets and find the matching one
      const response = await fetch(
        `http://localhost:3001/user/tickets?userId=${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          cache: "no-store",
        }
      );

      if (response.status === 401) {
        toast({
          title: "Session expired",
          description: "Please login again",
          variant: "destructive",
        });
        logout();
        router.push("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        const ticketsData = data.data || data.tickets || [];

        // Find the ticket by ID (could be ticketNumber, ticketId, or id)
        const foundTicket = ticketsData.find(
          (t: any) =>
            t.id === ticketId ||
            t.ticketId === ticketId ||
            t.ticketNumber === ticketId
        );

        if (foundTicket) {
          // Transform to match our interface
          const ticketData: TicketDetail = {
            id:
              foundTicket.id || foundTicket.ticketId || `ticket-${Date.now()}`,
            ticketId:
              foundTicket.ticketId || foundTicket.id || `TKT-${Date.now()}`,
            ticketNumber:
              foundTicket.ticketNumber || foundTicket.ticketId || "Unknown",
            eventId: foundTicket.eventId || "event-unknown",
            eventName:
              foundTicket.eventName || foundTicket.event?.title || "Event",
            eventDescription:
              foundTicket.eventDescription ||
              foundTicket.event?.description ||
              "",
            eventDate:
              foundTicket.eventDate ||
              foundTicket.event?.date ||
              new Date().toISOString(),
            eventTime:
              foundTicket.eventTime || foundTicket.event?.time || "All Day",
            eventLocation:
              foundTicket.location ||
              foundTicket.event?.location ||
              "Location not specified",
            eventCity: foundTicket.city || foundTicket.event?.city || "",
            eventCategory:
              foundTicket.eventCategory ||
              foundTicket.event?.category ||
              "General",
            eventImageUrl:
              foundTicket.eventImageUrl ||
              foundTicket.event?.imageUrl ||
              "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop",
            eventOrganizer:
              foundTicket.eventOrganizer ||
              foundTicket.event?.organizer ||
              "Event Organizer",
            userId: foundTicket.userId || user.id,
            userName: user.name || "Ticket Holder",
            userEmail: user.email || "N/A",
            purchaseDate:
              foundTicket.purchaseDate ||
              foundTicket.createdAt ||
              new Date().toISOString(),
            quantity: foundTicket.quantity || 1,
            unitPrice: foundTicket.unitPrice || foundTicket.price || 0,
            totalAmount:
              foundTicket.totalAmount ||
              (foundTicket.quantity || 1) * (foundTicket.unitPrice || 0),
            status: (foundTicket.status || "pending") as TicketDetail["status"],
            paymentMethod: foundTicket.paymentMethod || "unknown",
            paymentStatus: foundTicket.paymentStatus || "pending",
            transactionId: foundTicket.transactionId,
            checkInTime: foundTicket.checkInTime,
            checkInBy: foundTicket.checkInBy,
            createdAt: foundTicket.createdAt || new Date().toISOString(),
            updatedAt: foundTicket.updatedAt || new Date().toISOString(),
            seatNumber: foundTicket.seatNumber,
            section: foundTicket.section,
            ticketType:
              foundTicket.ticketType || foundTicket.type || "General Admission",
            terms: foundTicket.terms || [
              "Ticket is non-transferable and non-refundable",
              "Valid ID required for entry",
              "Ticket must be presented at the entrance",
            ],
            qrCodeUrl:
              foundTicket.qrCodeUrl ||
              `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${
                foundTicket.ticketNumber || ticketId
              }`,
          };

          setTicket(ticketData);
        } else {
          throw new Error("Ticket not found in your tickets");
        }
      } else {
        throw new Error(data.message || "Failed to fetch tickets");
      }
    } catch (error: any) {
      console.error("Error fetching ticket:", error);

      // Show mock data as fallback
      setTicket({
        id: ticketId,
        ticketId: `TKT-${ticketId}`,
        ticketNumber: ticketId,
        eventId: "event-001",
        eventName: "Tech Conference 2024",
        eventDescription:
          "The biggest technology conference of the year featuring industry leaders and innovative startups.",
        eventDate: "2024-12-15",
        eventTime: "9:00 AM - 6:00 PM",
        eventLocation: "Convention Center",
        eventCity: "San Francisco",
        eventCategory: "Technology",
        eventImageUrl:
          "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop",
        eventOrganizer: "Tech Events Inc.",
        eventOrganizerEmail: "contact@techevents.com",
        eventOrganizerPhone: "+1 (555) 123-4567",
        userId: user?.id || "user-001",
        userName: user?.name || "John Doe",
        userEmail: user?.email || "john@example.com",
        purchaseDate: "2024-12-01",
        quantity: 2,
        unitPrice: 150, // From your database
        totalAmount: 300,
        status: "confirmed",
        paymentMethod: "card",
        paymentStatus: "paid",
        transactionId: "TRX-123456",
        checkInTime: undefined,
        checkInBy: undefined,
        createdAt: "2024-12-01T10:30:00Z",
        updatedAt: "2024-12-01T10:30:00Z",
        seatNumber: "A-12",
        section: "VIP",
        ticketType: "VIP Pass",
        terms: [
          "Ticket is non-transferable and non-refundable",
          "Valid ID required for entry",
          "Ticket must be presented at the entrance",
          "Recording devices are not permitted",
          "Ticket holder must comply with all venue rules",
        ],
        qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${ticketId}`,
      });

      toast({
        title: "Using demo data",
        description: error.message || "Could not load ticket details",
        variant: "default",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (user && token) {
      fetchTicketDetails();
    } else if (!user) {
      // If no user, redirect to login
      router.push("/login");
    }
  }, [user, token, ticketId]);

  // Handle back navigation
  const handleBack = () => {
    router.push("/user/tickets");
  };

  // Handle download ticket
  const handleDownloadTicket = async () => {
    if (!ticket) return;

    try {
      setDownloading(true);

      const ticketContent = `
==========================================
            EVENT TICKET
==========================================

TICKET: ${ticket.ticketNumber}
EVENT: ${ticket.eventName}
TYPE: ${ticket.ticketType}
DATE: ${formatDate(ticket.eventDate)}
TIME: ${ticket.eventTime}
LOCATION: ${ticket.eventLocation}
CITY: ${ticket.eventCity}
ORGANIZER: ${ticket.eventOrganizer}

==========================================
       TICKET HOLDER INFORMATION
==========================================

NAME: ${ticket.userName}
EMAIL: ${ticket.userEmail}
TICKET ID: ${ticket.ticketNumber}
PURCHASE DATE: ${formatDate(ticket.purchaseDate)}
STATUS: ${ticket.status.toUpperCase()}

==========================================
         SEATING INFORMATION
==========================================

SECTION: ${ticket.section || "General"}
SEAT: ${ticket.seatNumber || "Open Seating"}
QUANTITY: ${ticket.quantity} ticket(s)

==========================================
         PAYMENT INFORMATION
==========================================

PAYMENT METHOD: ${ticket.paymentMethod.replace("_", " ").toUpperCase()}
TRANSACTION ID: ${ticket.transactionId || "N/A"}
UNIT PRICE: ${formatCurrency(ticket.unitPrice)}
TOTAL AMOUNT: ${formatCurrency(ticket.totalAmount)}

==========================================
         EVENT DESCRIPTION
==========================================

${ticket.eventDescription}

==========================================
         TERMS & CONDITIONS
==========================================

${
  ticket.terms?.map((term, i) => `${i + 1}. ${term}`).join("\n") ||
  "No specific terms"
}

==========================================
${
  ticket.checkInTime
    ? `CHECKED IN: ${formatDateTime(ticket.checkInTime)}
   CHECKED BY: ${ticket.checkInBy || "Staff"}`
    : "NOT CHECKED IN YET"
}
==========================================
Generated on: ${new Date().toLocaleString()}
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
    } catch (error: any) {
      console.error("Error downloading ticket:", error);
      toast({
        title: "Download failed",
        description: "Failed to download ticket. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDownloading(false);
    }
  };

  // Handle share ticket
  const handleShareTicket = async () => {
    if (!ticket) return;

    const shareUrl = `${window.location.origin}/user/tickets/${ticket.ticketNumber}`;
    const shareData = {
      title: `My Ticket: ${ticket.eventName}`,
      text: `Check out my ticket for ${ticket.eventName} on ${formatDate(
        ticket.eventDate
      )}`,
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link Copied!",
          description: "Ticket link copied to clipboard",
        });
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  // Handle copy ticket number
  const handleCopyTicketNumber = () => {
    if (!ticket) return;

    navigator.clipboard.writeText(ticket.ticketNumber);
    toast({
      title: "Copied!",
      description: "Ticket number copied to clipboard",
    });
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  // Format date and time
  const formatDateTime = (dateTimeString: string) => {
    try {
      const date = new Date(dateTimeString);
      return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateTimeString;
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Get status badge
  const getStatusBadge = () => {
    if (!ticket) return null;

    const config = {
      confirmed: {
        label: "Confirmed",
        variant: "success" as const,
        icon: CheckCircle,
      },
      pending: {
        label: "Pending",
        variant: "secondary" as const,
        icon: Clock,
      },
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

    const { label, variant, icon: Icon } = config[ticket.status];
    return (
      <Badge variant={variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {label}
      </Badge>
    );
  };

  // Get payment method icon
  const getPaymentMethodIcon = () => {
    if (!ticket) return <CreditCard className="h-5 w-5" />;

    switch (ticket.paymentMethod.toLowerCase()) {
      case "credit_card":
      case "card":
        return <CreditCard className="h-5 w-5" />;
      case "cash":
        return <span className="text-lg">💵</span>;
      case "transfer":
        return <span className="text-lg">🔄</span>;
      default:
        return <CreditCard className="h-5 w-5" />;
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Loading Ticket Details
        </h2>
        <p className="text-gray-600">Fetching ticket information...</p>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Ticket Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The ticket you're looking for doesn't exist or you don't have
            permission to view it
          </p>
          <div className="flex gap-3">
            <Button onClick={handleBack}>Back to Tickets</Button>
            <Link href="/">
              <Button variant="outline">
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Calculate visible terms
  const visibleTerms = showAllTerms ? ticket.terms : ticket.terms?.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header with breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="h-8 w-8 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <ChevronRight className="h-3 w-3" />
          <Link
            href="/user/tickets"
            className="hover:text-blue-600 hover:underline"
          >
            My Tickets
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="font-medium text-gray-900">Ticket Details</span>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => fetchTicketDetails(true)}
            disabled={refreshing}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            {refreshing ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <RefreshCw className="h-3 w-3" />
            )}
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleShareTicket}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button
            onClick={handleDownloadTicket}
            disabled={downloading}
            size="sm"
          >
            {downloading ? (
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
      </div>

      {/* Ticket Header Card */}
      <Card className="overflow-hidden">
        <div className="h-48 overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 relative">
          <img
            src={ticket.eventImageUrl}
            alt={ticket.eventName}
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 flex flex-col justify-center p-6 text-white">
            <div className="flex items-center gap-2 mb-2">
              {getStatusBadge()}
              <span className="text-sm font-mono bg-white/20 backdrop-blur-sm px-2 py-1 rounded">
                #{ticket.ticketNumber}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-white hover:bg-white/20"
                onClick={handleCopyTicketNumber}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
            <h1 className="text-2xl font-bold mb-2">{ticket.eventName}</h1>
            <p className="text-blue-100">{ticket.eventDescription}</p>
          </div>
        </div>

        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="h-4 w-4" />
                <span className="text-sm font-medium">Event Date</span>
              </div>
              <p className="font-semibold">{formatDate(ticket.eventDate)}</p>
              <p className="text-sm text-gray-500">{ticket.eventTime}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="h-4 w-4" />
                <span className="text-sm font-medium">Location</span>
              </div>
              <p className="font-semibold">{ticket.eventLocation}</p>
              <p className="text-sm text-gray-500">{ticket.eventCity}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-600">
                <Ticket className="h-4 w-4" />
                <span className="text-sm font-medium">Ticket Type</span>
              </div>
              <p className="font-semibold">{ticket.ticketType}</p>
              <p className="text-sm text-gray-500">
                {ticket.quantity} ticket{ticket.quantity > 1 ? "s" : ""}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-600">
                <User className="h-4 w-4" />
                <span className="text-sm font-medium">Ticket Holder</span>
              </div>
              <p className="font-semibold">{ticket.userName}</p>
              <p className="text-sm text-gray-500 truncate">
                {ticket.userEmail}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Ticket Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ticket & Payment Info */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Ticket Information */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Ticket className="h-5 w-5" />
                  Ticket Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Ticket Number</span>
                    <span className="font-mono font-semibold">
                      {ticket.ticketNumber}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Ticket Type</span>
                    <span className="font-semibold">{ticket.ticketType}</span>
                  </div>
                  <Separator />
                  {ticket.seatNumber && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Section</span>
                        <span className="font-semibold">{ticket.section}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Seat Number</span>
                        <span className="font-semibold">
                          {ticket.seatNumber}
                        </span>
                      </div>
                      <Separator />
                    </>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Quantity</span>
                    <span className="font-semibold">{ticket.quantity}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Payment Method</span>
                    <div className="flex items-center gap-2">
                      {getPaymentMethodIcon()}
                      <span className="font-semibold capitalize">
                        {ticket.paymentMethod.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Payment Status</span>
                    <Badge
                      variant={
                        ticket.paymentStatus === "paid"
                          ? "success"
                          : "secondary"
                      }
                    >
                      {ticket.paymentStatus}
                    </Badge>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Unit Price</span>
                    <span className="font-semibold">
                      {formatCurrency(ticket.unitPrice)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Amount</span>
                    <span className="font-semibold text-lg text-blue-600">
                      {formatCurrency(ticket.totalAmount)}
                    </span>
                  </div>
                </div>
                {ticket.transactionId && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-gray-500 mb-1">
                        Transaction ID
                      </p>
                      <p className="font-mono text-sm">
                        {ticket.transactionId}
                      </p>
                    </div>
                  </>
                )}
                <Separator />
                <div>
                  <p className="text-sm text-gray-500 mb-1">Purchase Date</p>
                  <p className="font-semibold">
                    {formatDate(ticket.purchaseDate)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Check-in Information */}
          {ticket.checkInTime && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  Check-in Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    <div>
                      <p className="font-semibold text-green-800">
                        Successfully Checked In
                      </p>
                      <p className="text-sm text-green-600">
                        {formatDateTime(ticket.checkInTime)}
                        {ticket.checkInBy && ` by ${ticket.checkInBy}`}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - QR Code & Actions */}
        <div className="space-y-6">
          {/* QR Code Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Digital Ticket
              </CardTitle>
              <CardDescription>
                Scan this QR code at the event entrance
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-4">
                <div className="bg-white border border-gray-200 rounded-lg p-6 inline-block">
                  {ticket.qrCodeUrl ? (
                    <img
                      src={ticket.qrCodeUrl}
                      alt="Ticket QR Code"
                      className="w-48 h-48"
                    />
                  ) : (
                    <div className="w-48 h-48 flex items-center justify-center bg-gray-100 rounded">
                      <div className="text-center text-gray-400">
                        <QrCode className="h-12 w-12 mx-auto mb-2" />
                        <p className="text-sm">QR Code</p>
                        <p className="text-xs">Not Available</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-900">
                    Ticket Number
                  </p>
                  <p className="text-sm font-mono text-gray-600">
                    {ticket.ticketNumber}
                  </p>
                  <p className="text-xs text-gray-500">
                    Valid for entry: {formatDate(ticket.eventDate)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Terms & Conditions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Terms & Conditions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {visibleTerms && visibleTerms.length > 0 ? (
                  <>
                    {visibleTerms.map((term, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-sm"
                      >
                        <span className="text-gray-400 mt-0.5">•</span>
                        <span className="text-gray-700">{term}</span>
                      </li>
                    ))}
                    {ticket.terms &&
                      ticket.terms.length > 5 &&
                      !showAllTerms && (
                        <li>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full text-blue-600 hover:text-blue-800"
                            onClick={() => setShowAllTerms(true)}
                          >
                            Show {ticket.terms.length - 5} more terms
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </li>
                      )}
                  </>
                ) : (
                  <li className="text-sm text-gray-500">
                    No specific terms and conditions
                  </li>
                )}
              </ul>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link href={`/events/${ticket.eventId}`} target="_blank">
                  <Button variant="outline" className="w-full justify-between">
                    <span className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      View Event Details
                    </span>
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleShareTicket}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Ticket
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => window.print()}
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print Ticket
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
