"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Home,
  Calendar,
  Ticket,
  Users,
  Settings,
  BarChart3,
  Shield,
  Menu,
  Bell,
  Search,
  UserCircle,
  LogOut,
  ChevronRight,
  Zap,
  TrendingUp,
  Star,
  Clock,
  X,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

import { useAuth } from "../../components/providers/AuthProvider";

// Define User type
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  allowedRoles: string[];
  count?: number;
  isNew?: boolean;
}

interface UserStats {
  upcomingEvents: number;
  ticketsPurchased: number;
  loyaltyPoints: number;
  totalEvents?: number;
  totalTickets?: number;
  organizedEvents?: number;
  attendingEvents?: number;
  upcomingOrganized?: number;
  pastOrganized?: number;
  upcomingAttending?: number;
  pastAttending?: number;
  organizedTicketsSold?: number;
  organizedRevenue?: number;
  totalSpent?: number;
  averageTicketPrice?: number;
  organizedCompletionRate?: number;
  attendanceRate?: number;
}

const navItems: NavItem[] = [
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
    label: "My Profile",
    icon: <UserCircle className="h-4 w-4" />,
    allowedRoles: ["user", "attendee"],
  },
  {
    href: "/admin/events",
    label: "Events",
    icon: <Calendar className="h-4 w-4" />,
    allowedRoles: ["admin", "organizer"],
  },
  {
    href: "/admin/events/create",
    label: "Create Event",
    icon: <Zap className="h-4 w-4" />,
    allowedRoles: ["admin", "organizer"],
    isNew: true,
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

// API Configuration
const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
  endpoints: {
    userStats: "/user/stats",
    eventCounts: "/events/counts",
    userEvents: "/user/events",
    userTickets: "/user/tickets",
  },
};

// API service functions
const apiService = {
  // Fetch user stats
  async getUserStats(userId: string): Promise<UserStats | null> {
    try {
      const url = `${API_CONFIG.baseURL}${API_CONFIG.endpoints.userStats}?userId=${userId}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch stats: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      const backendStats = data.stats || {};
      const frontendStats: UserStats = {
        upcomingEvents:
          backendStats.upcomingAttending || backendStats.upcomingEvents || 0,
        ticketsPurchased:
          backendStats.ticketsPurchased || backendStats.totalTickets || 0,
        loyaltyPoints: 0,
        totalEvents: backendStats.organizedEvents || 0,
        ...backendStats,
      };

      return frontendStats;
    } catch (error) {
      return null;
    }
  },

  // Fetch event counts for admin
  async getEventCounts(): Promise<number> {
    try {
      const url = `${API_CONFIG.baseURL}${API_CONFIG.endpoints.eventCounts}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch event counts: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();

      if (data.counts && typeof data.counts.totalEvents === "number") {
        return data.counts.totalEvents;
      } else if (typeof data.totalEvents === "number") {
        return data.totalEvents;
      } else if (data.total && typeof data.total === "number") {
        return data.total;
      }

      return 0;
    } catch (error) {
      return 0;
    }
  },

  // Fetch user events count
  async getUserEventsCount(userId: string): Promise<number> {
    try {
      const url = `${API_CONFIG.baseURL}${API_CONFIG.endpoints.userEvents}?userId=${userId}&tab=attending`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch user events: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      return data.events?.length || data.counts?.attending || 0;
    } catch (error) {
      return 0;
    }
  },

  // Fetch user tickets count
  async getUserTicketsCount(userId: string): Promise<number> {
    try {
      const url = `${API_CONFIG.baseURL}${API_CONFIG.endpoints.userTickets}?userId=${userId}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch user tickets: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      return data.tickets?.length || 0;
    } catch (error) {
      return 0;
    }
  },

  // Fetch notifications
  async getNotifications(userId: string): Promise<number> {
    try {
      const response = await fetch(
        `http://localhost:3001/user/notifications?userId=${userId}&unread=true`
      );
      if (!response.ok) return 0;
      const data = await response.json();
      return data.count || 0;
    } catch (error) {
      return 0;
    }
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationsCount, setNotificationsCount] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [navCounts, setNavCounts] = useState<Record<string, number>>({});
  const { user, logout } = useAuth<User>();

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter nav items based on user role
  const filteredNavItems = user
    ? navItems.filter((item) => item.allowedRoles.includes(user.role || ""))
    : [];

  // Load user data and stats
  useEffect(() => {
    if (!user?.id) return;

    const loadUserData = async () => {
      setLoadingStats(true);

      try {
        // Load user stats
        const stats = await apiService.getUserStats(user.id);
        if (stats) {
          setUserStats(stats);
        }

        // Load notifications
        const notifications = await apiService.getNotifications(user.id);
        setNotificationsCount(notifications);

        // Load navigation item counts based on user role
        const counts: Record<string, number> = {};

        if (user.role === "admin" || user.role === "organizer") {
          const eventCount = await apiService.getEventCounts();
          counts["/admin/events"] = eventCount;
        }

        if (user.role === "user" || user.role === "attendee") {
          const userEventsCount = await apiService.getUserEventsCount(user.id);
          const userTicketsCount = await apiService.getUserTicketsCount(
            user.id
          );

          counts["/user/events"] = userEventsCount;
          counts["/user/tickets"] = userTicketsCount;
        }

        setNavCounts(counts);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        });
      } finally {
        setLoadingStats(false);
      }
    };

    loadUserData();
  }, [user?.id, user?.role, toast]);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      setIsSearching(false);
    }
  };

  // Clear notifications
  const clearNotifications = async () => {
    if (!user?.id) return;

    try {
      await fetch(`http://localhost:3001/user/notifications/read`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      setNotificationsCount(0);
    } catch (error) {
      setNotificationsCount(0);
    }
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // Add keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsSearching(true);
        searchInputRef.current?.focus();
      }
      if (e.key === "Escape") {
        setIsSearching(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Get current page name for breadcrumb
  const getCurrentPageName = () => {
    if (!pathname) return "Overview";

    const pathParts = pathname.split("/").filter(Boolean);
    const currentPage = pathParts[pathParts.length - 1] || "overview";

    return currentPage.charAt(0).toUpperCase() + currentPage.slice(1);
  };

  // Update nav items with dynamic counts
  const navItemsWithCounts = filteredNavItems.map((item) => ({
    ...item,
    count: navCounts[item.href] || item.count,
  }));

  return (
    <div className="min-h-screen flex bg-background overflow-hidden">
      {/* MOBILE SIDEBAR */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="fixed top-4 left-4 z-50 lg:hidden shadow-md hover:shadow-lg transition-all duration-200"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>

        <SheetContent
          side="left"
          className="w-72 p-0 h-full flex flex-col overflow-y-auto"
        >
          <div className="sr-only">
            <h2>Navigation Menu</h2>
            <p>Main navigation menu for EventHub dashboard</p>
          </div>
          <SidebarContent
            pathname={pathname}
            user={user}
            navItems={navItemsWithCounts}
            userStats={userStats}
            loadingStats={loadingStats}
            onClose={() => setSidebarOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:h-screen overflow-y-auto bg-background border-r">
        <SidebarContent
          pathname={pathname}
          user={user}
          navItems={navItemsWithCounts}
          userStats={userStats}
          loadingStats={loadingStats}
        />
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-40 h-16 border-b bg-background flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 flex-1">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative flex-1 max-w-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  ref={searchInputRef}
                  type="search"
                  placeholder="Search events, tickets..."
                  className="pl-10 pr-4 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearching(true)}
                />
                {!isSearching && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 hidden sm:flex items-center gap-1">
                    <span className="text-xs text-muted-foreground">⌘K</span>
                  </div>
                )}
              </div>
            </form>
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="relative hover:bg-primary/10"
                onClick={clearNotifications}
                disabled={notificationsCount === 0}
              >
                <Bell className="h-5 w-5" />
                {notificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
                    {notificationsCount}
                  </span>
                )}
              </Button>
            </div>

            {/* User Avatar with Menu Sheet */}
            <Sheet open={userMenuOpen} onOpenChange={setUserMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-9 w-9 rounded-full p-0"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage
                      src={user?.avatar || ""}
                      alt={user?.name || "User"}
                    />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user?.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <div className="sr-only">
                  <h2>User Menu</h2>
                  <p>User account and settings menu</p>
                </div>

                <UserMenuContent
                  user={user}
                  onClose={() => setUserMenuOpen(false)}
                  onLogout={handleLogout}
                />
              </SheetContent>
            </Sheet>
          </div>
        </header>

        {/* Quick Stats Card for Regular Users */}
        {pathname === "/user" && user?.role !== "admin" && (
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="p-4">
                {loadingStats ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : userStats ? (
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Upcoming
                          </p>
                          <p className="text-lg font-semibold">
                            {userStats.upcomingEvents || 0}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Ticket className="h-4 w-4 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Tickets
                          </p>
                          <p className="text-lg font-semibold">
                            {userStats.ticketsPurchased || 0}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Points
                          </p>
                          <p className="text-lg font-semibold">
                            {userStats.loyaltyPoints || 0}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">Active Member</span>
                    </div>

                    {/* Show organized events if available */}
                    {userStats.organizedEvents &&
                      userStats.organizedEvents > 0 && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-blue-500" />
                          <span className="text-sm font-medium">
                            Organized: {userStats.organizedEvents}
                          </span>
                        </div>
                      )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-4 text-muted-foreground">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    <span>Unable to load stats</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Breadcrumbs */}
        <div className="px-4 sm:px-6 lg:px-8 py-3 border-b bg-muted/10">
          <div className="flex items-center text-sm text-muted-foreground">
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 hover:text-foreground transition-colors"
              onClick={() => router.push("/user")}
            >
              Dashboard
            </Button>
            <ChevronRight className="h-3 w-3 mx-2" />
            <span className="font-medium text-foreground">
              {getCurrentPageName()}
            </span>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-auto w-full">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}

// User Menu Component
function UserMenuContent({
  user,
  onClose,
  onLogout,
}: {
  user: User | null | undefined;
  onClose: () => void;
  onLogout: () => void;
}) {
  const router = useRouter();

  return (
    <div className="flex flex-col space-y-4 pt-6">
      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12">
          <AvatarImage src={user?.avatar || ""} alt={user?.name || "User"} />
          <AvatarFallback className="bg-primary text-primary-foreground">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold">{user?.name || "User"}</p>
          <p className="text-sm text-muted-foreground">
            {user?.email || "user@example.com"}
          </p>
          <div className="mt-1">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
              {user?.role || "user"}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-1"></div>

      <div className="pt-4 border-t">
        <Button
          variant="destructive"
          className="w-full justify-start"
          onClick={onLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </Button>
      </div>
    </div>
  );
}

// Sidebar Content Component
function SidebarContent({
  pathname,
  user,
  navItems,
  userStats,
  loadingStats,
  onClose,
}: {
  pathname: string;
  user: User | null | undefined;
  navItems: NavItem[];
  userStats: UserStats | null;
  loadingStats: boolean;
  onClose?: () => void;
}) {
  const router = useRouter();

  return (
    <div className="flex h-full flex-col">
      {/* LOGO */}
      <div className="flex h-16 items-center border-b px-4 sm:px-6">
        <Button
          variant="ghost"
          className="flex items-center gap-2 font-bold text-lg p-0 h-auto hover:bg-transparent"
          onClick={() => {
            router.push("/");
            if (onClose) onClose();
          }}
        >
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Calendar className="h-5 w-5 text-primary-foreground" />
          </div>
          <span>EventHub</span>
        </Button>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* USER INFO */}
      {user && (
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.avatar || ""} alt={user.name || "User"} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {user.name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">
                {user.name || "User"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user.email || "user@example.com"}
              </p>
            </div>
          </div>
          <div className="mt-3">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
              {user.role || "user"}
            </span>
          </div>

          {/* Stats Progress */}
          {user.role === "user" || user.role === "attendee" ? (
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Activity Level</span>
                <span className="font-medium">
                  {loadingStats
                    ? "Loading..."
                    : userStats
                    ? `${Math.min(
                        100,
                        Math.floor(
                          ((userStats.ticketsPurchased || 0) / 10) * 100
                        )
                      )}%`
                    : "0%"}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-primary h-1.5 rounded-full transition-all duration-300"
                  style={{
                    width:
                      loadingStats || !userStats
                        ? "0%"
                        : `${Math.min(
                            100,
                            Math.floor(
                              ((userStats.ticketsPurchased || 0) / 10) * 100
                            )
                          )}%`,
                  }}
                />
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* NAVIGATION */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Navigation
        </div>
        {navItems.map((item) => (
          <Button
            key={item.href}
            variant="ghost"
            className={`w-full justify-between group rounded-lg px-3 py-2.5 text-sm transition-all h-auto ${
              pathname === item.href || pathname.startsWith(item.href + "/")
                ? "bg-primary/10 text-primary"
                : "hover:bg-accent hover:text-accent-foreground"
            }`}
            onClick={() => {
              router.push(item.href);
              if (onClose) onClose();
            }}
          >
            <div className="flex items-center gap-3">
              {item.icon}
              <span className="font-medium">{item.label}</span>
              {item.isNew && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  New
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {item.count !== undefined && item.count > 0 && (
                <span className="h-5 min-w-5 flex items-center justify-center rounded-full bg-primary/20 text-primary text-xs">
                  {item.count}
                </span>
              )}
              <ChevronRight className="h-3 w-3" />
            </div>
          </Button>
        ))}

        {/* Admin Dashboard Link */}
        {user?.role === "admin" && (
          <>
            <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-4">
              Administration
            </div>
            <Button
              variant="ghost"
              className={`w-full justify-between group rounded-lg px-3 py-2.5 text-sm transition-all h-auto ${
                pathname.startsWith("/admin") && pathname === "/admin"
                  ? "bg-destructive/10 text-destructive"
                  : "hover:bg-destructive/10 hover:text-destructive"
              }`}
              onClick={() => {
                router.push("/admin");
                if (onClose) onClose();
              }}
            >
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4" />
                <span className="font-medium">Admin Dashboard</span>
              </div>
              <ChevronRight className="h-3 w-3" />
            </Button>
          </>
        )}
      </nav>

      {/* FOOTER */}
      <div className="border-t p-4 text-xs text-muted-foreground">
        <div className="flex items-center justify-between mb-1">
          <p className="font-medium">© 2025 EventHub</p>
          <span className="text-muted-foreground">v1.0.0</span>
        </div>
        <p className="text-[10px] opacity-75">Live data integration</p>
      </div>
    </div>
  );
}
