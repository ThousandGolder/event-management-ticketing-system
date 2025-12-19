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

const EVENTS_TABLE = "Events"; // Hardcoded for local development

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log("📋 List events handler called - LOCAL MODE");

  try {
    const params = {
      TableName: EVENTS_TABLE,
    };

    console.log("📝 Listing events from LocalStack DynamoDB");
    const result = await dynamoDb.send(new ScanCommand(params));

    const events = result.Items
      ? result.Items.map((item) => unmarshall(item))
      : [];

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        success: true,
        events: events,
        count: events.length,
      }),
    };
  } catch (error: any) {
    console.error("❌ Error listing events:", error);
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
        error: `Failed to list events: ${error.message}`,
        mode: "local",
        events: [], // Return empty array as fallback
      }),
    };
  }
};
