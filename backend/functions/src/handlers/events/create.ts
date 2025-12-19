import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { dynamo, EVENTS_TABLE } from "../../utils/db"; // Import from utils

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log("📝 Create event handler called - NO AUTH REQUIRED");

  try {
    if (!event.body) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({
          success: false,
          error: "Request body is required",
        }),
      };
    }

    const eventData = JSON.parse(event.body);

    // Validate required fields
    const requiredFields = [
      "title",
      "description",
      "date",
      "location",
      "city",
      "category",
      "organizer",
      "totalTickets",
    ];
    const missingFields = requiredFields.filter((field) => !eventData[field]);

    if (missingFields.length > 0) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({
          success: false,
          error: `Missing required fields: ${missingFields.join(", ")}`,
        }),
      };
    }

    // Generate unique event ID
    const eventId = `evt_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const timestamp = new Date().toISOString();

    // Prepare event item with defaults
    const newEvent = {
      eventId,
      title: eventData.title,
      description: eventData.description,
      date: eventData.date,
      location: eventData.location,
      city: eventData.city,
      category: eventData.category,
      organizer: eventData.organizer,
      organizerEmail:
        eventData.organizerEmail ||
        `${eventData.organizer.toLowerCase().replace(/\s+/g, "")}@example.com`,
      totalTickets: parseInt(eventData.totalTickets, 10) || 0,
      ticketPrice: parseFloat(eventData.ticketPrice) || 0,
      revenue: parseFloat(eventData.revenue) || 0,
      ticketsSold: parseInt(eventData.ticketsSold, 10) || 0,
      status: eventData.status || "pending",
      userId: eventData.userId || "local-admin",
      imageUrl:
        eventData.imageUrl ||
        `https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800`,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    console.log("📝 Creating event:", newEvent);

    // Save to DynamoDB
    const params = {
      TableName: EVENTS_TABLE,
      Item: marshall(newEvent),
    };

    await dynamo.send(new PutItemCommand(params));

    console.log("✅ Event created successfully:", eventId);

    return {
      statusCode: 201,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        success: true,
        message: "Event created successfully",
        event: newEvent,
      }),
    };
  } catch (error: any) {
    console.error("❌ Error creating event:", error);
    console.error("Error details:", error.message, error.stack);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        success: false,
        error: error.message || "Failed to create event",
        details: process.env.IS_OFFLINE
          ? "LocalStack connection issue"
          : undefined,
      }),
    };
  }
};
