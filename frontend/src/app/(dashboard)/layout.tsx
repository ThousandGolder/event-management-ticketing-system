"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserMenu } from "@/components/auth/UserMenu";
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

const navItems = [
  {
    href: "/dashboard/user",
    label: "Overview",
    icon: <Home className="h-4 w-4" />,
  },
  {
    href: "/dashboard/user/events",
    label: "Events",
    icon: <Calendar className="h-4 w-4" />,
  },
  {
    href: "/dashboard/user/tickets",
    label: "Tickets",
    icon: <Ticket className="h-4 w-4" />,
  },
  {
    href: "/dashboard/admin/users",
    label: "Attendees",
    icon: <Users className="h-4 w-4" />,
  },
  {
    href: "/dashboard/admin/analytics",
    label: "Analytics",
    icon: <BarChart3 className="h-4 w-4" />,
  },
  {
    href: "/dashboard/settings",
    label: "Settings",
    icon: <Settings className="h-4 w-4" />,
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent
            pathname={pathname}
            onClose={() => setSidebarOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:border-r lg:h-screen">
        <SidebarContent pathname={pathname} />
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:pl-64">
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 lg:px-6">
          {/* Mobile menu trigger */}
          <div className="lg:hidden flex items-center">
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
          </div>

          <div className="flex flex-1 items-center justify-end gap-4">
            <ThemeToggle />
            <UserMenu />
          </div>
        </header>

        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}

function SidebarContent({
  pathname,
  onClose,
}: {
  pathname: string;
  onClose?: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold"
          onClick={onClose}
        >
          <Calendar className="h-6 w-6 text-primary" />
          <span>EventHub</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
              pathname === item.href || pathname.startsWith(item.href + "/")
                ? "bg-primary/10 text-primary"
                : "hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}

        {/* Admin Home */}
        <Link
          href="/dashboard/admin"
          onClick={onClose}
          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
            pathname.startsWith("/dashboard/admin")
              ? "bg-destructive/10 text-destructive"
              : "hover:bg-accent hover:text-accent-foreground"
          }`}
        >
          <Shield className="h-4 w-4" />
          Admin
        </Link>
      </nav>

      {/* Footer */}
      <div className="border-t p-4 text-xs text-muted-foreground">
        <p>© 2024 EventHub</p>
        <p className="mt-1">v1.0.0</p>
      </div>
    </div>
  );
}
