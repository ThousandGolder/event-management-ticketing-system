"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Ticket,
  RefreshCw,
  Search,
  Filter,
  CalendarDays,
  Eye,
  Bookmark,
  User,
  Plus,
  Trash2,
  Edit,
  Share2,
  AlertCircle,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";

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
  role: string;
  registrationDate: string;
  ticketCount: number;
  ticketNumbers: string[];
  isSaved: boolean;
  imageUrl: string;
  organizer: string;
}

interface ApiResponse {
  success: boolean;
  events: Event[];
  counts: {
    attending: number;
    organizing: number;
    past: number;
    saved: number;
  };
  user: {
    id: string;
  };
  message?: string; // Added optional message property
}

export default function UserEventsPage() {
  const router = useRouter();
  const { user, token, logout } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("attending");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [counts, setCounts] = useState({
    attending: 0,
    organizing: 0,
    past: 0,
    saved: 0,
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // Fetch user events from backend
  const fetchUserEvents = useCallback(async () => {
    try {
      setRefreshing(true);

      if (!token || !user) {
        toast({
          title: "Authentication required",
          description: "Please login again",
          variant: "destructive",
        });
        logout();
        return;
      }

      const response = await fetch(`http://localhost:3001/user/events`, {
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
        // Try to get error message from response
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // If can't parse JSON, keep the default message
        }
        throw new Error(errorMessage);
      }

      const data: ApiResponse = await response.json();

      if (data.success) {
        console.log("Fetched events:", data.events);
        setEvents(data.events);
        setFilteredEvents(data.events);
        setCounts(data.counts);
      } else {
        // Use message if available, otherwise default message
        throw new Error(data.message || "Failed to fetch events");
      }
    } catch (error: any) {
      console.error("Error fetching events:", error);
      toast({
        title: "Error loading events",
        description: error.message || "Could not load events",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, user, logout, toast]);

  // Initial fetch
  useEffect(() => {
    fetchUserEvents();
  }, [fetchUserEvents]);

  // Filter events based on tab, search, and category
  useEffect(() => {
    let filtered = events;

    // Filter by tab
    if (activeTab === "organizing") {
      filtered = filtered.filter((event) => event.role === "organizer");
    } else if (activeTab === "past") {
      filtered = filtered.filter((event) => event.status === "past");
    } else if (activeTab === "saved") {
      filtered = filtered.filter((event) => event.isSaved);
    } else {
      // "attending" tab - show events where user is attendee
      filtered = filtered.filter((event) => event.role === "attendee");
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(query) ||
          event.description.toLowerCase().includes(query) ||
          event.location.toLowerCase().includes(query) ||
          event.category.toLowerCase().includes(query) ||
          event.organizer.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (event) =>
          event.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    setFilteredEvents(filtered);
  }, [events, activeTab, searchQuery, selectedCategory]);

  // Get unique categories
  const categories = [
    "all",
    ...new Set(events.map((event) => event.category.toLowerCase())),
  ];

  // =============== FULLY FUNCTIONAL HANDLERS ===============

  // 1. Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchUserEvents();
  };

  // 2. Handle view event details - Navigate to event page
  const handleViewEvent = (eventId: string) => {
    router.push(`/user/events/${eventId}`);
  };

  // 3. Handle purchase ticket - Navigate to ticket purchase
  const handlePurchaseTicket = (event: Event) => {
    router.push(`/user/events/${event.id}/tickets`);
  };

  // 4. Handle save/unsave event - API call
  const handleToggleSave = async (eventId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(
        `http://localhost:3001/events/${eventId}/save`,
        {
          method: currentStatus ? "DELETE" : "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        // Update local state
        setEvents((prev) =>
          prev.map((event) =>
            event.id === eventId ? { ...event, isSaved: !currentStatus } : event
          )
        );

        toast({
          title: currentStatus ? "Event Unsaved" : "Event Saved",
          description: currentStatus
            ? "Event removed from saved list"
            : "Event added to saved list",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update saved status",
        variant: "destructive",
      });
    }
  };

  // 6. Handle edit event - Navigate to edit event page
  const handleEditEvent = (eventId: string) => {
    router.push(`/events/${eventId}/edit`);
  };

  // 7. Handle delete event - API call
  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;

    try {
      const response = await fetch(
        `http://localhost:3001/events/${selectedEvent.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        // Remove from local state
        setEvents((prev) =>
          prev.filter((event) => event.id !== selectedEvent.id)
        );

        toast({
          title: "Event Deleted",
          description: "Event has been successfully deleted",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete event",
        variant: "destructive",
      });
    } finally {
      setShowDeleteConfirm(false);
      setSelectedEvent(null);
    }
  };

  // 8. Handle share event
  const handleShareEvent = (event: Event) => {
    const shareUrl = `${window.location.origin}/events/${event.id}`;
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: event.description,
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

  // 9. Handle view tickets - Navigate to user tickets
  const handleViewTickets = () => {
    router.push("/user/tickets");
  };

  // 10. Handle view event analytics (for organizers)
  const handleViewAnalytics = (eventId: string) => {
    router.push(`/events/${eventId}/analytics`);
  };

  // 11. Handle cancel registration (for attendees)
  const handleCancelRegistration = async () => {
    if (!selectedEvent) return;

    try {
      const response = await fetch(
        `http://localhost:3001/events/${selectedEvent.id}/cancel-registration`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        // Remove from local state
        setEvents((prev) =>
          prev.filter((event) => event.id !== selectedEvent.id)
        );

        toast({
          title: "Registration Cancelled",
          description: "Your registration has been cancelled",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel registration",
        variant: "destructive",
      });
    } finally {
      setShowCancelConfirm(false);
      setSelectedEvent(null);
    }
  };

  // Format date
  const formatDateTime = (date: string, time: string) => {
    const dateObj = new Date(date);
    return (
      dateObj.toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      }) + ` • ${time}`
    );
  };

  // Get status badge color
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

  // Get role badge color
  const getRoleColor = (role: string) => {
    switch (role) {
      case "organizer":
        return "bg-purple-500";
      case "attendee":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  // Confirmation Modal Component
  const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = "Confirm",
    cancelText = "Cancel",
    type = "default",
  }: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    type?: "default" | "danger";
  }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-background rounded-lg p-6 max-w-md w-full space-y-4">
          <div className="flex items-start gap-3">
            {type === "danger" ? (
              <AlertCircle className="h-6 w-6 text-red-500 mt-0.5" />
            ) : (
              <AlertCircle className="h-6 w-6 text-yellow-500 mt-0.5" />
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{title}</h3>
              <p className="text-muted-foreground mt-1">{description}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              {cancelText}
            </Button>
            <Button
              onClick={onConfirm}
              variant={type === "danger" ? "destructive" : "default"}
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your events...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setSelectedEvent(null);
        }}
        onConfirm={handleDeleteEvent}
        title="Delete Event"
        description={`Are you sure you want to delete "${selectedEvent?.title}"? This action cannot be undone. All tickets and data for this event will be permanently removed.`}
        confirmText="Delete Event"
        type="danger"
      />

      <ConfirmationModal
        isOpen={showCancelConfirm}
        onClose={() => {
          setShowCancelConfirm(false);
          setSelectedEvent(null);
        }}
        onConfirm={handleCancelRegistration}
        title="Cancel Registration"
        description={`Are you sure you want to cancel your registration for "${selectedEvent?.title}"? This will remove your tickets and you may not get a refund.`}
        confirmText="Cancel Registration"
        type="danger"
      />

      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">My Events</h1>
            <p className="text-muted-foreground">
              Manage and view all your events
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
              />
              {refreshing ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Attending</p>
                  <p className="text-2xl font-bold">{counts.attending}</p>
                </div>
                <User className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Organizing</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {counts.organizing}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Past Events</p>
                  <p className="text-2xl font-bold text-gray-600">
                    {counts.past}
                  </p>
                </div>
                <CalendarDays className="h-8 w-8 text-gray-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Saved</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {counts.saved}
                  </p>
                </div>
                <Bookmark className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search events by title, description, location, or organizer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                {/* Category Filter */}
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">
                    <Filter className="h-4 w-4 inline mr-2" />
                    Category
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <Button
                        key={category}
                        variant={
                          selectedCategory === category ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setSelectedCategory(category)}
                      >
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Event Type Tabs */}
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">
                    <Calendar className="h-4 w-4 inline mr-2" />
                    Event Type
                  </label>
                  <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="w-full"
                  >
                    <TabsList className="grid grid-cols-4 w-full">
                      <TabsTrigger
                        value="attending"
                        className="flex items-center gap-2"
                      >
                        <User className="h-3 w-3" />
                        Attending
                      </TabsTrigger>
                      <TabsTrigger
                        value="organizing"
                        className="flex items-center gap-2"
                      >
                        <Calendar className="h-3 w-3" />
                        Organizing
                      </TabsTrigger>
                      <TabsTrigger
                        value="past"
                        className="flex items-center gap-2"
                      >
                        <CalendarDays className="h-3 w-3" />
                        Past
                      </TabsTrigger>
                      <TabsTrigger
                        value="saved"
                        className="flex items-center gap-2"
                      >
                        <Bookmark className="h-3 w-3" />
                        Saved
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Events List */}
        {filteredEvents.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Events Found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery ||
                  selectedCategory !== "all" ||
                  activeTab !== "attending"
                    ? "Try changing your filters or search query"
                    : `You don't have any ${activeTab} events yet`}
                </p>
                <div className="flex gap-2 justify-center">
                  <Button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("all");
                      setActiveTab("attending");
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event) => (
              <Card
                key={event.id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Event Image */}
                <div className="h-48 overflow-hidden relative">
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2 flex gap-2">
                    <Badge
                      className={`text-white ${getStatusColor(event.status)}`}
                    >
                      {event.status.charAt(0).toUpperCase() +
                        event.status.slice(1)}
                    </Badge>
                    <Badge className={`text-white ${getRoleColor(event.role)}`}>
                      {event.role.charAt(0).toUpperCase() + event.role.slice(1)}
                    </Badge>
                  </div>
                </div>

                <CardContent className="pt-6">
                  {/* Event Header */}
                  <div className="mb-4">
                    <CardTitle className="text-lg font-bold line-clamp-1 mb-2">
                      {event.title}
                    </CardTitle>
                    <CardDescription className="text-sm line-clamp-2">
                      {event.description}
                    </CardDescription>
                  </div>

                  {/* Event Details */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="line-clamp-1">
                        {formatDateTime(event.date, event.time)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="line-clamp-1">
                        {event.location}, {event.city}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span>
                        {event.ticketsSold} / {event.totalTickets} tickets sold
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Ticket className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="capitalize">
                        {event.category} • {event.organizer}
                      </span>
                    </div>
                  </div>

                  {/* Tickets Info */}
                  {event.ticketCount > 0 && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-blue-700 mb-1">
                        You have {event.ticketCount} ticket
                        {event.ticketCount > 1 ? "s" : ""}
                      </p>
                      <p className="text-xs text-blue-600">
                        {event.ticketNumbers.join(", ")}
                      </p>
                    </div>
                  )}

                  {/* Progress Bar for Tickets */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Tickets Sold</span>
                      <span>
                        {Math.round(
                          (event.ticketsSold / event.totalTickets) * 100
                        )}
                        %
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
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

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 min-w-[120px]"
                      onClick={() => handleViewEvent(event.id)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>

                    {event.role === "organizer" ? (
                      <>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEditEvent(event.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleViewAnalytics(event.id)}
                        >
                          <Calendar className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setSelectedEvent(event);
                            setShowDeleteConfirm(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        {(event.status === "upcoming" ||
                          event.status === "active") && (
                          <Button
                            className="flex-1 min-w-[120px]"
                            onClick={() => handlePurchaseTicket(event)}
                          >
                            <Ticket className="h-4 w-4 mr-2" />
                            Get Tickets
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setSelectedEvent(event);
                            setShowCancelConfirm(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}

                    <Button
                      variant={event.isSaved ? "default" : "outline"}
                      size="icon"
                      onClick={() => handleToggleSave(event.id, event.isSaved)}
                    >
                      <Bookmark
                        className={`h-4 w-4 ${
                          event.isSaved ? "fill-white" : ""
                        }`}
                      />
                    </Button>

                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleShareEvent(event)}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Quick Actions Card */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common actions for event management
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                onClick={handleViewTickets}
                variant="outline"
                className="w-full justify-start"
              >
                <Ticket className="h-4 w-4 mr-2" />
                View All Tickets
              </Button>
              <Button
                onClick={() => router.push("/events")}
                variant="outline"
                className="w-full justify-start"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Browse All Events
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Events Summary</CardTitle>
            <CardDescription>
              Overview of your events by category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from(new Set(events.map((e) => e.category))).map(
                (category) => {
                  const categoryEvents = events.filter(
                    (e) => e.category === category
                  );
                  const attending = categoryEvents.filter(
                    (e) => e.role === "attendee"
                  ).length;
                  const organizing = categoryEvents.filter(
                    (e) => e.role === "organizer"
                  ).length;

                  return (
                    <Button
                      key={category}
                      variant="outline"
                      className="p-4 h-auto flex-col items-start justify-start"
                      onClick={() => {
                        setSelectedCategory(category.toLowerCase());
                        setActiveTab("attending");
                      }}
                    >
                      <p className="text-sm font-medium text-muted-foreground capitalize mb-2">
                        {category}
                      </p>
                      <p className="text-2xl font-bold">
                        {categoryEvents.length}
                      </p>
                      <div className="flex justify-between text-xs text-muted-foreground mt-1 w-full">
                        <span>Attending: {attending}</span>
                        <span>Organizing: {organizing}</span>
                      </div>
                    </Button>
                  );
                }
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
