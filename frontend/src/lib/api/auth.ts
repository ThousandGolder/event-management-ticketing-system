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

  // Add auth token if available (except for login/register)
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (
    token &&
    !endpoint.includes("/auth/login") &&
    !endpoint.includes("/auth/register")
  ) {
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

export const authAPI = {
  register: async (userData: {
    username: string;
    name: string;
    email: string;
    password: string;
    userType: "attendee" | "organizer" | "admin";
  }) => {
    try {
      const data = await fetchAPI("/auth/register", {
        method: "POST",
        body: JSON.stringify(userData),
      });

      return {
        success: true,
        user: data.user,
        token: data.token,
        message: data.message || "Registration successful",
      };
    } catch (error: any) {
      console.error("❌ Error registering:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  login: async (email: string, password: string) => {
    try {
      const data = await fetchAPI("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      // Store token and user data
      if (data.token && typeof window !== "undefined") {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user || {}));
      }

      return {
        success: true,
        user: data.user,
        token: data.token,
        message: data.message || "Login successful",
      };
    } catch (error: any) {
      console.error("❌ Error logging in:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  },

  getCurrentUser: async () => {
    try {
      const data = await fetchAPI("/auth/me");
      return {
        success: true,
        user: data.user,
      };
    } catch (error: any) {
      console.error("❌ Error getting current user:", error);
      return {
        success: false,
        error: error.message,
        user: null,
      };
    }
  },
};
