// backend/functions/src/handlers/auth/login.ts
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { dynamo, USERS_TABLE } from "../../utils/db";
import { QueryCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";

const JWT_SECRET = "your-jwt-secret-key-change-in-production";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log("=== LOGIN HANDLER START ===");

  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Credentials": "true",
  };

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: "",
    };
  }

  try {
    if (!event.body) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: "Request body is required",
        }),
      };
    }

    const body = JSON.parse(event.body);
    console.log("Login request body:", body);

    const { email, password } = body;

    if (!email || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: "Email and password are required",
        }),
      };
    }

    // Normalize email to lowercase for consistent lookup
    const normalizedEmail = email.toLowerCase().trim();
    console.log(
      `Looking for user with email: "${normalizedEmail}" in table: ${USERS_TABLE}`
    );

    let user = null;

    try {
      // METHOD 1: Try using EmailIndex GSI first (most efficient)
      const queryCommand = new QueryCommand({
        TableName: USERS_TABLE,
        IndexName: "EmailIndex",
        KeyConditionExpression: "email = :email",
        ExpressionAttributeValues: {
          ":email": normalizedEmail,
        },
      });

      const queryResponse = await dynamo.send(queryCommand);

      if (queryResponse.Items && queryResponse.Items.length > 0) {
        user = queryResponse.Items[0];
        console.log(
          `✅ User found via EmailIndex: ${user.userId} - ${user.email}`
        );
      } else {
        // METHOD 2: Fallback to scan if GSI doesn't exist or no results
        console.log(
          "EmailIndex query returned no results, falling back to scan..."
        );
        const scanCommand = new ScanCommand({
          TableName: USERS_TABLE,
        });

        const scanResponse = await dynamo.send(scanCommand);
        console.log(`Total users in table: ${scanResponse.Count}`);

        // Debug: Log all emails in table
        if (scanResponse.Items) {
          console.log("All emails in table:");
          scanResponse.Items.forEach((item, index) => {
            console.log(
              `  ${index + 1}. ${item.email} (userId: ${item.userId})`
            );
          });
        }

        // Case-insensitive search during scan
        user = scanResponse.Items?.find(
          (item) => item.email.toLowerCase() === normalizedEmail
        );

        if (!user) {
          console.log(
            `User with email "${normalizedEmail}" not found in ${
              scanResponse.Items?.length || 0
            } records`
          );
          return {
            statusCode: 401,
            headers,
            body: JSON.stringify({
              success: false,
              message: "Invalid email or password",
            }),
          };
        }
        console.log("✅ User found via scan:", user.userId, "-", user.email);
      }
    } catch (indexError: any) {
      // If EmailIndex doesn't exist, fall back to scan
      if (
        indexError.name === "ResourceNotFoundException" ||
        indexError.name === "ValidationException"
      ) {
        console.log("EmailIndex not found, using scan method...");

        const scanCommand = new ScanCommand({
          TableName: USERS_TABLE,
        });

        const scanResponse = await dynamo.send(scanCommand);

        // Case-insensitive search
        user = scanResponse.Items?.find(
          (item) => item.email.toLowerCase() === normalizedEmail
        );

        if (!user) {
          return {
            statusCode: 401,
            headers,
            body: JSON.stringify({
              success: false,
              message: "Invalid email or password",
            }),
          };
        }
      } else {
        throw indexError;
      }
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      console.log("❌ Password invalid for user:", user.userId);
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({
          success: false,
          message: "Invalid email or password",
        }),
      };
    }

    console.log("✅ Password valid, generating token...");

    // Generate JWT token
    const tokenPayload = {
      userId: user.userId,
      email: user.email,
      userType: user.userType,
      username: user.username,
    };

    const token = (jwt as any).sign(tokenPayload, JWT_SECRET, {
      expiresIn: "24h",
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: "Login successful",
        token: token,
        user: userWithoutPassword,
        expiresIn: "24h",
      }),
    };
  } catch (error: any) {
    console.error("❌ LOGIN ERROR:", error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: "Login failed",
        error: error.message,
      }),
    };
  }
};

export default handler;
