"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  Ticket,
  Calendar,
  TrendingUp,
  DollarSign,
  UserCheck,
  Download,
  RefreshCw,
  CalendarDays,
  BarChart as BarChartIcon,
  PieChart,
  Activity,
} from "lucide-react";

// Types
interface AnalyticsData {
  overview: {
    totalUsers: number;
    totalEvents: number;
    ticketsSold: number;
    totalRevenue: number;
    activeUsers: number;
    conversionRate: number;
  };
  revenueTrend: Array<{
    month: string;
    revenue: number;
    tickets: number;
  }>;
  eventStats: Array<{
    name: string;
    tickets: number;
    revenue: number;
    capacity: number;
  }>;
  userGrowth: Array<{
    month: string;
    users: number;
    active: number;
  }>;
  topEvents: Array<{
    id: string;
    name: string;
    ticketsSold: number;
    revenue: number;
    status: string;
  }>;
}

export default function AdminAnalyticsPage() {
  const { toast } = useToast();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "1y">(
    "30d"
  );
  const [chartType, setChartType] = useState<"bar" | "line" | "area">("bar");

  // Fetch analytics data
  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      // TODO: Replace with your actual API endpoint
      // const response = await fetch(`http://localhost:3001/api/analytics?range=${timeRange}`);
      // const result = await response.json();

      // Mock data for demonstration
      const mockData: AnalyticsData = {
        overview: {
          totalUsers: 1542,
          totalEvents: 89,
          ticketsSold: 12457,
          totalRevenue: 4589200,
          activeUsers: 892,
          conversionRate: 12.5,
        },
        revenueTrend: [
          { month: "Jan", revenue: 850000, tickets: 2100 },
          { month: "Feb", revenue: 920000, tickets: 2300 },
          { month: "Mar", revenue: 1100000, tickets: 2750 },
          { month: "Apr", revenue: 980000, tickets: 2450 },
          { month: "May", revenue: 1250000, tickets: 3125 },
          { month: "Jun", revenue: 1380000, tickets: 3450 },
        ],
        eventStats: [
          {
            name: "Music Festival",
            tickets: 4500,
            revenue: 1350000,
            capacity: 85,
          },
          {
            name: "Tech Conference",
            tickets: 3200,
            revenue: 960000,
            capacity: 92,
          },
          {
            name: "Art Exhibition",
            tickets: 1800,
            revenue: 540000,
            capacity: 78,
          },
          { name: "Food Fair", tickets: 2950, revenue: 590000, capacity: 95 },
        ],
        userGrowth: [
          { month: "Jan", users: 1200, active: 650 },
          { month: "Feb", users: 1250, active: 680 },
          { month: "Mar", users: 1320, active: 710 },
          { month: "Apr", users: 1400, active: 750 },
          { month: "May", users: 1480, active: 820 },
          { month: "Jun", users: 1542, active: 892 },
        ],
        topEvents: [
          {
            id: "1",
            name: "Summer Music Festival",
            ticketsSold: 4500,
            revenue: 1350000,
            status: "active",
          },
          {
            id: "2",
            name: "Tech Summit 2024",
            ticketsSold: 3200,
            revenue: 960000,
            status: "active",
          },
          {
            id: "3",
            name: "Art & Culture Expo",
            ticketsSold: 1800,
            revenue: 540000,
            status: "completed",
          },
          {
            id: "4",
            name: "Food & Wine Festival",
            ticketsSold: 2950,
            revenue: 590000,
            status: "active",
          },
        ],
      };

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 800));
      setData(mockData);

      toast({
        title: "Data loaded",
        description: "Analytics data refreshed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const exportData = () => {
    toast({
      title: "Export started",
      description: "Your analytics data is being prepared for download",
    });
    // TODO: Implement actual export functionality
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground">
            Real-time insights and performance metrics
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="flex border rounded-md">
            {(["7d", "30d", "90d", "1y"] as const).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? "default" : "ghost"}
                size="sm"
                onClick={() => setTimeRange(range)}
                className="rounded-none first:rounded-l-md last:rounded-r-md"
              >
                {range}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchAnalytics}
            disabled={loading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>

          <Button variant="outline" size="sm" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(data?.overview.totalRevenue || 0)}
          icon={<DollarSign className="h-5 w-5" />}
          change="+12.5%"
          loading={loading}
        />
        <StatCard
          title="Tickets Sold"
          value={formatNumber(data?.overview.ticketsSold || 0)}
          icon={<Ticket className="h-5 w-5" />}
          change="+8.3%"
          loading={loading}
        />
        <StatCard
          title="Total Events"
          value={formatNumber(data?.overview.totalEvents || 0)}
          icon={<Calendar className="h-5 w-5" />}
          change="+5.2%"
          loading={loading}
        />
        <StatCard
          title="Total Users"
          value={formatNumber(data?.overview.totalUsers || 0)}
          icon={<Users className="h-5 w-5" />}
          change="+4.1%"
          loading={loading}
        />
        <StatCard
          title="Active Users"
          value={formatNumber(data?.overview.activeUsers || 0)}
          icon={<UserCheck className="h-5 w-5" />}
          change="+6.7%"
          loading={loading}
        />
        <StatCard
          title="Conversion Rate"
          value={`${data?.overview.conversionRate.toFixed(1)}%`}
          icon={<TrendingUp className="h-5 w-5" />}
          change="+2.3%"
          loading={loading}
        />
      </div>

      {/* Charts and Detailed Stats */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BarChartIcon className="h-5 w-5" />
                  Revenue Trend
                </CardTitle>
                <CardDescription>
                  Monthly revenue and ticket sales
                </CardDescription>
              </div>
              <div className="flex gap-1">
                {(["bar", "line", "area"] as const).map((type) => (
                  <Button
                    key={type}
                    variant={chartType === type ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setChartType(type)}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {/* Chart would go here - using a placeholder for now */}
              <div className="flex items-center justify-center h-full border rounded-lg">
                <div className="text-center">
                  <BarChartIcon className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Revenue chart visualization
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {chartType === "bar"
                      ? "Bar chart"
                      : chartType === "line"
                      ? "Line chart"
                      : "Area chart"}
                    would display here
                  </p>
                </div>
              </div>

              {/* Data summary */}
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Avg Monthly Revenue
                  </p>
                  <p className="text-lg font-semibold">
                    {formatCurrency(
                      (data?.revenueTrend.reduce(
                        (sum, item) => sum + item.revenue,
                        0
                      ) || 0) / (data?.revenueTrend.length || 1)
                    )}
                  </p>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Avg Monthly Tickets
                  </p>
                  <p className="text-lg font-semibold">
                    {formatNumber(
                      Math.round(
                        (data?.revenueTrend.reduce(
                          (sum, item) => sum + item.tickets,
                          0
                        ) || 0) / (data?.revenueTrend.length || 1)
                      )
                    )}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Event Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Top Performing Events
            </CardTitle>
            <CardDescription>Events with highest ticket sales</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data?.topEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="font-medium">{event.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatNumber(event.ticketsSold)} tickets •{" "}
                      {formatCurrency(event.revenue)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        event.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {event.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-muted rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Total Event Revenue</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(
                      data?.topEvents.reduce(
                        (sum, event) => sum + event.revenue,
                        0
                      ) || 0
                    )}
                  </p>
                </div>
                <CalendarDays className="h-8 w-8 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Growth */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Growth & Activity
            </CardTitle>
            <CardDescription>
              User acquisition and activity over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {/* User growth chart placeholder */}
              <div className="flex items-center justify-center h-full border rounded-lg">
                <div className="text-center">
                  <PieChart className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    User growth visualization
                  </p>
                </div>
              </div>
            </div>

            {/* User metrics */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">
                  New Users (Last 30 days)
                </p>
                <p className="text-2xl font-bold">
                  {data ? data.overview.totalUsers - 1400 : 0}
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Active Rate</p>
                <p className="text-2xl font-bold">
                  {data
                    ? `${(
                        (data.overview.activeUsers / data.overview.totalUsers) *
                        100
                      ).toFixed(1)}%`
                    : "0%"}
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Avg Tickets per User
                </p>
                <p className="text-2xl font-bold">
                  {data
                    ? (
                        data.overview.ticketsSold / data.overview.totalUsers
                      ).toFixed(1)
                    : "0"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <QuickStatCard
          title="Best Selling Event"
          value="Summer Music Festival"
          description={`${formatNumber(4500)} tickets sold`}
        />
        <QuickStatCard
          title="Highest Revenue Day"
          value="May 15, 2024"
          description={formatCurrency(85000)}
        />
        <QuickStatCard
          title="Avg Ticket Price"
          value={formatCurrency(
            data ? data.overview.totalRevenue / data.overview.ticketsSold : 0
          )}
          description="Across all events"
        />
        <QuickStatCard
          title="Peak Sales Time"
          value="7:00 PM - 9:00 PM"
          description="Most tickets sold during this period"
        />
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({
  title,
  value,
  icon,
  change,
  loading = false,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  change?: string;
  loading?: boolean;
}) {
  const isPositive = change?.startsWith("+");

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-8 bg-muted animate-pulse rounded"></div>
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            {change && (
              <p
                className={`text-sm flex items-center gap-1 mt-1 ${
                  isPositive ? "text-green-600" : "text-red-600"
                }`}
              >
                {isPositive ? "↗" : "↘"} {change}
                <span className="text-muted-foreground">from last period</span>
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

// Quick Stat Card Component
function QuickStatCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="text-lg font-bold mt-1">{value}</p>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}
