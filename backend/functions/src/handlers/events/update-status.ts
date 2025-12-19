import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

// Always use LocalStack configuration for local development
const dynamoDb = new DynamoDBClient({
  region: "us-east-1",
  endpoint: "http://localhost:4566",
  credentials: {
    accessKeyId: "test",
    secretAccessKey: "test",
  },
});

const EVENTS_TABLE = "Events"; // Hardcoded for local development

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log("🔄 Update status handler called - LOCAL MODE");

  try {
    const id = event.pathParameters?.id;
    if (!id) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({
          success: false,
          error: "Event ID is required",
        }),
      };
    }

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

    const { status } = JSON.parse(event.body);
    if (!status) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({
          success: false,
          error: "Status is required",
        }),
      };
    }

    const validStatuses = [
      "draft",
      "pending",
      "active",
      "suspended",
      "completed",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({
          success: false,
          error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
        }),
      };
    }

    const timestamp = new Date().toISOString();

    const params = {
      TableName: EVENTS_TABLE,
      Key: marshall({ eventId: id }),
      UpdateExpression: "SET #status = :status, updatedAt = :updatedAt",
      ExpressionAttributeNames: {
        "#status": "status",
      },
      ExpressionAttributeValues: marshall({
        ":status": status,
        ":updatedAt": timestamp,
      }),
      ReturnValues: "ALL_NEW" as const,
    };

    console.log("📝 Updating event status in LocalStack DynamoDB");
    const result = await dynamoDb.send(new UpdateItemCommand(params));

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        success: true,
        message: `Event status updated to ${status}`,
        event: unmarshall(result.Attributes || {}),
      }),
    };
  } catch (error: any) {
    console.error("❌ Error updating event status:", error);
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
        error: `Failed to update event status: ${error.message}`,
        mode: "local",
      }),
    };
  }
};
