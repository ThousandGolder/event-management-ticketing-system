import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  QueryCommand,
  GetCommand,
} from "@aws-sdk/lib-dynamodb";

// Create DynamoDB client
const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
  endpoint: process.env.AWS_ENDPOINT || "http://localhost:4566",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "test",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "test",
  },
});

const docClient = DynamoDBDocumentClient.from(dynamoClient);

interface Ticket {
  id: string;
  ticketId: string;
  ticketNumber: string;
  eventId: string;
  eventName: string;
  userId: string;
  purchaseDate: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  transactionId?: string;
  checkInTime?: string;
  checkInBy?: string;
  createdAt: string;
  updatedAt: string;
}

// Extended interface for tickets with event details
interface TicketWithEventDetails extends Ticket {
  eventDate?: string;
  eventLocation?: string;
  eventCity?: string;
}

interface Event {
  eventId: string;
  title: string;
  date: string;
  location: string;
  city: string;
  [key: string]: any;
}

// Output interface for formatted tickets
interface FormattedTicket {
  id: string;
  ticketId: string;
  ticketNumber: string;
  eventId: string;
  eventName: string;
  userId: string;
  purchaseDate: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  transactionId?: string;
  checkInTime?: string;
  checkInBy?: string;
  createdAt: string;
  updatedAt: string;
  eventDate?: string;
  location?: string;
  city?: string;
}

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    // Get user ID from query parameters or authorizer
    const userId =
      event.queryStringParameters?.userId ||
      event.requestContext?.authorizer?.claims?.sub ||
      "test-user-001";

    const eventId = event.queryStringParameters?.eventId;

    console.log("🎫 Fetching tickets for user:", userId, "eventId:", eventId);

    // Build query parameters for tickets
    let ticketParams: any = {
      TableName: process.env.TICKETS_TABLE || "Tickets",
      IndexName: "UserIndex",
      KeyConditionExpression: "userId = :userId",
      ExpressionAttributeValues: {
        ":userId": userId,
      },
    };

    // If eventId is provided, filter by event
    if (eventId) {
      ticketParams.KeyConditionExpression += " AND eventId = :eventId";
      ticketParams.ExpressionAttributeValues[":eventId"] = eventId;
    }

    const ticketsResult = await docClient.send(new QueryCommand(ticketParams));
    const tickets = (ticketsResult.Items as Ticket[]) || [];

    console.log(`✅ Found ${tickets.length} tickets for user ${userId}`);

    // If no tickets found, return empty array
    if (tickets.length === 0) {
      return {
        statusCode: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({
          success: true,
          data: [],
          tickets: [],
          count: 0,
          userId: userId,
          timestamp: new Date().toISOString(),
        }),
      };
    }

    // Fetch event details for each ticket
    const ticketsWithEventDetails = await Promise.all(
      tickets.map(async (ticket): Promise<TicketWithEventDetails> => {
        try {
          // Fetch event details from Events table
          const eventParams = {
            TableName: process.env.EVENTS_TABLE || "Events",
            Key: {
              eventId: ticket.eventId,
            },
          };

          const eventResult = await docClient.send(new GetCommand(eventParams));
          const event = eventResult.Item as Event;

          if (event) {
            return {
              ...ticket,
              // Add event details to ticket
              eventDate: event.date,
              eventLocation: event.location,
              eventCity: event.city,
            };
          }
          return ticket; // Return ticket if no event found
        } catch (error) {
          console.error(`Error fetching event ${ticket.eventId}:`, error);
          return ticket; // Return ticket if error occurs
        }
      })
    );

    // Transform tickets to match expected frontend format
    const formattedTickets: FormattedTicket[] = ticketsWithEventDetails.map(
      (ticket) => {
        const formattedTicket: FormattedTicket = {
          id: ticket.id,
          ticketId: ticket.id,
          ticketNumber: ticket.ticketNumber,
          eventId: ticket.eventId,
          eventName: ticket.eventName,
          userId: ticket.userId,
          purchaseDate: ticket.purchaseDate,
          quantity: ticket.quantity,
          unitPrice: ticket.unitPrice,
          totalAmount: ticket.totalAmount,
          status: ticket.status,
          paymentMethod: ticket.paymentMethod,
          paymentStatus: ticket.paymentStatus,
          transactionId: ticket.transactionId,
          checkInTime: ticket.checkInTime,
          checkInBy: ticket.checkInBy,
          createdAt: ticket.createdAt,
          updatedAt: ticket.updatedAt,
        };

        // Add event details if available
        if (ticket.eventDate) {
          formattedTicket.eventDate = ticket.eventDate;
        }
        if (ticket.eventLocation) {
          formattedTicket.location = ticket.eventLocation;
        }
        if (ticket.eventCity) {
          formattedTicket.city = ticket.eventCity;
        }

        return formattedTicket;
      }
    );

    console.log(`✅ Returning ${formattedTickets.length} formatted tickets`);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        success: true,
        data: formattedTickets,
        tickets: formattedTickets,
        count: formattedTickets.length,
        userId: userId,
        timestamp: new Date().toISOString(),
      }),
    };
  } catch (error) {
    console.error("❌ Error in user tickets handler:", error);

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        success: false,
        error: "Failed to fetch user tickets",
        message: error instanceof Error ? error.message : "Unknown error",
        data: [],
        tickets: [],
        count: 0,
        timestamp: new Date().toISOString(),
      }),
    };
  }
};
