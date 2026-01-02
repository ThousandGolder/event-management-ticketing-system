const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

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

export const userAPI = {
  // Get user tickets
  getTickets: async (params?: { eventId?: string; status?: string }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.eventId) queryParams.append("eventId", params.eventId);
      if (params?.status) queryParams.append("status", params.status);

      const queryString = queryParams.toString();
      const endpoint = `/user/tickets${queryString ? `?${queryString}` : ""}`;

      const data = await fetchAPI(endpoint);

      return {
        success: true,
        tickets: data.tickets || [],
        total: data.total || 0,
      };
    } catch (error: any) {
      console.error("❌ Error fetching tickets:", error);
      return {
        success: false,
        error: error.message,
        tickets: [],
        total: 0,
      };
    }
  },

  // Get single ticket
  getTicket: async (ticketId: string) => {
    try {
      const data = await fetchAPI(`/user/tickets/${ticketId}`);
      return {
        success: true,
        ticket: data.ticket,
      };
    } catch (error: any) {
      console.error("❌ Error fetching ticket:", error);
      return {
        success: false,
        error: error.message,
        ticket: null,
      };
    }
  },

  // Purchase tickets
  purchaseTickets: async (
    eventId: string,
    tickets: {
      type: string;
      quantity: number;
      attendeeInfo?: any[];
    }
  ) => {
    try {
      const data = await fetchAPI(`/events/${eventId}/purchase`, {
        method: "POST",
        body: JSON.stringify(tickets),
      });

      return {
        success: true,
        orderId: data.orderId,
        tickets: data.tickets,
        paymentUrl: data.paymentUrl,
        message: data.message || "Tickets purchased successfully",
      };
    } catch (error: any) {
      console.error("❌ Error purchasing tickets:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Get user profile
  getProfile: async () => {
    try {
      const data = await fetchAPI("/user/profile");
      return {
        success: true,
        profile: data.profile || data.user,
      };
    } catch (error: any) {
      console.error("❌ Error fetching profile:", error);
      return {
        success: false,
        error: error.message,
        profile: null,
      };
    }
  },

  // Update user profile
  updateProfile: async (profileData: any) => {
    try {
      const data = await fetchAPI("/user/profile", {
        method: "PUT",
        body: JSON.stringify(profileData),
      });

      return {
        success: true,
        profile: data.profile,
        message: data.message || "Profile updated successfully",
      };
    } catch (error: any) {
      console.error("❌ Error updating profile:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },
};
