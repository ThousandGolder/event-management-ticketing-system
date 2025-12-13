import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

// Define user type
interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "organizer" | "attendee";
  avatar?: string;
}

// Mock user database (in production, use real database)
const users: User[] = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@example.com",
    role: "admin",
    avatar: "AU",
  },
  {
    id: "2",
    name: "Organizer User",
    email: "organizer@example.com",
    role: "organizer",
    avatar: "OU",
  },
  {
    id: "3",
    name: "Demo User",
    email: "user@example.com",
    role: "attendee",
    avatar: "DU",
  },
];

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // In production, verify credentials with your database
        const user = users.find((user) => user.email === credentials.email);

        // For demo purposes, accept any password
        if (user) {
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
          };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.avatar = (user as any).avatar;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        (session.user as any).role = token.role;
        (session.user as any).avatar = token.avatar;
        (session.user as any).id = token.sub;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login",
    newUser: "/register",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// Type declarations for NextAuth
declare module "next-auth" {
  interface User {
    role?: "admin" | "organizer" | "attendee";
    avatar?: string;
  }

  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: "admin" | "organizer" | "attendee";
      avatar?: string;
    };
  }
}
