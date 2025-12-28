// backend/functions/src/handlers/auth/forgot-password.ts
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  QueryCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";

const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
  endpoint: process.env.AWS_ENDPOINT || "http://localhost:4566",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "test",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "test",
  },
});

const docClient = DynamoDBDocumentClient.from(dynamoClient);

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
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
          error: "Invalid request",
          message: "Request body is required",
        }),
      };
    }

    const { email } = JSON.parse(event.body);

    if (!email) {
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
          message: "Email is required",
        }),
      };
    }

    console.log("🔐 Forgot password request for:", email);

    // 1. Check if user exists in Users table using EmailIndex GSI
    let user = null;

    try {
      const queryParams = {
        TableName: process.env.USERS_TABLE || "Users",
        IndexName: "EmailIndex",
        KeyConditionExpression: "email = :email",
        ExpressionAttributeValues: {
          ":email": email,
        },
        Limit: 1,
      };

      const queryResult = await docClient.send(new QueryCommand(queryParams));
      user = queryResult.Items?.[0];

      if (!user) {
        console.log("ℹ️ No user found with email:", email);
      } else {
        console.log("✅ User found:", {
          userId: user.userId,
          email: user.email,
          username: user.username,
        });
      }
    } catch (dbError: any) {
      console.error("Database error finding user:", dbError.message);
      // Continue - we'll return success anyway for security
    }

    if (!user) {
      // Return success even if user doesn't exist (for security)
      console.log("ℹ️ User not found, but returning success for security");
      return {
        statusCode: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({
          success: true,
          message:
            "If an account exists with this email, you will receive a reset link",
          email: email,
          timestamp: new Date().toISOString(),
        }),
      };
    }

    // 2. Generate reset token with 24-hour expiry for testing
    const resetToken = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours for testing

    // 3. Store reset token directly in the user record
    try {
      const updateParams = {
        TableName: process.env.USERS_TABLE || "Users",
        Key: {
          userId: user.userId,
        },
        UpdateExpression:
          "SET resetToken = :resetToken, resetTokenExpires = :expiresAt, updatedAt = :updatedAt",
        ExpressionAttributeValues: {
          ":resetToken": resetToken,
          ":expiresAt": expiresAt.toISOString(),
          ":updatedAt": new Date().toISOString(),
        },
        ReturnValues: "UPDATED_NEW" as const,
      };

      await docClient.send(new UpdateCommand(updateParams));
      console.log(`✅ Reset token saved for user ${user.userId}`);
    } catch (updateError: any) {
      console.error("Error saving reset token:", updateError.message);
      // Continue anyway - we'll still return the token
    }

    console.log(
      `✅ Reset token generated for ${email}: ${resetToken.substring(0, 8)}...`
    );

    // 4. Return success with token (always return in development, optional in production)
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        success: true,
        message:
          "If an account exists with this email, you will receive a reset link",
        email: email,
        // ALWAYS return token for testing (you can change this later)
        resetToken: resetToken,
        expiresAt: expiresAt.toISOString(),
        timestamp: new Date().toISOString(),
      }),
    };
  } catch (error) {
    console.error("❌ Error in forgot password handler:", error);

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        success: false,
        error: "Failed to process password reset request",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      }),
    };
  }
};
