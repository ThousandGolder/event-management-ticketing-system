"use client";

import { useState, useEffect, useCallback } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Ticket,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Edit,
  Trash2,
  Share2,
  BarChart3,
  QrCode,
  CheckCircle,
  XCircle,
  User,
  Mail,
  Phone,
  Globe,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

interface Event {
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
  status: "active" | "upcoming" | "past" | "cancelled";
  role: "organizer" | "attendee";
  registrationDate: string;
  ticketCount: number;
  ticketNumbers: string[];
  isSaved: boolean;
  imageUrl: string;
  organizer: string;
  organizerEmail?: string;
  organizerPhone?: string;
  organizerWebsite?: string;
  eventType: string;
  duration: string;
  requirements: string[];
  tags: string[];
}

interface Attendee {
  id: string;
  name: string;
  email: string;
  ticketNumber: string;
  purchaseDate: string;
  status: string;
  checkInTime?: string;
}

export default function UserEventDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;
  const { user, isLoading: authLoading, token, logout } = useAuth();
  const { toast } = useToast();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("details");
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [checkInTicketNumber, setCheckInTicketNumber] = useState("");
  const [checkingIn, setCheckingIn] = useState(false);

  // Mock event data
  const mockEvent: Event = {
    id: eventId,
    title: "Tech Conference 2024",
    description:
      "The premier technology conference bringing together industry leaders, innovators, and developers from around the world. Features keynote speeches, workshops, and networking opportunities.",
    date: "2024-12-15",
    time: "09:00 AM",
    location: "Convention Center",
    city: "San Francisco, CA",
    category: "Technology",
    ticketsSold: 245,
    totalTickets: 500,
    revenue: 36750,
    status: "active",
    role: "attendee", // Default to attendee for safety
    registrationDate: "2024-10-15",
    ticketCount: 2,
    ticketNumbers: ["TKT-001234", "TKT-001235"],
    isSaved: true,
    imageUrl:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop",
    organizer: "Tech Events Inc.",
    organizerEmail: "contact@techevents.com",
    organizerPhone: "+1 (555) 123-4567",
    organizerWebsite: "www.techevents.com",
    eventType: "Conference",
    duration: "2 days",
    requirements: [
      "Valid ID",
      "Business casual attire",
      "Registration confirmation",
    ],
    tags: ["Technology", "Networking", "Workshops", "Startups"],
  };

  const mockAttendees: Attendee[] = [
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      ticketNumber: "TKT-001234",
      purchaseDate: "2024-10-15",
      status: "checked_in",
      checkInTime: "2024-12-15 09:15",
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane@example.com",
      ticketNumber: "TKT-001235",
      purchaseDate: "2024-10-16",
      status: "confirmed",
    },
  ];

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: "Authentication required",
        description: "Please login to view event details",
        variant: "destructive",
      });
      router.push(`/login?redirect=/user/events/${eventId}`);
    }
  }, [user, authLoading, router, eventId, toast]);

  // Fetch event details
  const fetchEventDetails = useCallback(async () => {
    if (authLoading || !user) {
      return;
    }

    try {
      setLoading(true);

      // For demo purposes, use mock data
      // You can replace this with actual API call when backend is ready
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate loading

      // Use mock data with user's role
      const userRole =
        user.role === "admin" || user.role === "organizer"
          ? "organizer"
          : "attendee";
      const eventData = {
        ...mockEvent,
        role: userRole,
      };

      setEvent(eventData);
      setIsOrganizer(userRole === "organizer");

      // If organizer, load attendees
      if (userRole === "organizer") {
        setAttendees(mockAttendees);
      }

      toast({
        title: "Event loaded",
        description: "Event details loaded successfully",
      });
    } catch (error: any) {
      console.error("Error loading event:", error);

      // Fallback to basic event data
      const fallbackEvent = {
        ...mockEvent,
        role:
          user?.role === "admin" || user?.role === "organizer"
            ? "organizer"
            : "attendee",
      };

      setEvent(fallbackEvent);
      setIsOrganizer(fallbackEvent.role === "organizer");

      toast({
        title: "Using cached data",
        description: "Could not connect to server, showing demo data",
        variant: "default",
      });
    } finally {
      setLoading(false);
    }
  }, [user, authLoading, eventId, toast]);

  // Initial fetch
  useEffect(() => {
    if (user && !authLoading) {
      fetchEventDetails();
    }
  }, [fetchEventDetails, user, authLoading]);

  // Handle event actions
  const handleEditEvent = () => {
    router.push(`/user/events/${eventId}/edit`);
  };

  const handleDeleteEvent = async () => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "Event Deleted",
        description: "Event has been successfully deleted",
      });
      router.push("/user/events");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete event",
        variant: "destructive",
      });
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  const handleCheckIn = async () => {
    if (!checkInTicketNumber.trim()) {
      toast({
        title: "Error",
        description: "Please enter a ticket number",
        variant: "destructive",
      });
      return;
    }

    try {
      setCheckingIn(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "Check-in Successful",
        description: `Ticket ${checkInTicketNumber} has been checked in`,
      });

      // Update attendees list
      setAttendees((prev) =>
        prev.map((attendee) =>
          attendee.ticketNumber === checkInTicketNumber
            ? {
                ...attendee,
                status: "checked_in",
                checkInTime: new Date().toLocaleString(),
              }
            : attendee
        )
      );

      setCheckInTicketNumber("");
      setShowCheckInModal(false);
    } catch (error) {
      toast({
        title: "Check-in Failed",
        description: "Could not check in ticket",
        variant: "destructive",
      });
    } finally {
      setCheckingIn(false);
    }
  };

  const handleShareEvent = () => {
    const shareUrl = `${window.location.origin}/events/${eventId}`;
    if (navigator.share) {
      navigator.share({
        title: event?.title || "Event",
        text: event?.description || "",
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link Copied!",
        description: "Event link copied to clipboard",
      });
    }
  };

  const handleViewAnalytics = () => {
    router.push(`/user/events/${eventId}/analytics`);
  };

  const handleManageTickets = () => {
    router.push(`/user/tickets`);
  };

  const handleBack = () => {
    router.push("/user/events");
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "upcoming":
        return "bg-blue-500";
      case "past":
        return "bg-gray-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Active";
      case "upcoming":
        return "Upcoming";
      case "past":
        return "Past";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-yellow-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-6">
            You need to be logged in to view event details
          </p>
          <Link href={`/login?redirect=/user/events/${eventId}`}>
            <Button>Go to Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Event Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The event you're looking for doesn't exist
          </p>
          <Button onClick={handleBack}>Back to Events</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="h-10 w-10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{event.title}</h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge className={`text-white ${getStatusColor(event.status)}`}>
                {getStatusText(event.status)}
              </Badge>
              <Badge variant="outline" className="capitalize">
                {event.role}
              </Badge>
              {event.isSaved && <Badge variant="secondary">Saved</Badge>}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleShareEvent}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>

          {isOrganizer && (
            <>
              <Button variant="outline" onClick={handleViewAnalytics}>
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </Button>
              <Button variant="outline" onClick={handleEditEvent}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Event Image */}
      <div className="h-64 md:h-96 rounded-lg overflow-hidden">
        <img
          src={event.imageUrl}
          alt={event.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="tickets" disabled={!isOrganizer}>
            Tickets
          </TabsTrigger>
          <TabsTrigger value="attendees" disabled={!isOrganizer}>
            Attendees
          </TabsTrigger>
          <TabsTrigger value="analytics" disabled={!isOrganizer}>
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Event Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-line">
                    {event.description}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Event Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Date & Time</p>
                        <p className="text-gray-600">
                          {formatDate(event.date)} • {event.time}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Location</p>
                        <p className="text-gray-600">{event.location}</p>
                        <p className="text-gray-600">{event.city}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Attendance</p>
                        <p className="text-gray-600">
                          {event.ticketsSold} / {event.totalTickets} tickets
                          sold
                          {isOrganizer && (
                            <span className="ml-2 text-sm text-green-600">
                              (${event.revenue} revenue)
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Ticket className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Event Type</p>
                        <p className="text-gray-600 capitalize">
                          {event.eventType} • {event.duration}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {event.requirements && event.requirements.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Requirements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {event.requirements.map((req, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Organizer</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="font-semibold">{event.organizer}</p>

                    {event.organizerEmail && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span>{event.organizerEmail}</span>
                      </div>
                    )}

                    {event.organizerPhone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span>{event.organizerPhone}</span>
                      </div>
                    )}

                    {event.organizerWebsite && (
                      <div className="flex items-center gap-2 text-sm">
                        <Globe className="h-4 w-4 text-gray-500" />
                        <a
                          href={`https://${event.organizerWebsite}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {event.organizerWebsite}
                        </a>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {!isOrganizer && event.ticketCount > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Your Tickets</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <p className="text-lg font-bold">
                        {event.ticketCount} ticket
                        {event.ticketCount > 1 ? "s" : ""}
                      </p>
                      <div className="space-y-1">
                        {event.ticketNumbers.map((ticket, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="font-mono">{ticket}</span>
                            <Badge variant="outline">#{index + 1}</Badge>
                          </div>
                        ))}
                      </div>
                      <p className="text-sm text-gray-500">
                        Registered on {formatDate(event.registrationDate)}
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" onClick={handleManageTickets}>
                      <Ticket className="h-4 w-4 mr-2" />
                      Manage Tickets
                    </Button>
                  </CardFooter>
                </Card>
              )}

              {event.tags && event.tags.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Tags</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {event.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Tickets Tab (Organizer only) */}
        {isOrganizer && (
          <TabsContent value="tickets">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Ticket Management</CardTitle>
                    <CardDescription>
                      Manage tickets and check-in attendees
                    </CardDescription>
                  </div>
                  <Button onClick={() => setShowCheckInModal(true)}>
                    <QrCode className="h-4 w-4 mr-2" />
                    Check-in Attendee
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-4 text-sm font-medium text-gray-600">
                    <div>Ticket Number</div>
                    <div>Status</div>
                    <div>Purchase Date</div>
                    <div>Actions</div>
                  </div>

                  {attendees.map((attendee) => (
                    <div
                      key={attendee.id}
                      className="grid grid-cols-4 gap-4 items-center border-b pb-3"
                    >
                      <div className="font-mono">{attendee.ticketNumber}</div>
                      <div>
                        <Badge
                          variant={
                            attendee.status === "checked_in"
                              ? "default"
                              : "outline"
                          }
                          className={
                            attendee.status === "checked_in"
                              ? "bg-green-100 text-green-800"
                              : ""
                          }
                        >
                          {attendee.status === "checked_in"
                            ? "Checked In"
                            : "Not Checked In"}
                        </Badge>
                      </div>
                      <div>{formatDate(attendee.purchaseDate)}</div>
                      <div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setCheckInTicketNumber(attendee.ticketNumber);
                            setShowCheckInModal(true);
                          }}
                          disabled={attendee.status === "checked_in"}
                        >
                          Check In
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Attendees Tab (Organizer only) */}
        {isOrganizer && (
          <TabsContent value="attendees">
            <Card>
              <CardHeader>
                <CardTitle>Attendees List</CardTitle>
                <CardDescription>
                  {attendees.length} attendees registered
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {attendees.map((attendee) => (
                    <Card key={attendee.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">{attendee.name}</p>
                            <p className="text-sm text-gray-500">
                              {attendee.email}
                            </p>
                            <p className="text-xs text-gray-400 font-mono">
                              Ticket: {attendee.ticketNumber}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge
                            variant={
                              attendee.status === "checked_in"
                                ? "default"
                                : "outline"
                            }
                            className={
                              attendee.status === "checked_in"
                                ? "bg-green-100 text-green-800"
                                : ""
                            }
                          >
                            {attendee.status === "checked_in" ? (
                              <div className="flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" />
                                Checked In
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Not Checked In
                              </div>
                            )}
                          </Badge>
                          {attendee.checkInTime && (
                            <p className="text-xs text-gray-500 mt-1">
                              Checked in: {attendee.checkInTime}
                            </p>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Analytics Tab (Organizer only) */}
        {isOrganizer && (
          <TabsContent value="analytics">
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Ticket Sales</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{event.ticketsSold}</p>
                    <p className="text-gray-500">
                      of {event.totalTickets} tickets sold
                    </p>
                    <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{
                          width: `${
                            (event.ticketsSold / event.totalTickets) * 100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-3xl font-bold">
                      ${event.revenue.toLocaleString()}
                    </p>
                    <p className="text-gray-500">Total revenue</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Check-ins</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-3xl font-bold">
                      {
                        attendees.filter((a) => a.status === "checked_in")
                          .length
                      }
                    </p>
                    <p className="text-gray-500">
                      of {attendees.length} attendees checked in
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}
      </Tabs>

      {/* Check-in Modal */}
      {showCheckInModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold">Check-in Attendee</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Enter ticket number to check in
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setShowCheckInModal(false);
                  setCheckInTicketNumber("");
                }}
              >
                <XCircle className="h-5 w-5" />
              </Button>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Ticket Number
              </label>
              <Input
                value={checkInTicketNumber}
                onChange={(e) => setCheckInTicketNumber(e.target.value)}
                placeholder="Enter ticket number (e.g., TKT-001234)"
                className="font-mono"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCheckInModal(false);
                  setCheckInTicketNumber("");
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCheckIn}
                disabled={checkingIn || !checkInTicketNumber.trim()}
              >
                {checkingIn ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Checking in...
                  </>
                ) : (
                  "Check In"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full space-y-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-6 w-6 text-red-500 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold">Delete Event</h3>
                <p className="text-gray-600 mt-1">
                  Are you sure you want to delete "{event.title}"? This action
                  cannot be undone. All tickets and data for this event will be
                  permanently removed.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteEvent}>
                Delete Event
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Add missing Input component
const Input = ({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  className?: string;
}) => (
  <input
    type="text"
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
  />
);
