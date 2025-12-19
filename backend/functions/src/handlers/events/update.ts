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

const EVENTS_TABLE = "Events";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log("✏️ Update event handler called - LOCAL MODE");

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

    const eventData = JSON.parse(event.body);
    const timestamp = new Date().toISOString();

    // Build update expression
    const updateExpressions = [];
    const expressionAttributeNames: any = {};
    const expressionAttributeValues: any = {
      ":updatedAt": timestamp,
    };

    // Add all fields to update
    Object.keys(eventData).forEach((key) => {
      if (key !== "eventId" && key !== "createdAt") {
        updateExpressions.push(`#${key} = :${key}`);
        expressionAttributeNames[`#${key}`] = key;
        expressionAttributeValues[`:${key}`] = eventData[key];
      }
    });

    updateExpressions.push("updatedAt = :updatedAt");

    const params = {
      TableName: EVENTS_TABLE,
      Key: marshall({ eventId: id }),
      UpdateExpression: `SET ${updateExpressions.join(", ")}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: marshall(expressionAttributeValues),
      ReturnValues: "ALL_NEW" as const,
    };

    console.log("📝 Updating event in LocalStack DynamoDB");
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
        message: "Event updated successfully",
        event: unmarshall(result.Attributes || {}),
      }),
    };
  } catch (error: any) {
    console.error("❌ Error updating event:", error);

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        success: false,
        error: `Failed to update event: ${error.message}`,
        mode: "local",
      }),
    };
  }
};
