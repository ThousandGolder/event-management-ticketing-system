// backend/functions/src/handlers/auth/register.ts
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import * as bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

// Use the existing db utility or create a direct connection
import { dynamo, USERS_TABLE } from "../../utils/db";
import { PutCommand } from "@aws-sdk/lib-dynamodb";

const saltRounds = 10;

export const handler = async (
  event: APIGatewayProxyEvent,
  context?: Context // Add context parameter
): Promise<APIGatewayProxyResult> => {
  console.log("=== REGISTER HANDLER START ===");
  console.log("Event:", JSON.stringify(event, null, 2));
  if (context) {
    console.log("Context:", context.functionName);
  }

  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Allow-Methods": "POST,OPTIONS",
  };

  // Handle OPTIONS request for CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: "",
    };
  }

  try {
    // Check if body exists
    if (!event.body) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          message: "Request body is required",
          error: "MISSING_BODY",
        }),
      };
    }

    // Parse request body
    let requestBody;
    try {
      requestBody = JSON.parse(event.body);
    } catch (parseError) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          message: "Invalid JSON in request body",
          error: "INVALID_JSON",
        }),
      };
    }

    console.log("Request body:", requestBody);

    const { username, name, email, password, userType } = requestBody;

    // Validate required fields
    const missingFields = [];
    if (!username) missingFields.push("username");
    if (!name) missingFields.push("name");
    if (!email) missingFields.push("email");
    if (!password) missingFields.push("password");
    if (!userType) missingFields.push("userType");

    if (missingFields.length > 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          message: `Missing required fields: ${missingFields.join(", ")}`,
          error: "MISSING_FIELDS",
        }),
      };
    }

    // Validate userType
    const validUserTypes = ["attendee", "organizer", "admin"];
    if (!validUserTypes.includes(userType)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          message: `Invalid userType. Must be one of: ${validUserTypes.join(
            ", "
          )}`,
          error: "INVALID_USERTYPE",
        }),
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          message: "Invalid email format",
          error: "INVALID_EMAIL",
        }),
      };
    }

    // Generate userId
    const userId = `user_${uuidv4()}`;
    console.log("Generated userId:", userId);

    // Check if user already exists (by email)
    console.log("Checking for existing email:", email);
    try {
      // Since we might not have an email index, we'll skip this check for now
      // In production, you should have a secondary index on email
      console.log("Skipping duplicate email check for local development");
    } catch (error) {
      console.log(
        "Note: Email check failed, might be first user or index not created"
      );
    }

    // Hash password
    console.log("Hashing password...");
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log("Password hashed");

    // Create user object
    const user = {
      userId,
      username: username.trim(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      userType,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log("Saving user:", JSON.stringify(user, null, 2));

    try {
      // Save to DynamoDB
      const command = new PutCommand({
        TableName: USERS_TABLE,
        Item: user,
        // Optional: Add condition to prevent overwrite
        ConditionExpression: "attribute_not_exists(userId)",
      });

      await dynamo.send(command);
      console.log("✅ User saved successfully to DynamoDB!");
    } catch (dbError: any) {
      console.error("❌ DynamoDB error:", dbError);

      // Check for specific DynamoDB errors
      if (dbError.name === "ConditionalCheckFailedException") {
        return {
          statusCode: 409,
          headers,
          body: JSON.stringify({
            message: "User already exists",
            error: "USER_EXISTS",
          }),
        };
      }

      if (dbError.name === "ResourceNotFoundException") {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({
            message: "Database table not found. Please contact administrator.",
            error: "TABLE_NOT_FOUND",
            hint: "Make sure LocalStack is running and UsersTable exists",
          }),
        };
      }

      throw dbError; // Re-throw for general error handler
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        success: true,
        message: "User registered successfully",
        user: userWithoutPassword,
        timestamp: new Date().toISOString(),
      }),
    };
  } catch (error: any) {
    console.error("❌ REGISTRATION ERROR:", error);

    // Determine status code based on error
    let statusCode = 500;
    let errorMessage = "Registration failed due to an internal server error";
    let errorCode = "INTERNAL_ERROR";

    if (error.name === "UnrecognizedClientException") {
      statusCode = 403;
      errorMessage =
        "Database authentication failed. Check LocalStack configuration.";
      errorCode = "DB_AUTH_ERROR";
    } else if (error.name === "ResourceNotFoundException") {
      statusCode = 404;
      errorMessage =
        "Database table not found. Make sure tables are created in LocalStack.";
      errorCode = "TABLE_NOT_FOUND";
    } else if (
      error.name.includes("Validation") ||
      error.name.includes("ConditionalCheckFailed")
    ) {
      statusCode = 400;
      errorMessage = error.message || "Validation error occurred";
      errorCode = "VALIDATION_ERROR";
    }

    return {
      statusCode,
      headers,
      body: JSON.stringify({
        success: false,
        message: errorMessage,
        error: errorCode,
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
        timestamp: new Date().toISOString(),
      }),
    };
  }
};

// For testing with local-server
export default handler;
