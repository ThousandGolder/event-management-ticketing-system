"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { eventsAPI } from "@/lib/api/events";
import {
  Loader2,
  Calendar,
  MapPin,
  User,
  Ticket,
  DollarSign,
  Edit,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Clock,
  XCircle,
  PauseCircle,
  CheckSquare,
} from "lucide-react";

// Status configuration
const STATUS_CONFIG = {
  draft: { label: "Draft", color: "bg-gray-100 text-gray-800", icon: Clock },
  pending: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-800",
    icon: AlertCircle,
  },
  active: {
    label: "Active",
    color: "bg-green-100 text-green-800",
    icon: CheckCircle,
  },
  suspended: {
    label: "Suspended",
    color: "bg-orange-100 text-orange-800",
    icon: PauseCircle,
  },
  completed: {
    label: "Completed",
    color: "bg-blue-100 text-blue-800",
    icon: CheckSquare,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-100 text-red-800",
    icon: XCircle,
  },
};

export default function ViewEventPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [event, setEvent] = useState<any>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [showStatusConfirm, setShowStatusConfirm] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  useEffect(() => {
    if (eventId) {
      fetchEventData();
    }
  }, [eventId]);

  const fetchEventData = async () => {
    try {
      setFetching(true);
      setError(null);

      const result = await eventsAPI.getById(eventId);

      if (result.success && result.event) {
        setEvent(result.event);
      } else {
        setError(result.error || "Failed to fetch event data");
        toast({
          title: "Error",
          description: result.error || "Failed to fetch event data",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error fetching event:", error);
      setError(error.message || "An unexpected error occurred");
      toast({
        title: "Error",
        description: error.message || "Failed to fetch event data",
        variant: "destructive",
      });
    } finally {
      setFetching(false);
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete this event? This action cannot be undone."
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const result = await eventsAPI.delete(eventId);

      if (result.success) {
        toast({
          title: "Success!",
          description: result.message || "Event deleted successfully",
        });
        router.push("/admin/events");
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete event",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error deleting event:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete event",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (status: string) => {
    setSelectedStatus(status);
    setShowStatusConfirm(true);
  };

  const confirmStatusUpdate = async () => {
    if (!selectedStatus || !event) return;

    setUpdatingStatus(selectedStatus);
    setShowStatusConfirm(false);

    try {
      const result = await eventsAPI.updateStatus(eventId, selectedStatus);

      if (result.success) {
        toast({
          title: "Success!",
          description: `Event status updated to ${
            STATUS_CONFIG[selectedStatus as keyof typeof STATUS_CONFIG]
              ?.label || selectedStatus
          }`,
        });

        // Update local state immediately
        setEvent({
          ...event,
          status: selectedStatus,
          updatedAt: new Date().toISOString(),
        });

        // Refresh data from server
        await fetchEventData();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update status",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive",
      });
    } finally {
      setUpdatingStatus(null);
      setSelectedStatus(null);
    }
  };

  const cancelStatusUpdate = () => {
    setShowStatusConfirm(false);
    setSelectedStatus(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusIcon = (status: string) => {
    const IconComponent =
      STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]?.icon || Clock;
    return <IconComponent className="h-4 w-4" />;
  };

  if (fetching) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p>Loading event details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="container mx-auto py-6">
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md mb-4">
          <p className="font-medium">Error</p>
          <p className="text-sm">{error}</p>
        </div>
        <div className="mt-4">
          <Button onClick={() => router.push("/admin/events")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Button>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto py-6">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md mb-4">
          <p className="font-medium">Event Not Found</p>
          <p className="text-sm">The event you're looking for doesn't exist.</p>
        </div>
        <div className="mt-4">
          <Button onClick={() => router.push("/admin/events")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Button>
        </div>
      </div>
    );
  }

  const currentStatusConfig =
    STATUS_CONFIG[event.status as keyof typeof STATUS_CONFIG] ||
    STATUS_CONFIG.draft;

  return (
    <div className="container mx-auto py-6">
      {/* Status Update Confirmation Modal */}
      {showStatusConfirm && selectedStatus && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`p-2 rounded-full ${
                  STATUS_CONFIG[
                    selectedStatus as keyof typeof STATUS_CONFIG
                  ]?.color.split(" ")[0]
                }`}
              >
                {getStatusIcon(selectedStatus)}
              </div>
              <div>
                <h3 className="text-lg font-semibold">Confirm Status Update</h3>
                <p className="text-sm text-gray-600">
                  Are you sure you want to update the event status?
                </p>
              </div>
            </div>

            <div className="mb-6 p-4 bg-gray-50 rounded-md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Current Status:</span>
                <Badge className={currentStatusConfig.color}>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(event.status)}
                    {currentStatusConfig.label}
                  </div>
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">New Status:</span>
                <Badge
                  className={
                    STATUS_CONFIG[selectedStatus as keyof typeof STATUS_CONFIG]
                      ?.color
                  }
                >
                  <div className="flex items-center gap-1">
                    {getStatusIcon(selectedStatus)}
                    {
                      STATUS_CONFIG[
                        selectedStatus as keyof typeof STATUS_CONFIG
                      ]?.label
                    }
                  </div>
                </Badge>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={cancelStatusUpdate}
                disabled={updatingStatus === selectedStatus}
              >
                Cancel
              </Button>
              <Button
                onClick={confirmStatusUpdate}
                disabled={updatingStatus === selectedStatus}
                className={`
                  ${
                    selectedStatus === "active"
                      ? "bg-green-600 hover:bg-green-700"
                      : ""
                  }
                  ${
                    selectedStatus === "cancelled"
                      ? "bg-red-600 hover:bg-red-700"
                      : ""
                  }
                  ${
                    selectedStatus === "completed"
                      ? "bg-blue-600 hover:bg-blue-700"
                      : ""
                  }
                  ${
                    selectedStatus === "suspended"
                      ? "bg-orange-600 hover:bg-orange-700"
                      : ""
                  }
                `}
              >
                {updatingStatus === selectedStatus ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    {getStatusIcon(selectedStatus)}
                    Update to{" "}
                    {
                      STATUS_CONFIG[
                        selectedStatus as keyof typeof STATUS_CONFIG
                      ]?.label
                    }
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/admin/events")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{event.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                className={`${currentStatusConfig.color} flex items-center gap-1`}
              >
                {getStatusIcon(event.status)}
                {currentStatusConfig.label}
              </Badge>
              <span className="text-gray-500 text-sm">
                Event ID: {event.eventId}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/admin/events/${eventId}/edit`)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Event
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Delete Event"
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Event Details Card */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
              <CardDescription>
                Complete information about the event
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-gray-700 whitespace-pre-line">
                  {event.description}
                </p>
              </div>

              {/* Event Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Date & Time</p>
                      <p className="font-medium">{formatDate(event.date)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium">{event.location}</p>
                      <p className="text-sm text-gray-600">{event.city}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Organizer</p>
                      <p className="font-medium">{event.organizer}</p>
                      <p className="text-sm text-gray-600">
                        {event.organizerEmail}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Ticket className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Tickets</p>
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="font-medium">
                            Total: {event.totalTickets}
                          </p>
                          <p className="text-sm text-gray-600">
                            Sold: {event.ticketsSold || 0}
                          </p>
                        </div>
                        <div className="h-10 w-px bg-gray-200" />
                        <div>
                          <p className="text-sm text-gray-500">Available</p>
                          <p className="font-medium text-green-600">
                            {event.totalTickets - (event.ticketsSold || 0)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <DollarSign className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Financials</p>
                      <div className="space-y-1">
                        <p className="font-medium">
                          Ticket Price: ETB {event.ticketPrice || 0}
                        </p>
                        <p className="font-medium">
                          Revenue: ETB {event.revenue || 0}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-1">Category</p>
                    <Badge variant="outline">{event.category}</Badge>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="pt-4 border-t">
                <h3 className="text-lg font-semibold mb-3">
                  Additional Information
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Created</p>
                    <p className="font-medium">
                      {new Date(event.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Last Updated</p>
                    <p className="font-medium">
                      {new Date(event.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">User ID</p>
                    <p className="font-medium text-sm truncate">
                      {event.userId}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Event ID</p>
                    <p className="font-medium text-sm truncate">
                      {event.eventId}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Cards */}
        <div className="space-y-6">
          {/* Event Image */}
          <Card>
            <CardHeader>
              <CardTitle>Event Image</CardTitle>
            </CardHeader>
            <CardContent>
              <img
                src={
                  event.imageUrl ||
                  "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800"
                }
                alt={event.title}
                className="w-full h-48 object-cover rounded-md"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800";
                }}
              />
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full"
                onClick={() => router.push(`/admin/events/${eventId}/edit`)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Event
              </Button>

              <div className="space-y-2">
                <p className="text-sm text-gray-500">Update Status</p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(STATUS_CONFIG).map(([statusKey, config]) => {
                    const Icon = config.icon;
                    const isCurrent = event.status === statusKey;
                    const isUpdating = updatingStatus === statusKey;

                    return (
                      <Button
                        key={statusKey}
                        variant="outline"
                        size="sm"
                        className={`text-xs flex items-center justify-center gap-1 ${
                          isCurrent ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                        onClick={() =>
                          !isCurrent && handleStatusUpdate(statusKey)
                        }
                        disabled={isCurrent || isUpdating || !!updatingStatus}
                      >
                        {isUpdating ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Icon className="h-3 w-3" />
                        )}
                        {config.label}
                      </Button>
                    );
                  })}
                </div>
              </div>

              <Button
                variant="destructive"
                className="w-full"
                onClick={handleDelete}
                disabled={loading || !!updatingStatus}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Delete Event"
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Tickets Sold</span>
                  <span className="font-semibold">
                    {event.ticketsSold || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Capacity</span>
                  <span className="font-semibold">{event.totalTickets}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Occupancy Rate</span>
                  <span className="font-semibold">
                    {event.totalTickets > 0
                      ? `${Math.round(
                          ((event.ticketsSold || 0) / event.totalTickets) * 100
                        )}%`
                      : "0%"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Revenue</span>
                  <span className="font-semibold">
                    ETB {event.revenue || 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
