// Import the shared fetchAPI function
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

// Re-usable fetch function with better error handling
async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Merge custom headers
  if (options.headers) {
    Object.entries(options.headers).forEach(([key, value]) => {
      if (value !== undefined) {
        headers[key] = value.toString();
      }
    });
  }

  // Add auth token if available
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: "An error occurred",
    }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

export const eventsAPI = {
  // Get all events with filters
  getAll: async (filters?: {
    status?: string;
    category?: string;
    search?: string;
    limit?: number;
    userId?: string;
  }) => {
    try {
      const params = new URLSearchParams();
      if (filters?.status && filters.status !== "all") {
        params.append("status", filters.status);
      }
      if (filters?.category && filters.category !== "all") {
        params.append("category", filters.category);
      }
      if (filters?.search) {
        params.append("search", filters.search);
      }
      if (filters?.limit) {
        params.append("limit", filters.limit.toString());
      }
      if (filters?.userId) {
        params.append("userId", filters.userId);
      }

      const queryString = params.toString();
      const endpoint = `/events${queryString ? `?${queryString}` : ""}`;

      const data = await fetchAPI(endpoint);

      return {
        success: true,
        events: data.events || data.data || [],
        total: data.total,
        page: data.page,
      };
    } catch (error: any) {
      console.error(" Error fetching events:", error);
      return {
        success: false,
        error: error.message,
        events: [],
      };
    }
  },

  // Get event statistics
  getStatistics: async () => {
    try {
      const data = await fetchAPI("/events/statistics");
      return {
        success: true,
        ...data,
      };
    } catch (error: any) {
      console.error(" Error fetching statistics:", error);

      // Fallback: calculate from events
      try {
        const eventsResponse = await eventsAPI.getAll();
        if (eventsResponse.success && eventsResponse.events) {
          const events = eventsResponse.events;
          const stats = {
            totalEvents: events.length,
            totalRevenue: events.reduce(
              (sum: number, event: any) => sum + (event.revenue || 0),
              0
            ),
            totalTicketsSold: events.reduce(
              (sum: number, event: any) => sum + (event.ticketsSold || 0),
              0
            ),
            activeEvents: events.filter((e: any) => e.status === "active")
              .length,
            pendingEvents: events.filter((e: any) => e.status === "pending")
              .length,
            completedEvents: events.filter((e: any) => e.status === "completed")
              .length,
            cancelledEvents: events.filter((e: any) => e.status === "cancelled")
              .length,
            suspendedEvents: events.filter((e: any) => e.status === "suspended")
              .length,
            draftEvents: events.filter((e: any) => e.status === "draft").length,
          };

          return {
            success: true,
            ...stats,
          };
        }
      } catch (fallbackError) {
        // Ignore fallback error
      }

      return {
        success: false,
        error: error.message,
        totalEvents: 0,
        totalRevenue: 0,
        totalTicketsSold: 0,
        activeEvents: 0,
        pendingEvents: 0,
        completedEvents: 0,
        cancelledEvents: 0,
        suspendedEvents: 0,
        draftEvents: 0,
      };
    }
  },

  // Get single event
  getById: async (id: string) => {
    try {
      const data = await fetchAPI(`/events/${id}`);
      return {
        success: true,
        event: data.event || data.data,
      };
    } catch (error: any) {
      console.error(" Error getting event:", error);
      return {
        success: false,
        error: error.message,
        event: null,
      };
    }
  },

  // Create event
  create: async (eventData: any) => {
    try {
      const data = await fetchAPI("/events", {
        method: "POST",
        body: JSON.stringify(eventData),
      });

      return {
        success: true,
        event: data.event || data.data,
        message: data.message || "Event created successfully",
      };
    } catch (error: any) {
      console.error(" Error creating event:", error);
      return {
        success: false,
        error: error.message,
        event: null,
      };
    }
  },

  // Update event
  update: async (id: string, eventData: any) => {
    try {
      const data = await fetchAPI(`/events/${id}`, {
        method: "PUT",
        body: JSON.stringify(eventData),
      });

      return {
        success: true,
        event: data.event || data.data,
        message: data.message || "Event updated successfully",
      };
    } catch (error: any) {
      console.error(" Error updating event:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Update event status
  updateStatus: async (id: string, status: string) => {
    try {
      const data = await fetchAPI(`/events/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });

      return {
        success: true,
        message: data.message || `Event status updated to ${status}`,
        event: data.event || data.data,
      };
    } catch (error: any) {
      console.error("Error updating status:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Delete event
  delete: async (id: string) => {
    try {
      const data = await fetchAPI(`/events/${id}`, {
        method: "DELETE",
      });

      return {
        success: true,
        message: data.message || "Event deleted successfully",
      };
    } catch (error: any) {
      console.error(" Error deleting event:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Bulk operations
  bulkUpdateStatus: async (ids: string[], status: string) => {
    try {
      const data = await fetchAPI("/events/bulk/status", {
        method: "PUT",
        body: JSON.stringify({ ids, status }),
      });

      return {
        success: true,
        message: data.message || `${ids.length} events updated to ${status}`,
        count: data.count || ids.length,
      };
    } catch (error: any) {
      console.error(" Error bulk updating:", error);
      return {
        success: false,
        error: error.message,
        count: 0,
      };
    }
  },

  bulkDelete: async (ids: string[]) => {
    try {
      const data = await fetchAPI("/events/bulk", {
        method: "DELETE",
        body: JSON.stringify({ ids }),
      });

      return {
        success: true,
        message: data.message || `${ids.length} events deleted`,
        count: data.count || ids.length,
      };
    } catch (error: any) {
      console.error(" Error bulk deleting:", error);
      return {
        success: false,
        error: error.message,
        count: 0,
      };
    }
  },

  // User-specific event methods
  getUserEvents: async (params?: {
    tab?: "attending" | "organizing" | "past" | "saved";
    category?: string;
    search?: string;
  }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.tab) queryParams.append("tab", params.tab);
      if (params?.category && params.category !== "all") {
        queryParams.append("category", params.category);
      }
      if (params?.search) queryParams.append("search", params.search);

      const queryString = queryParams.toString();
      const endpoint = `/user/events${queryString ? `?${queryString}` : ""}`;

      const data = await fetchAPI(endpoint);

      return {
        success: true,
        events: data.events || [],
        counts: data.counts || {
          attending: 0,
          organizing: 0,
          past: 0,
          saved: 0,
        },
      };
    } catch (error: any) {
      console.error(" Error fetching user events:", error);
      return {
        success: false,
        error: error.message,
        events: [],
        counts: {
          attending: 0,
          organizing: 0,
          past: 0,
          saved: 0,
        },
      };
    }
  },

  // Save/unsave events
  saveEvent: async (eventId: string) => {
    try {
      const data = await fetchAPI(`/events/${eventId}/save`, {
        method: "POST",
      });

      return {
        success: true,
        message: data.message || "Event saved successfully",
      };
    } catch (error: any) {
      console.error(" Error saving event:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  unsaveEvent: async (eventId: string) => {
    try {
      const data = await fetchAPI(`/events/${eventId}/unsave`, {
        method: "DELETE",
      });

      return {
        success: true,
        message: data.message || "Event unsaved successfully",
      };
    } catch (error: any) {
      console.error(" Error unsaving event:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  getSavedEvents: async () => {
    try {
      const data = await fetchAPI("/user/saved-events");

      return {
        success: true,
        events: data.events || [],
      };
    } catch (error: any) {
      console.error(" Error fetching saved events:", error);
      return {
        success: false,
        error: error.message,
        events: [],
      };
    }
  },
};
