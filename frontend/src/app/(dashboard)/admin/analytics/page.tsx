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
  AlertCircle,
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
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "1y">(
    "30d"
  );
  const [chartType, setChartType] = useState<"bar" | "line" | "area">("bar");

  // Fetch analytics data from your backend
  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch from your backend endpoint
      const response = await fetch(
        `http://localhost:3001/analytics?range=${timeRange}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}`);
      }

      if (result.success) {
        setData(result.data);
        toast({
          title: "Data loaded",
          description: `Analytics for ${timeRange} period loaded successfully`,
        });
      } else {
        throw new Error(result.error || "Failed to fetch analytics data");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setError(errorMessage);
      setData(null);

      toast({
        title: "Error loading data",
        description: errorMessage,
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
    if (!data) return;

    // Create CSV content
    const csvContent = [
      [
        "Analytics Export",
        new Date().toLocaleDateString(),
        `Range: ${timeRange}`,
      ],
      [],
      ["Overview"],
      ["Metric", "Value"],
      ["Total Users", data.overview.totalUsers],
      ["Total Events", data.overview.totalEvents],
      ["Tickets Sold", data.overview.ticketsSold],
      ["Total Revenue", `$${data.overview.totalRevenue}`],
      ["Active Users", data.overview.activeUsers],
      ["Conversion Rate", `${data.overview.conversionRate}%`],
      [],
      ["Revenue Trend"],
      ["Month", "Revenue", "Tickets"],
      ...data.revenueTrend.map((item) => [
        item.month,
        `$${item.revenue}`,
        item.tickets,
      ]),
      [],
      ["Top Events"],
      ["Event Name", "Tickets Sold", "Revenue", "Status"],
      ...data.topEvents.map((event) => [
        event.name,
        event.ticketsSold,
        `$${event.revenue}`,
        event.status,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-${timeRange}-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export completed",
      description: "Analytics data downloaded as CSV",
    });
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <h2 className="text-xl font-semibold">Loading Analytics</h2>
          <p className="text-muted-foreground">Fetching data from backend...</p>
          <p className="text-sm text-muted-foreground mt-2">
            Time range: {timeRange}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center max-w-md">
          <AlertCircle className="h-16 w-16 mx-auto mb-4 text-destructive" />
          <h2 className="text-2xl font-bold mb-2">Failed to Load Analytics</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <div className="space-y-3">
            <p className="text-sm">Make sure:</p>
            <ul className="text-sm text-muted-foreground text-left space-y-1">
              <li>• Your backend server is running on port 3001</li>
              <li>• The /analytics endpoint is properly configured</li>
              <li>• DynamoDB tables (Events, Users) have data</li>
            </ul>
          </div>
          <Button onClick={fetchAnalytics} className="mt-6">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold">No Data Available</h2>
          <p className="text-muted-foreground">
            No analytics data could be loaded
          </p>
          <Button onClick={fetchAnalytics} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header with controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground">
            Real-time insights from your database • {timeRange} period
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
            {loading ? "Refreshing..." : "Refresh"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={exportData}
            disabled={!data}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(data.overview.totalRevenue)}
          icon={<DollarSign className="h-5 w-5" />}
          loading={loading}
        />
        <StatCard
          title="Tickets Sold"
          value={formatNumber(data.overview.ticketsSold)}
          icon={<Ticket className="h-5 w-5" />}
          loading={loading}
        />
        <StatCard
          title="Total Events"
          value={formatNumber(data.overview.totalEvents)}
          icon={<Calendar className="h-5 w-5" />}
          loading={loading}
        />
        <StatCard
          title="Total Users"
          value={formatNumber(data.overview.totalUsers)}
          icon={<Users className="h-5 w-5" />}
          loading={loading}
        />
        <StatCard
          title="Active Users"
          value={formatNumber(data.overview.activeUsers)}
          icon={<UserCheck className="h-5 w-5" />}
          loading={loading}
        />
        <StatCard
          title="Conversion Rate"
          value={`${data.overview.conversionRate.toFixed(1)}%`}
          icon={<TrendingUp className="h-5 w-5" />}
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
                  {data.revenueTrend.length > 0
                    ? `${data.revenueTrend.length} months of data`
                    : "No revenue data available"}
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
              {data.revenueTrend.length > 0 ? (
                <>
                  <div className="h-48 flex items-end justify-between gap-2 p-4 border rounded-lg">
                    {data.revenueTrend.map((item, index) => {
                      const maxRevenue = Math.max(
                        ...data.revenueTrend.map((r) => r.revenue)
                      );
                      const height =
                        maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;

                      return (
                        <div
                          key={index}
                          className="flex flex-col items-center flex-1"
                        >
                          <div
                            className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors"
                            style={{ height: `${height}%` }}
                            title={`${item.month}: ${formatCurrency(
                              item.revenue
                            )}`}
                          />
                          <span className="text-xs mt-2">{item.month}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatNumber(item.tickets)}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Data summary */}
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        Avg Monthly Revenue
                      </p>
                      <p className="text-lg font-semibold">
                        {formatCurrency(
                          data.revenueTrend.reduce(
                            (sum, item) => sum + item.revenue,
                            0
                          ) / data.revenueTrend.length
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
                            data.revenueTrend.reduce(
                              (sum, item) => sum + item.tickets,
                              0
                            ) / data.revenueTrend.length
                          )
                        )}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full border rounded-lg">
                  <div className="text-center">
                    <BarChartIcon className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      No revenue data available
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Add events with revenue data to see trends
                    </p>
                  </div>
                </div>
              )}
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
            <CardDescription>
              {data.topEvents.length} events with highest ticket sales
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.topEvents.length > 0 ? (
              <>
                <div className="space-y-4">
                  {data.topEvents.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{event.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatNumber(event.ticketsSold)} tickets •{" "}
                          {formatCurrency(event.revenue)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${
                            event.status === "active"
                              ? "bg-green-100 text-green-800"
                              : event.status === "completed"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
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
                      <p className="font-medium">Total Revenue (Top Events)</p>
                      <p className="text-2xl font-bold">
                        {formatCurrency(
                          data.topEvents.reduce(
                            (sum, event) => sum + event.revenue,
                            0
                          )
                        )}
                      </p>
                    </div>
                    <CalendarDays className="h-8 w-8 text-muted-foreground" />
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-48 border rounded-lg">
                <div className="text-center">
                  <Activity className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    No event data available
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Create events to see performance metrics
                  </p>
                </div>
              </div>
            )}
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
              {data.userGrowth.length > 0
                ? `User acquisition over ${data.userGrowth.length} months`
                : "User growth over time"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {data.userGrowth.length > 0 ? (
                <div className="h-full flex items-end justify-between gap-2 p-4 border rounded-lg">
                  {data.userGrowth.map((item, index) => {
                    const maxUsers = Math.max(
                      ...data.userGrowth.map((u) => u.users)
                    );
                    const height =
                      maxUsers > 0 ? (item.users / maxUsers) * 100 : 0;

                    return (
                      <div
                        key={index}
                        className="flex flex-col items-center flex-1"
                      >
                        <div className="relative w-full">
                          <div
                            className="w-full bg-green-500 rounded-t hover:bg-green-600 transition-colors"
                            style={{ height: `${height}%` }}
                            title={`${item.month}: ${item.users} users (${item.active} active)`}
                          />
                          {item.active > 0 && (
                            <div
                              className="w-full bg-green-300 rounded-t absolute bottom-0"
                              style={{
                                height: `${
                                  maxUsers > 0
                                    ? (item.active / maxUsers) * 100
                                    : 0
                                }%`,
                              }}
                            />
                          )}
                        </div>
                        <span className="text-xs mt-2">{item.month}</span>
                        <span className="text-xs text-muted-foreground">
                          {item.users}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full border rounded-lg">
                  <div className="text-center">
                    <PieChart className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      No user growth data available
                    </p>
                    <p className="text-sm text-muted-foreground">
                      User data will appear as users register
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* User metrics */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">
                  {data.overview.activeUsers}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {data.overview.totalUsers > 0
                    ? `${(
                        (data.overview.activeUsers / data.overview.totalUsers) *
                        100
                      ).toFixed(1)}% of total`
                    : "No users"}
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold">
                  {data.overview.conversionRate.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Tickets per user ratio
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Avg Tickets per User
                </p>
                <p className="text-2xl font-bold">
                  {data.overview.totalUsers > 0
                    ? (
                        data.overview.ticketsSold / data.overview.totalUsers
                      ).toFixed(1)
                    : "0.0"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Across all events
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      {data.topEvents.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <QuickStatCard
            title="Best Selling Event"
            value={data.topEvents[0]?.name || "N/A"}
            description={`${formatNumber(
              data.topEvents[0]?.ticketsSold || 0
            )} tickets sold`}
          />
          <QuickStatCard
            title="Total Monthly Revenue"
            value={formatCurrency(
              data.revenueTrend.reduce((sum, item) => sum + item.revenue, 0)
            )}
            description="Across all events"
          />
          <QuickStatCard
            title="Avg Ticket Price"
            value={formatCurrency(
              data.overview.totalRevenue / data.overview.ticketsSold
            )}
            description="Average across all tickets"
          />
          <QuickStatCard
            title="User Activity Rate"
            value={`${
              data.overview.totalUsers > 0
                ? (
                    (data.overview.activeUsers / data.overview.totalUsers) *
                    100
                  ).toFixed(1)
                : "0.0"
            }%`}
            description="Active vs total users"
          />
        </div>
      )}

      {/* Data freshness indicator */}
      <div className="text-center text-sm text-muted-foreground pt-4 border-t">
        <p>
          Data loaded from backend API • DynamoDB tables: Events & Users • Last
          updated: {new Date().toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({
  title,
  value,
  icon,
  loading = false,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  loading?: boolean;
}) {
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
          <div className="text-2xl font-bold">{value}</div>
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
        <p className="text-lg font-bold mt-1 truncate" title={value}>
          {value}
        </p>
        <p
          className="text-sm text-muted-foreground mt-1 truncate"
          title={description}
        >
          {description}
        </p>
      </CardContent>
    </Card>
  );
}
