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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { eventsAPI } from "@/lib/api/events";
import { Loader2, ArrowLeft, Save, X, AlertCircle } from "lucide-react";

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);

  const [originalData, setOriginalData] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    city: "",
    category: "",
    organizer: "",
    organizerEmail: "",
    totalTickets: "100",
    ticketPrice: "0",
    revenue: "0",
    ticketsSold: "0",
    status: "pending",
    imageUrl: "",
  });

  useEffect(() => {
    if (eventId) {
      fetchEventData();
    }
  }, [eventId]);

  useEffect(() => {
    // Check if form has changes
    if (originalData) {
      const hasFormChanged = Object.keys(formData).some((key) => {
        const formValue = formData[key as keyof typeof formData];
        const originalValue = originalData[key]?.toString() || "";
        return formValue !== originalValue;
      });
      setHasChanges(hasFormChanged);
    }
  }, [formData, originalData]);

  const fetchEventData = async () => {
    try {
      setFetching(true);
      setError(null);

      const result = await eventsAPI.getById(eventId);

      if (result.success && result.event) {
        const event = result.event;

        // Format date for datetime-local input
        const dateObj = new Date(event.date);
        const formattedDate = dateObj.toISOString().slice(0, 16);

        const newFormData = {
          title: event.title || "",
          description: event.description || "",
          date: formattedDate,
          location: event.location || "",
          city: event.city || "",
          category: event.category || "",
          organizer: event.organizer || "",
          organizerEmail: event.organizerEmail || "",
          totalTickets: event.totalTickets?.toString() || "100",
          ticketPrice: event.ticketPrice?.toString() || "0",
          revenue: event.revenue?.toString() || "0",
          ticketsSold: event.ticketsSold?.toString() || "0",
          status: event.status || "pending",
          imageUrl: event.imageUrl || "",
        };

        setFormData(newFormData);
        setOriginalData({
          ...newFormData,
          totalTickets: event.totalTickets?.toString() || "100",
          ticketPrice: event.ticketPrice?.toString() || "0",
          revenue: event.revenue?.toString() || "0",
          ticketsSold: event.ticketsSold?.toString() || "0",
        });
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

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasChanges) {
      toast({
        title: "No Changes",
        description: "No changes were made to the event.",
        variant: "default",
      });
      return;
    }

    setShowSaveConfirm(true);
  };

  const confirmSave = async () => {
    setShowSaveConfirm(false);
    setLoading(true);
    setError(null);

    try {
      // Prepare data for API
      const eventData = {
        ...formData,
        totalTickets: parseInt(formData.totalTickets, 10),
        ticketPrice: parseFloat(formData.ticketPrice),
        revenue: parseFloat(formData.revenue),
        ticketsSold: parseInt(formData.ticketsSold, 10),
        date: new Date(formData.date).toISOString(),
      };

      console.log("Updating event with data:", eventData);

      // Call your backend API to update the event
      const result = await eventsAPI.update(eventId, eventData);

      if (result.success) {
        toast({
          title: "Success!",
          description: result.message || "Event updated successfully",
        });
        setOriginalData(formData); // Update original data to match new state
        setHasChanges(false);
        router.push(`/admin/events/${eventId}`);
      } else {
        setError(result.error || "Failed to update event");
        toast({
          title: "Error",
          description: result.error || "Failed to update event",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error updating event:", error);
      setError(error.message || "An unexpected error occurred");
      toast({
        title: "Error",
        description: error.message || "Failed to update event",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      setShowCancelConfirm(true);
    } else {
      router.push(`/admin/events/${eventId}`);
    }
  };

  const confirmCancel = () => {
    setShowCancelConfirm(false);
    router.push(`/admin/events/${eventId}`);
  };

  const handleReset = () => {
    if (originalData) {
      setFormData(originalData);
      setHasChanges(false);
      toast({
        title: "Reset",
        description: "All changes have been reset",
        variant: "default",
      });
    }
  };

  const categories = [
    "Music",
    "Sports",
    "Technology",
    "Business",
    "Art",
    "Food",
    "Education",
    "Health",
    "Other",
  ];

  const cities = [
    "Addis Ababa",
    "Dire Dawa",
    "Mekelle",
    "Gondar",
    "Bahir Dar",
    "Hawassa",
    "Jimma",
    "Other",
  ];

  const statusOptions = [
    { value: "draft", label: "Draft" },
    { value: "pending", label: "Pending" },
    { value: "active", label: "Active" },
    { value: "suspended", label: "Suspended" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ];

  if (fetching) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p>Loading event data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !formData.title) {
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

  return (
    <div className="container mx-auto py-6">
      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-full bg-yellow-100">
                <AlertCircle className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Unsaved Changes</h3>
                <p className="text-sm text-gray-600">
                  You have unsaved changes. Are you sure you want to leave?
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowCancelConfirm(false)}
              >
                Continue Editing
              </Button>
              <Button variant="destructive" onClick={confirmCancel}>
                Discard Changes
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Save Confirmation Modal */}
      {showSaveConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-full bg-blue-100">
                <Save className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Save Changes</h3>
                <p className="text-sm text-gray-600">
                  Are you sure you want to save the changes to this event?
                </p>
              </div>
            </div>

            <div className="mb-4 p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-600">
                This will update the event with the new information.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowSaveConfirm(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={confirmSave}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={handleCancel}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Edit Event</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-gray-500 text-sm">Event ID: {eventId}</span>
              {hasChanges && (
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                  Unsaved Changes
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCancel}>
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={!hasChanges || loading}
          >
            Reset
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!hasChanges || loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md mb-6">
          <p className="font-medium">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
          <CardDescription>
            Update the details for this event.{" "}
            {hasChanges && "You have unsaved changes."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter event title"
                  required
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your event"
                  rows={4}
                  required
                />
              </div>

              {/* Date */}
              <div className="space-y-2">
                <Label htmlFor="date">Date and Time *</Label>
                <Input
                  id="date"
                  name="date"
                  type="datetime-local"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select status</option>
                  {statusOptions.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location">Venue/Location *</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Enter venue name"
                  required
                />
              </div>

              {/* City */}
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <select
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select city</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              {/* Organizer */}
              <div className="space-y-2">
                <Label htmlFor="organizer">Organizer Name *</Label>
                <Input
                  id="organizer"
                  name="organizer"
                  value={formData.organizer}
                  onChange={handleChange}
                  placeholder="Enter organizer name"
                  required
                />
              </div>

              {/* Organizer Email */}
              <div className="space-y-2">
                <Label htmlFor="organizerEmail">Organizer Email</Label>
                <Input
                  id="organizerEmail"
                  name="organizerEmail"
                  type="email"
                  value={formData.organizerEmail}
                  onChange={handleChange}
                  placeholder="organizer@example.com"
                />
              </div>

              {/* Total Tickets */}
              <div className="space-y-2">
                <Label htmlFor="totalTickets">Total Tickets *</Label>
                <Input
                  id="totalTickets"
                  name="totalTickets"
                  type="number"
                  min="1"
                  value={formData.totalTickets}
                  onChange={handleChange}
                  placeholder="Enter total number of tickets"
                  required
                />
              </div>

              {/* Ticket Price */}
              <div className="space-y-2">
                <Label htmlFor="ticketPrice">Ticket Price (ETB)</Label>
                <Input
                  id="ticketPrice"
                  name="ticketPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.ticketPrice}
                  onChange={handleChange}
                  placeholder="0.00"
                />
              </div>

              {/* Revenue */}
              <div className="space-y-2">
                <Label htmlFor="revenue">Revenue (ETB)</Label>
                <Input
                  id="revenue"
                  name="revenue"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.revenue}
                  onChange={handleChange}
                  placeholder="0.00"
                />
              </div>

              {/* Tickets Sold */}
              <div className="space-y-2">
                <Label htmlFor="ticketsSold">Tickets Sold</Label>
                <Input
                  id="ticketsSold"
                  name="ticketsSold"
                  type="number"
                  min="0"
                  value={formData.ticketsSold}
                  onChange={handleChange}
                  placeholder="0"
                />
              </div>

              {/* Image URL */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="imageUrl">Event Image URL</Label>
                <Input
                  id="imageUrl"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                />
                {formData.imageUrl && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 mb-2">Preview:</p>
                    <img
                      src={formData.imageUrl}
                      alt="Event preview"
                      className="w-32 h-32 object-cover rounded-md"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800";
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
              <div className="text-sm text-gray-500">
                {hasChanges ? "You have unsaved changes" : "All changes saved"}
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  disabled={!hasChanges || loading}
                >
                  Reset
                </Button>
                <Button type="submit" disabled={!hasChanges || loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
