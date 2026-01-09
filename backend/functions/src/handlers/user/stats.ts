import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";

// DynamoDB client (LocalStack config)
const dynamoDb = new DynamoDBClient({
  region: "us-east-1",
  endpoint: "http://localhost:4566",
  credentials: { accessKeyId: "test", secretAccessKey: "test" },
});

const EVENTS_TABLE = "Events";
const TICKETS_TABLE = "Tickets";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Credentials": true,
  };

  try {
    const userId = event.queryStringParameters?.userId || "test-user-001";

    // Fetch all events
    const eventsResult = await dynamoDb.send(
      new ScanCommand({ TableName: EVENTS_TABLE })
    );
    const allEvents = eventsResult.Items?.map((item) => unmarshall(item)) || [];

    // Fetch user's tickets
    const ticketsResult = await dynamoDb.send(
      new ScanCommand({
        TableName: TICKETS_TABLE,
        FilterExpression: "userId = :userId",
        ExpressionAttributeValues: { ":userId": { S: userId } },
      })
    );
    const userTickets =
      ticketsResult.Items?.map((item) => unmarshall(item)) || [];

    const now = new Date();

    const organizedEvents = allEvents.filter(
      (event) => event.userId === userId
    );
    const attendingEventIds = [...new Set(userTickets.map((t) => t.eventId))];
    const attendingEvents = allEvents.filter((event) =>
      attendingEventIds.includes(event.eventId)
    );

    const upcoming = (events: any[]) =>
      events.filter((e) => new Date(e.date) > now).length;
    const past = (events: any[]) =>
      events.filter((e) => new Date(e.date) <= now).length;

    const organizedTicketsSold = organizedEvents.reduce(
      (sum, e) => sum + (e.ticketsSold || 0),
      0
    );
    const organizedRevenue = organizedEvents.reduce(
      (sum, e) => sum + (e.revenue || 0),
      0
    );
    const averageTicketPrice =
      organizedTicketsSold > 0 ? organizedRevenue / organizedTicketsSold : 0;

    const ticketsPurchased = userTickets.reduce(
      (sum, t) => sum + (t.quantity || 1),
      0
    );
    const totalSpent = userTickets.reduce((sum, t) => sum + (t.price || 0), 0);

    const stats = {
      totalTickets: ticketsResult.Count || 0,
      ticketsPurchased,
      organizedEvents: organizedEvents.length,
      attendingEvents: attendingEvents.length,
      upcomingOrganized: upcoming(organizedEvents),
      pastOrganized: past(organizedEvents),
      upcomingAttending: upcoming(attendingEvents),
      pastAttending: past(attendingEvents),
      organizedTicketsSold,
      organizedRevenue,
      totalSpent,
      averageTicketPrice: Math.round(averageTicketPrice * 100) / 100,
      organizedCompletionRate: organizedEvents.length
        ? Math.round((past(organizedEvents) / organizedEvents.length) * 100)
        : 0,
      attendanceRate: attendingEvents.length
        ? Math.round((past(attendingEvents) / attendingEvents.length) * 100)
        : 0,
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        stats,
        user: { id: userId, name: "Test User", email: "test@example.com" },
        summary: {
          message: `You have ${organizedEvents.length} organized events and ${attendingEvents.length} events to attend`,
          activeTickets: stats.totalTickets,
        },
      }),
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: `Failed to fetch user stats: ${error.message}`,
        stats: {
          totalTickets: 0,
          ticketsPurchased: 0,
          organizedEvents: 0,
          attendingEvents: 0,
          upcomingOrganized: 0,
          pastOrganized: 0,
          upcomingAttending: 0,
          pastAttending: 0,
          organizedTicketsSold: 0,
          organizedRevenue: 0,
          totalSpent: 0,
          averageTicketPrice: 0,
          organizedCompletionRate: 0,
          attendanceRate: 0,
        },
      }),
    };
  }
};
