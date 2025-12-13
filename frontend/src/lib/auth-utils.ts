import { NextRequest } from "next/server";

export function verifyAuthToken(request: NextRequest): {
  userId: string | null;
  role: string | null;
} {
  // In a real app, verify JWT token from cookies/headers
  const token = request.cookies.get("auth-token")?.value;

  if (!token) {
    return { userId: null, role: null };
  }

  // Mock token verification
  if (token.includes("admin")) {
    return { userId: "1", role: "admin" };
  } else if (token.includes("mock-token")) {
    return { userId: "2", role: "user" };
  }

  return { userId: null, role: null };
}

export function requireAuth(handler: Function) {
  return async (request: NextRequest) => {
    const { userId } = verifyAuthToken(request);

    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    return handler(request);
  };
}

export function requireAdmin(handler: Function) {
  return async (request: NextRequest) => {
    const { userId, role } = verifyAuthToken(request);

    if (!userId || role !== "admin") {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    return handler(request);
  };
}
