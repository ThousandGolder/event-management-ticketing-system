const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

export const healthAPI = {
  check: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      const data = await response.json().catch(() => ({}));

      return {
        success: response.ok,
        status: response.status,
        data,
      };
    } catch (error: any) {
      console.error(" Health check failed:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },
};
