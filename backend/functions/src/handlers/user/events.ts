import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBClient, DynamoDBClientConfig } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  QueryCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";

// Define proper DynamoDB configuration type
const dynamoConfig: DynamoDBClientConfig = {
  region: process.env.AWS_REGION || "us-east-1",
  endpoint: process.env.AWS_ENDPOINT || "http://localhost:4566",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "test",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "test",
  },
  // Use custom endpoint config for LocalStack
  ...(process.env.AWS_ENDPOINT?.includes("localhost") ||
  process.env.AWS_ENDPOINT?.includes("localstack")
    ? {
        endpoint: process.env.AWS_ENDPOINT || "http://localhost:4566",
        // For LocalStack, we need to set these properties differently
        tls: false,
        // Instead of forcePathStyle on the client, use endpoint resolution
      }
    : {}),
};

const dynamoClient = new DynamoDBClient(dynamoConfig);

const docClient = DynamoDBDocumentClient.from(dynamoClient);

// Define interfaces for better type safety
interface Ticket {
  eventId: string;
  userId: string;
  ticketNumber?: string;
  quantity?: number;
  purchaseDate?: string;
  status?: string;
  [key: string]: any;
}

interface Event {
  eventId: string;
  title: string;
  description?: string;
  date: string;
  location?: string;
  city?: string;
  category?: string;
  ticketsSold?: number;
  totalTickets?: number;
  revenue?: number;
  status?: string;
  userId?: string;
  imageUrl?: string;
  organizer?: string;
  [key: string]: any;
}

interface UserEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  location: string;
  city: string;
  category: string;
  ticketsSold: number;
  totalTickets: number;
  revenue: number;
  status: "active" | "upcoming" | "completed" | "draft" | "cancelled";
  role: "organizer" | "attendee";
  registrationDate?: string;
  ticketCount?: number;
  ticketNumbers?: string[];
  isSaved?: boolean;
  imageUrl?: string;
  organizer?: string;
}

interface UserEventsResponse {
  success: boolean;
  events: UserEvent[];
  counts: {
    attending: number;
    organizing: number;
    past: number;
    saved: number;
  };
  user?: {
    id: string;
  };
  error?: string;
  message?: string;
}

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    // Get user ID from authorizer (JWT token) or query params
    const userId =
      event.requestContext?.authorizer?.claims?.sub ||
      event.queryStringParameters?.userId ||
      "test-user-001"; // Fallback for testing

    const queryParams = event.queryStringParameters || {};
    const tab = queryParams.tab || "attending";
    const category = queryParams.category || "all";
    const search = queryParams.search || "";

    console.log("📋 Fetching user events:", {
      userId,
      tab,
      category,
      search,
      hasAuthorizer: !!event.requestContext?.authorizer,
    });

    let userEvents: UserEvent[] = [];
    const counts = {
      attending: 0,
      organizing: 0,
      past: 0,
      saved: 0,
    };

    // Helper function to get event by ID
    const getEventById = async (eventId: string): Promise<Event | null> => {
      try {
        const params = {
          TableName: process.env.EVENTS_TABLE || "Events",
          KeyConditionExpression: "eventId = :eventId",
          ExpressionAttributeValues: {
            ":eventId": eventId,
          },
        };
        const result = await docClient.send(new QueryCommand(params));
        return (result.Items?.[0] as Event) || null;
      } catch (error) {
        console.error(`Error fetching event ${eventId}:`, error);
        return null;
      }
    };

    if (tab === "attending" || tab === "past") {
      // Get tickets for this user
      const ticketParams = {
        TableName: process.env.TICKETS_TABLE || "Tickets",
        IndexName: "UserIndex",
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: {
          ":userId": userId,
        },
      };

      const ticketsResult = await docClient.send(
        new QueryCommand(ticketParams)
      );
      const tickets = (ticketsResult.Items as Ticket[]) || [];

      console.log(`Found ${tickets.length} tickets for user ${userId}`);

      // Get unique event IDs from tickets
      const eventIds = [...new Set(tickets.map((ticket) => ticket.eventId))];

      // Fetch event details for each event
      const eventsPromises = eventIds.map((eventId) => getEventById(eventId));
      const events = (await Promise.all(eventsPromises)).filter(
        (event) => event !== null
      ) as Event[];

      // Combine ticket data with event data
      userEvents = events.map((event) => {
        const userTickets = tickets.filter((t) => t.eventId === event.eventId);
        const totalTickets = userTickets.reduce(
          (sum, t) => sum + (t.quantity || 1),
          0
        );

        // Determine status based on event date
        const eventDate = new Date(event.date);
        const now = new Date();
        let status:
          | "active"
          | "upcoming"
          | "completed"
          | "draft"
          | "cancelled" = "active";

        if (eventDate < now) {
          status = "completed";
        } else if (
          eventDate > new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
        ) {
          status = "upcoming";
        }

        return {
          id: event.eventId,
          title: event.title || "Untitled Event",
          description: event.description,
          date: new Date(event.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          time: new Date(event.date).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          }),
          location: event.location || "Location not specified",
          city: event.city || "City not specified",
          category: event.category || "Uncategorized",
          ticketsSold: event.ticketsSold || 0,
          totalTickets: event.totalTickets || 0,
          revenue: event.revenue || 0,
          status,
          role: "attendee" as const,
          registrationDate: userTickets[0]?.purchaseDate
            ? new Date(userTickets[0].purchaseDate).toISOString().split("T")[0]
            : undefined,
          ticketCount: totalTickets,
          ticketNumbers: userTickets
            .map((t) => t.ticketNumber)
            .filter(Boolean) as string[],
          isSaved: false, // You'll need a SavedEvents table for this
          imageUrl: event.imageUrl,
          organizer: event.organizer,
        };
      });

      // Calculate counts
      counts.attending = userEvents.filter(
        (e) => e.role === "attendee" && e.status !== "completed"
      ).length;
      counts.past = userEvents.filter((e) => e.status === "completed").length;
    } else if (tab === "organizing") {
      // Get events organized by this user
      const params = {
        TableName: process.env.EVENTS_TABLE || "Events",
        IndexName: "UserIdIndex",
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: {
          ":userId": userId,
        },
      };

      const result = await docClient.send(new QueryCommand(params));
      const organizedEvents = (result.Items as Event[]) || [];

      userEvents = organizedEvents.map((event) => ({
        id: event.eventId,
        title: event.title || "Untitled Event",
        description: event.description,
        date: new Date(event.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        time: new Date(event.date).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        }),
        location: event.location || "Location not specified",
        city: event.city || "City not specified",
        category: event.category || "Uncategorized",
        ticketsSold: event.ticketsSold || 0,
        totalTickets: event.totalTickets || 0,
        revenue: event.revenue || 0,
        status: (event.status || "draft") as
          | "active"
          | "upcoming"
          | "completed"
          | "draft"
          | "cancelled",
        role: "organizer" as const,
        isSaved: false,
        imageUrl: event.imageUrl,
        organizer: event.organizer,
      }));

      counts.organizing = userEvents.length;
    } else if (tab === "saved") {
      // For saved events, you'd need a separate table
      // For now, return empty array
      userEvents = [];
      counts.saved = 0;
    }

    // Apply filters
    let filteredEvents = userEvents;

    if (category !== "all") {
      filteredEvents = filteredEvents.filter(
        (event) => event.category === category
      );
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredEvents = filteredEvents.filter(
        (event) =>
          event.title.toLowerCase().includes(searchLower) ||
          event.location.toLowerCase().includes(searchLower) ||
          event.category.toLowerCase().includes(searchLower)
      );
    }

    // For past events tab, filter by completed status
    if (tab === "past") {
      filteredEvents = filteredEvents.filter(
        (event) => event.status === "completed"
      );
    } else if (tab === "attending") {
      filteredEvents = filteredEvents.filter(
        (event) => event.status !== "completed"
      );
    }

    console.log(
      `✅ Returning ${filteredEvents.length} events for user ${userId}, tab: ${tab}`
    );

    const response: APIGatewayProxyResult = {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        success: true,
        events: filteredEvents,
        counts: counts,
        user: {
          id: userId,
        },
      } as UserEventsResponse),
    };

    return response;
  } catch (error) {
    console.error("❌ Error in getUserEvents:", error);

    const errorResponse: APIGatewayProxyResult = {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        success: false,
        error: "Failed to fetch user events",
        message: error instanceof Error ? error.message : "Unknown error",
        events: [],
        counts: {
          attending: 0,
          organizing: 0,
          past: 0,
          saved: 0,
        },
      } as UserEventsResponse),
    };

    return errorResponse;
  }
};
