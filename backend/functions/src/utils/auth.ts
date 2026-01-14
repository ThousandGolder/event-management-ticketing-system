// backend/functions/src/utils/auth.ts - UPDATED TO MATCH login.ts
import * as jwt from "jsonwebtoken";
import * as bcrypt from "bcryptjs";

// MUST BE THE SAME STRING as in login.ts
const JWT_SECRET =
  process.env.JWT_SECRET || "your-jwt-secret-key-change-in-production";

export interface JWTPayload {
  userId: string;
  email: string;
  userType: "admin" | "organizer" | "attendee"; // Changed from 'role' to 'userType' to match login
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

export async function generateToken(payload: JWTPayload): Promise<string> {
  // Use same format as login.ts
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
}

export async function verifyToken(token: string): Promise<JWTPayload> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    // Check if decoded has required fields (match what login.ts sends)
    if (
      typeof decoded.userId === "string" &&
      typeof decoded.email === "string" &&
      typeof decoded.userType === "string" && // Changed from 'role' to 'userType'
      ["admin", "organizer", "attendee"].includes(decoded.userType)
    ) {
      return {
        userId: decoded.userId,
        email: decoded.email,
        userType: decoded.userType,
      };
    }

    throw new Error("Invalid token payload");
  } catch (error) {
    console.error("Token verification failed:", error);
    throw new Error("Invalid token");
  }
}

export function extractTokenFromHeader(event: any): string | null {
  const authHeader =
    event.headers?.Authorization || event.headers?.authorization;
  if (!authHeader) return null;

  const parts = authHeader.split(" ");
  if (parts.length === 2 && parts[0] === "Bearer") {
    return parts[1];
  }

  return null;
}
