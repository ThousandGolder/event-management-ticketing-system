"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  Home,
  Calendar,
  Ticket,
  Users,
  Settings,
  BarChart3,
  Shield,
  Menu,
} from "lucide-react";

import { useAuth } from "../../components/providers/AuthProvider";

// Navigation items structure
interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  allowedRoles: string[]; // Which roles can see this item
}

const navItems: NavItem[] = [
  // User items - visible to all authenticated users
  {
    href: "/user",
    label: "Overview",
    icon: <Home className="h-4 w-4" />,
    allowedRoles: ["user", "attendee"],
  },
  {
    href: "/user/events",
    label: "My Events",
    icon: <Calendar className="h-4 w-4" />,
    allowedRoles: ["user", "attendee"],
  },
  {
    href: "/user/tickets",
    label: "My Tickets",
    icon: <Ticket className="h-4 w-4" />,
    allowedRoles: ["user", "attendee"],
  },

  {
    href: "/user/profile",
    label: "My profile",
    icon: <Users className="h-4 w-4" />,
    allowedRoles: ["user", "attendee"],
  },

  // Admin-only items
  {
    href: "/admin/users",
    label: "Magange Users",
    icon: <Users className="h-4 w-4" />,
    allowedRoles: ["admin"],
  },
  {
    href: "/admin/events",
    label: "Events",
    icon: <Calendar className="h-4 w-4" />,
    allowedRoles: ["admin", "organizer"],
  },
  {
    href: "/admin/events/create",
    label: "Create Events",
    icon: <Calendar className="h-4 w-4" />,
    allowedRoles: ["admin", "organizer"],
  },
  {
    href: "/admin/analytics",
    label: "Analytics",
    icon: <BarChart3 className="h-4 w-4" />,
    allowedRoles: ["admin"],
  },
  {
    href: "/admin/settings",
    label: "Settings",
    icon: <Settings className="h-4 w-4" />,
    allowedRoles: ["admin"],
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  // Filter nav items based on user role
  const filteredNavItems = user
    ? navItems.filter((item) => item.allowedRoles.includes(user.role))
    : [];

  return (
    <div className="min-h-screen flex bg-background overflow-hidden">
      {/* MOBILE SIDEBAR */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="fixed top-4 left-4 z-50 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>

        <SheetContent
          side="left"
          className="w-64 p-0 h-full flex flex-col overflow-y-auto bg-background"
        >
          <SidebarContent
            pathname={pathname}
            user={user}
            filteredNavItems={filteredNavItems}
            onClose={() => setSidebarOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:border-r lg:h-screen overflow-y-auto">
        <SidebarContent
          pathname={pathname}
          user={user}
          filteredNavItems={filteredNavItems}
        />
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-40 h-16 border-b bg-background flex items-center justify-end px-4 sm:px-6">
          <ThemeToggle />
        </header>

        <main className="flex-1 p-4 sm:p-6 overflow-x-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}

function SidebarContent({
  pathname,
  user,
  filteredNavItems,
  onClose,
}: {
  pathname: string;
  user: any;
  filteredNavItems: NavItem[];
  onClose?: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      {/* LOGO */}
      <div className="flex h-16 items-center border-b px-4 sm:px-6 flex-shrink-0">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold"
          onClick={onClose}
        >
          <Calendar className="h-6 w-6 text-primary" />
          <span className="truncate">EventHub</span>
        </Link>
      </div>

      {/* USER INFO */}
      {user && (
        <div className="p-4 border-b bg-muted/20">
          <p className="text-sm font-medium truncate">{user.name}</p>
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          <div className="mt-1">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
              {user.role}
            </span>
          </div>
        </div>
      )}

      {/* NAVIGATION */}
      <nav className="flex-1 p-2 sm:p-4 space-y-1 overflow-y-auto">
        {filteredNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm sm:text-base transition-colors truncate ${
              pathname === item.href || pathname.startsWith(item.href + "/")
                ? "bg-primary/10 text-primary"
                : "hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            {item.icon}
            <span className="truncate">{item.label}</span>
          </Link>
        ))}

        {/* Admin link - only show to admins */}
        {user?.role === "admin" && (
          <Link
            href="/admin"
            onClick={onClose}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm sm:text-base transition-colors truncate ${
              pathname.startsWith("/admin") && pathname === "/admin"
                ? "bg-destructive/10 text-destructive"
                : "hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <Shield className="h-4 w-4" />
            <span>Admin Dashboard</span>
          </Link>
        )}
      </nav>

      {/* FOOTER */}
      <div className="border-t p-4 text-xs sm:text-sm text-muted-foreground flex-shrink-0">
        <p className="truncate">© 2025 EventHub</p>
        <p className="mt-1 truncate">v1.0.0</p>
      </div>
    </div>
  );
}
