// backend/functions/src/handlers/user/update-profile.ts
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  UpdateCommand,
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

interface UpdateProfileRequest {
  name?: string;
  email?: string;
}

interface User {
  userId: string;
  email: string;
  username: string;
  name: string;
  userType: string;
  createdAt: string;
  updatedAt: string;
}

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    // Get user ID from authorizer or query params
    const userId =
      event.queryStringParameters?.userId ||
      event.requestContext?.authorizer?.claims?.sub ||
      "test-user-001";

    // Parse request body
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
          error: "Invalid request",
          message: "Request body is required",
        }),
      };
    }

    const body: UpdateProfileRequest = JSON.parse(event.body);
    const { name, email } = body;

    // Validate request
    if (!name && !email) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({
          success: false,
          error: "Invalid request",
          message: "At least one field (name or email) is required to update",
        }),
      };
    }

    console.log("✏️ Updating profile for user:", userId, "with data:", body);

    // 1. First, check if user exists
    const getUserParams = {
      TableName: process.env.USERS_TABLE || "Users",
      Key: {
        userId: userId,
      },
    };

    const userResult = await docClient.send(new GetCommand(getUserParams));
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

    // 2. Build update expression
    const updateExpressionParts: string[] = [];
    const expressionAttributeNames: any = {};
    const expressionAttributeValues: any = {};

    if (name) {
      updateExpressionParts.push("#n = :name");
      expressionAttributeNames["#n"] = "name";
      expressionAttributeValues[":name"] = name;
    }

    if (email) {
      // Check if email is already taken by another user
      if (email !== user.email) {
        // In a real app, you'd check if email exists in the Users table
        // For now, we'll just update it
        updateExpressionParts.push("email = :email");
        expressionAttributeValues[":email"] = email;
      }
    }

    // Always update the updatedAt timestamp
    updateExpressionParts.push("updatedAt = :updatedAt");
    expressionAttributeValues[":updatedAt"] = new Date().toISOString();

    // 3. Update user in DynamoDB
    const updateParams = {
      TableName: process.env.USERS_TABLE || "Users",
      Key: {
        userId: userId,
      },
      UpdateExpression: `SET ${updateExpressionParts.join(", ")}`,
      ExpressionAttributeNames:
        Object.keys(expressionAttributeNames).length > 0
          ? expressionAttributeNames
          : undefined,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "ALL_NEW" as const,
    };

    const updateResult = await docClient.send(new UpdateCommand(updateParams));
    const updatedUser = updateResult.Attributes as User;

    console.log(`✅ Profile updated for ${updatedUser.name}`);

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

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        success: true,
        message: "Profile updated successfully",
        data: {
          id: updatedUser.userId,
          name: updatedUser.name,
          email: updatedUser.email,
          role: mapUserTypeToRole(updatedUser.userType),
          createdAt: updatedUser.createdAt,
          updatedAt: updatedUser.updatedAt,
        },
        user: {
          id: updatedUser.userId,
          name: updatedUser.name,
          email: updatedUser.email,
          role: mapUserTypeToRole(updatedUser.userType),
          createdAt: updatedUser.createdAt,
          updatedAt: updatedUser.updatedAt,
        },
        userId: userId,
        timestamp: new Date().toISOString(),
      }),
    };
  } catch (error) {
    console.error("❌ Error in update profile handler:", error);

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        success: false,
        error: "Failed to update profile",
        message: error instanceof Error ? error.message : "Unknown error",
        data: null,
        timestamp: new Date().toISOString(),
      }),
    };
  }
};
