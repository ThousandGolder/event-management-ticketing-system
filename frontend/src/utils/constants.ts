export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  EVENTS: "/events",
  TICKETS: "/tickets",
  ADMIN: "/admin",
  PROFILE: "/profile",
};

export const EVENT_CATEGORIES = [
  "Music",
  "Sports",
  "Technology",
  "Food",
  "Art",
  "Business",
  "Education",
  "Health",
  "Other",
] as const;

export const TICKET_STATUS = {
  VALID: "valid",
  USED: "used",
  CANCELLED: "cancelled",
  PENDING: "pending",
} as const;

export const USER_ROLES = {
  ADMIN: "admin",
  MODERATOR: "moderator",
  USER: "user",
  GUEST: "guest",
} as const;
