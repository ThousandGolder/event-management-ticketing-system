import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
// Remove AnalyticsQuery import since it's not used
import { AnalyticsResponse } from "../../schemas/analytics";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    console.log(" Analytics request received");

    // Parse query parameters
    const queryParams = event.queryStringParameters || {};
    const range = (queryParams.range as "7d" | "30d" | "90d" | "1y") || "30d";

    // Calculate date range
    const now = new Date();
    let startDate = new Date();

    switch (range) {
      case "7d":
        startDate.setDate(now.getDate() - 7);
        break;
      case "90d":
        startDate.setDate(now.getDate() - 90);
        break;
      case "1y":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default: // 30d
        startDate.setDate(now.getDate() - 30);
    }

    console.log(
      `📅 Fetching analytics for range: ${range}, from: ${startDate.toISOString()}`
    );

    // Initialize DynamoDB client
    const dynamoDBClient = new DynamoDBClient({
      region: process.env.AWS_REGION || "us-east-1",
      endpoint:
        process.env.IS_OFFLINE === "true" ? "http://localhost:4566" : undefined,
    });

    // Fetch data from DynamoDB in parallel
    const [events, users] = await Promise.all([
      fetchEventsData(dynamoDBClient, startDate),
      fetchUsersData(dynamoDBClient, startDate),
    ]);

    console.log(
      ` Events found: ${events.length}, Users found: ${users.length}`
    );

    // Calculate ticket sales from events
    const ticketsData = calculateTicketsData(events);

    // Process analytics data
    const analyticsData = {
      overview: {
        totalUsers: users.length,
        totalEvents: events.length,
        ticketsSold: ticketsData.totalTickets,
        totalRevenue: ticketsData.totalRevenue,
        activeUsers: users.filter((user: any) => user.status === "active")
          .length,
        conversionRate: calculateConversionRate(
          users.length,
          ticketsData.totalTickets
        ),
      },
      revenueTrend: calculateMonthlyTrend(events),
      eventStats: processEventStats(events),
      userGrowth: calculateUserGrowth(users),
      topEvents: getTopEvents(events, 5),
    };

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        success: true,
        data: analyticsData,
        timestamp: new Date().toISOString(),
      } as AnalyticsResponse),
    };
  } catch (error) {
    console.error(" Analytics error:", error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        success: false,
        error: "Failed to fetch analytics data",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
    };
  }
};

// Helper functions
async function fetchEventsData(
  dynamoDBClient: DynamoDBClient,
  startDate: Date
): Promise<any[]> {
  try {
    const params = {
      TableName: process.env.EVENTS_TABLE || "Events",
    };

    const command = new ScanCommand(params);
    const result = await dynamoDBClient.send(command);

    const events = result.Items
      ? result.Items.map((item) => unmarshall(item))
      : [];

    // Filter events created after startDate
    return events.filter((event: any) => {
      const eventDate = new Date(event.createdAt || event.date || Date.now());
      return eventDate >= startDate;
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    return [];
  }
}

async function fetchUsersData(
  dynamoDBClient: DynamoDBClient,
  startDate: Date
): Promise<any[]> {
  try {
    const params = {
      TableName: process.env.USERS_TABLE || "Users",
    };

    const command = new ScanCommand(params);
    const result = await dynamoDBClient.send(command);

    const users = result.Items
      ? result.Items.map((item) => unmarshall(item))
      : [];

    // Filter users created after startDate
    return users.filter((user: any) => {
      const userDate = new Date(user.createdAt || Date.now());
      return userDate >= startDate;
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

function calculateTicketsData(events: any[]) {
  return events.reduce(
    (acc, event) => ({
      totalTickets: acc.totalTickets + (event.ticketsSold || 0),
      totalRevenue: acc.totalRevenue + (event.revenue || 0),
    }),
    { totalTickets: 0, totalRevenue: 0 }
  );
}

function calculateMonthlyTrend(events: any[]) {
  const monthlyData: Record<string, { revenue: number; tickets: number }> = {};

  events.forEach((event) => {
    const date = new Date(event.createdAt || event.date || Date.now());
    const monthKey = date.toLocaleString("default", { month: "short" });

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { revenue: 0, tickets: 0 };
    }

    monthlyData[monthKey].revenue += event.revenue || 0;
    monthlyData[monthKey].tickets += event.ticketsSold || 0;
  });

  // Convert to array and sort by month
  return Object.entries(monthlyData)
    .map(([month, data]) => ({
      month,
      revenue: data.revenue,
      tickets: data.tickets,
    }))
    .sort((a, b) => {
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      return months.indexOf(a.month) - months.indexOf(b.month);
    });
}

function processEventStats(events: any[]) {
  // Take top 4 events by revenue
  return events
    .sort((a, b) => (b.revenue || 0) - (a.revenue || 0))
    .slice(0, 4)
    .map((event) => ({
      name: event.title || event.name || "Untitled Event",
      tickets: event.ticketsSold || 0,
      revenue: event.revenue || 0,
      capacity: Math.min(
        100,
        Math.round(((event.ticketsSold || 0) / (event.capacity || 1)) * 100)
      ),
    }));
}

function calculateUserGrowth(users: any[]) {
  const monthlyGrowth: Record<string, { users: number; active: number }> = {};

  users.forEach((user) => {
    const date = new Date(user.createdAt || Date.now());
    const monthKey = date.toLocaleString("default", { month: "short" });

    if (!monthlyGrowth[monthKey]) {
      monthlyGrowth[monthKey] = { users: 0, active: 0 };
    }

    monthlyGrowth[monthKey].users += 1;
    if (user.status === "active") {
      monthlyGrowth[monthKey].active += 1;
    }
  });

  // Convert to array and sort by month
  return Object.entries(monthlyGrowth)
    .map(([month, data]) => ({
      month,
      users: data.users,
      active: data.active,
    }))
    .sort((a, b) => {
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      return months.indexOf(a.month) - months.indexOf(b.month);
    });
}

function getTopEvents(events: any[], limit: number) {
  return events
    .sort((a, b) => (b.ticketsSold || 0) - (a.ticketsSold || 0))
    .slice(0, limit)
    .map((event) => ({
      id: event.id || event.eventId,
      name: event.title || event.name || "Untitled Event",
      ticketsSold: event.ticketsSold || 0,
      revenue: event.revenue || 0,
      status: event.status || "active",
    }));
}

function calculateConversionRate(totalUsers: number, ticketsSold: number) {
  if (totalUsers === 0) return 0;
  return Number(((ticketsSold / totalUsers) * 100).toFixed(1));
}
