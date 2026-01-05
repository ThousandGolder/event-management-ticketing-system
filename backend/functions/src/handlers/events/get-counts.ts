import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";

// Always use LocalStack configuration for local development
const dynamoDb = new DynamoDBClient({
  region: "us-east-1",
  endpoint: "http://localhost:4566",
  credentials: {
    accessKeyId: "test",
    secretAccessKey: "test",
  },
});

const EVENTS_TABLE = "Events";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log("📈 Event counts handler called - LOCAL MODE");

  try {
    // Get optional filters from query parameters
    const category = event.queryStringParameters?.category;
    const status = event.queryStringParameters?.status;
    const userId = event.queryStringParameters?.userId; // For user-specific counts

    console.log("📊 Fetching event counts with filters:", {
      category,
      status,
      userId,
    });

    // Build scan parameters with filters if provided
    let filterExpression = "";
    let expressionAttributeValues: any = {};
    let expressionAttributeNames: any = {};

    if (category) {
      filterExpression += "#category = :category";
      expressionAttributeNames["#category"] = "category";
      expressionAttributeValues[":category"] = { S: category };
    }

    if (status) {
      if (filterExpression) filterExpression += " AND ";
      filterExpression += "#status = :status";
      expressionAttributeNames["#status"] = "status";
      expressionAttributeValues[":status"] = { S: status };
    }

    if (userId) {
      if (filterExpression) filterExpression += " AND ";
      filterExpression += "userId = :userId";
      expressionAttributeValues[":userId"] = { S: userId };
    }

    const params: any = {
      TableName: EVENTS_TABLE,
    };

    if (filterExpression) {
      params.FilterExpression = filterExpression;
      if (Object.keys(expressionAttributeNames).length > 0) {
        params.ExpressionAttributeNames = expressionAttributeNames;
      }
      if (Object.keys(expressionAttributeValues).length > 0) {
        params.ExpressionAttributeValues = expressionAttributeValues;
      }
    }

    console.log("📝 Scanning events table for counts");
    const result = await dynamoDb.send(new ScanCommand(params));

    const events = result.Items
      ? result.Items.map((item) => unmarshall(item))
      : [];
    const now = new Date();

    // Calculate various counts
    let totalEvents = events.length;
    let upcomingEvents = 0;
    let pastEvents = 0;
    let activeEvents = 0;
    let draftEvents = 0;
    let cancelledEvents = 0;

    // Count by category
    const byCategory: { [key: string]: number } = {};
    // Count by status
    const byStatus: { [key: string]: number } = {};
    // Count by month (for charts)
    const byMonth: { [key: string]: number } = {};

    events.forEach((event) => {
      const eventDate = event.date ? new Date(event.date) : null;

      // Count by category
      const category = event.category || "Uncategorized";
      byCategory[category] = (byCategory[category] || 0) + 1;

      // Count by status
      const status = event.status || "draft";
      byStatus[status] = (byStatus[status] || 0) + 1;

      // Count draft and cancelled events
      if (status === "draft") draftEvents++;
      if (status === "cancelled") cancelledEvents++;

      // Count by time if event has a date
      if (eventDate) {
        // Count by month (for charts)
        const monthYear = eventDate.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        });
        byMonth[monthYear] = (byMonth[monthYear] || 0) + 1;

        // Categorize by time
        if (eventDate > now) {
          upcomingEvents++;
        } else {
          pastEvents++;
        }

        // Check if event is happening today (active)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (eventDate >= today && eventDate < tomorrow) {
          activeEvents++;
        }
      }
    });

    // Calculate summary statistics
    const totalTicketsAvailable = events.reduce(
      (sum, event) => sum + (event.totalTickets || 0),
      0
    );
    const totalTicketsSold = events.reduce(
      (sum, event) => sum + (event.ticketsSold || 0),
      0
    );
    const totalRevenue = events.reduce(
      (sum, event) => sum + (event.revenue || 0),
      0
    );
    const averageAttendance =
      totalEvents > 0 ? Math.round(totalTicketsSold / totalEvents) : 0;
    const selloutRate =
      totalTicketsAvailable > 0
        ? Math.round((totalTicketsSold / totalTicketsAvailable) * 100)
        : 0;

    const counts = {
      totalEvents,
      upcomingEvents,
      pastEvents,
      activeEvents,
      draftEvents,
      cancelledEvents,
      totalTicketsAvailable,
      totalTicketsSold,
      totalRevenue,
      averageAttendance,
      selloutRate,
      byCategory,
      byStatus,
      byMonth: Object.entries(byMonth)
        .sort(
          ([monthA], [monthB]) =>
            new Date(monthA).getTime() - new Date(monthB).getTime()
        )
        .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {}),
      upcomingPercentage:
        totalEvents > 0 ? Math.round((upcomingEvents / totalEvents) * 100) : 0,
      pastPercentage:
        totalEvents > 0 ? Math.round((pastEvents / totalEvents) * 100) : 0,
    };

    console.log(`✅ Found ${totalEvents} events with counts:`, {
      upcoming: upcomingEvents,
      past: pastEvents,
      active: activeEvents,
    });

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        success: true,
        counts: counts,
        filters: {
          category,
          status,
          userId,
        },
      }),
    };
  } catch (error: any) {
    console.error("❌ Error getting event counts:", error);
    console.error("Error details:", error.message);

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        success: false,
        error: `Failed to fetch event counts: ${error.message}`,
        mode: "local",
        counts: {
          totalEvents: 0,
          upcomingEvents: 0,
          pastEvents: 0,
          activeEvents: 0,
          draftEvents: 0,
          cancelledEvents: 0,
          totalTicketsAvailable: 0,
          totalTicketsSold: 0,
          totalRevenue: 0,
          averageAttendance: 0,
          selloutRate: 0,
          byCategory: {},
          byStatus: {},
          byMonth: {},
          upcomingPercentage: 0,
          pastPercentage: 0,
        },
      }),
    };
  }
};
