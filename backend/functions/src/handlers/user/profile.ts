// backend/functions/src/handlers/user/profile.ts
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";

// Create DynamoDB client (same as tickets.ts)
const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
  endpoint: process.env.AWS_ENDPOINT || "http://localhost:4566",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "test",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "test",
  },
});

const docClient = DynamoDBDocumentClient.from(dynamoClient);

interface User {
  userId: string;
  email: string;
  username: string;
  name: string;
  userType: string; // "admin", "organizer", "attendee"
  createdAt: string;
  updatedAt: string;
}

interface Ticket {
  id: string;
  eventId: string;
  purchaseDate: string;
  totalAmount: number;
  status: string;
  [key: string]: any;
}

interface UserProfileResponse {
  id: string;
  name: string;
  email: string;
  role: string; // Convert userType to role
  createdAt: string;
  ticketStats: {
    total: number;
    upcoming: number;
    totalSpent: number;
  };
}

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    // Get user ID from query parameters or authorizer (same as tickets.ts)
    const userId =
      event.queryStringParameters?.userId ||
      event.requestContext?.authorizer?.claims?.sub ||
      "test-user-001";

    console.log("👤 Fetching profile for user:", userId);

    // 1. Fetch user details from Users table
    const userParams = {
      TableName: process.env.USERS_TABLE || "Users",
      Key: {
        userId: userId,
      },
    };

    const userResult = await docClient.send(new GetCommand(userParams));
    const user = userResult.Item as User;

    if (!user) {
      return {
        statusCode: 404,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({
          success: false,
          error: "User not found",
          message: `User with ID ${userId} does not exist`,
        }),
      };
    }

    // 2. Fetch user's tickets for statistics
    const ticketParams = {
      TableName: process.env.TICKETS_TABLE || "Tickets",
      IndexName: "UserIndex",
      KeyConditionExpression: "userId = :userId",
      ExpressionAttributeValues: {
        ":userId": userId,
      },
    };

    const ticketsResult = await docClient.send(new QueryCommand(ticketParams));
    const tickets = (ticketsResult.Items as Ticket[]) || [];

    // 3. Calculate statistics
    const now = new Date();
    const upcomingTickets = tickets.filter((ticket) => {
      try {
        const purchaseDate = new Date(ticket.purchaseDate);
        return purchaseDate > now;
      } catch {
        return false;
      }
    });

    const totalSpent = tickets.reduce((sum, ticket) => {
      return sum + (ticket.totalAmount || 0);
    }, 0);

    // 4. Map userType to role for frontend
    const mapUserTypeToRole = (userType: string): string => {
      switch (userType.toLowerCase()) {
        case "admin":
          return "Admin";
        case "organizer":
          return "Organizer";
        case "attendee":
          return "User";
        default:
          return "User";
      }
    };

    // 5. Create response matching frontend expectations
    const profileResponse: UserProfileResponse = {
      id: user.userId,
      name: user.name,
      email: user.email,
      role: mapUserTypeToRole(user.userType),
      createdAt: user.createdAt,
      ticketStats: {
        total: tickets.length,
        upcoming: upcomingTickets.length,
        totalSpent: totalSpent,
      },
    };

    console.log(`✅ Profile loaded for ${user.name}`);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        success: true,
        data: profileResponse,
        user: {
          id: user.userId,
          name: user.name,
          email: user.email,
          role: mapUserTypeToRole(user.userType),
          createdAt: user.createdAt,
        },
        ticketStats: {
          total: tickets.length,
          upcoming: upcomingTickets.length,
          totalSpent: totalSpent,
        },
        userId: userId,
        timestamp: new Date().toISOString(),
      }),
    };
  } catch (error) {
    console.error("❌ Error in user profile handler:", error);

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        success: false,
        error: "Failed to fetch user profile",
        message: error instanceof Error ? error.message : "Unknown error",
        data: null,
        timestamp: new Date().toISOString(),
      }),
    };
  }
};
