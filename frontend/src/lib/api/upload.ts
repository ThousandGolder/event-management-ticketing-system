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

export const uploadAPI = {
  generateUrl: async (filename: string, contentType: string) => {
    try {
      const data = await fetchAPI("/upload/generate-url", {
        method: "POST",
        body: JSON.stringify({ filename, contentType }),
      });

      return {
        success: true,
        uploadUrl: data.uploadUrl,
        fileUrl: data.fileUrl,
        key: data.key,
      };
    } catch (error: any) {
      console.error(" Error generating upload URL:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  uploadFile: async (file: File, folder?: string) => {
    try {
      // Generate upload URL
      const key = `${folder || "uploads"}/${Date.now()}-${file.name}`;
      const urlResponse = await uploadAPI.generateUrl(key, file.type);

      if (!urlResponse.success) {
        throw new Error(urlResponse.error || "Failed to generate upload URL");
      }

      // Upload to S3
      const uploadResponse = await fetch(urlResponse.uploadUrl!, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file");
      }

      return {
        success: true,
        url: urlResponse.fileUrl!,
        key: urlResponse.key!,
      };
    } catch (error: any) {
      console.error(" Error uploading file:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },
};
