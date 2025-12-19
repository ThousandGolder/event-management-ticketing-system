import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { dynamo, USERS_TABLE } from "../../utils/db";
import { ScanCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";

interface User {
  userId: string;
  email: string;
  username: string;
  name: string;
  userType: string;
  createdAt: string;
  updatedAt: string;
  status?: string;
}

interface PaginationParams {
  limit: number;
  lastEvaluatedKey?: any;
}

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log("=== USER LIST HANDLER START ===");

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
    // Check authorization - only admin can list users
    const authHeader =
      event.headers.Authorization || event.headers.authorization;
    if (!authHeader) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({
          success: false,
          message: "Authorization token required",
        }),
      };
    }

    // Parse query parameters
    const queryParams = event.queryStringParameters || {};
    const limit = parseInt(queryParams.limit || "20");
    const page = parseInt(queryParams.page || "1");
    const userType = queryParams.userType;
    const search = queryParams.search?.toLowerCase();
    const lastKey = queryParams.lastKey;

    console.log("Query params:", {
      limit,
      page,
      userType,
      search,
      lastKey,
    });

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Build scan parameters
    let scanParams: any = {
      TableName: USERS_TABLE,
      Limit: limit,
    };

    // Add filter expressions if provided
    let filterExpressions = [];
    let expressionAttributeValues: any = {};
    let expressionAttributeNames: any = {};

    if (userType) {
      filterExpressions.push("#ut = :userType");
      expressionAttributeNames["#ut"] = "userType";
      expressionAttributeValues[":userType"] = userType;
    }

    if (search) {
      filterExpressions.push(
        "(contains(#nm, :search) OR contains(#em, :search) OR contains(#un, :search))"
      );
      expressionAttributeNames["#nm"] = "name";
      expressionAttributeNames["#em"] = "email";
      expressionAttributeNames["#un"] = "username";
      expressionAttributeValues[":search"] = search;
    }

    if (filterExpressions.length > 0) {
      scanParams.FilterExpression = filterExpressions.join(" AND ");
      scanParams.ExpressionAttributeNames = expressionAttributeNames;
      scanParams.ExpressionAttributeValues = expressionAttributeValues;
    }

    // If lastKey is provided for pagination
    if (lastKey) {
      try {
        const lastEvaluatedKey = JSON.parse(decodeURIComponent(lastKey));
        scanParams.ExclusiveStartKey = lastEvaluatedKey;
      } catch (error) {
        console.warn("Invalid lastKey parameter, ignoring pagination");
      }
    }

    console.log("Scan parameters:", JSON.stringify(scanParams, null, 2));

    // Execute scan
    const scanCommand = new ScanCommand(scanParams);
    const result = await dynamo.send(scanCommand);

    // Format users - remove password field
    const users: User[] = (result.Items || []).map((item: any) => {
      const { password, ...userWithoutPassword } = item;

      // Determine status based on userType or other criteria
      const status = item.userType === "admin" ? "Active" : "Active";

      return {
        ...userWithoutPassword,
        status,
      };
    });

    // Get total count for pagination
    let totalCount = 0;
    try {
      const countCommand = new ScanCommand({
        TableName: USERS_TABLE,
        Select: "COUNT",
      });
      const countResult = await dynamo.send(countCommand);
      totalCount = countResult.Count || 0;
    } catch (error) {
      console.error("Error getting total count:", error);
    }

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = !!result.LastEvaluatedKey;
    const hasPreviousPage = page > 1;

    // Get platform statistics
    const stats = await getPlatformStats();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: "Users retrieved successfully",
        data: {
          users,
          pagination: {
            total: totalCount,
            page,
            limit,
            totalPages,
            hasNextPage,
            hasPreviousPage,
            nextKey: hasNextPage
              ? encodeURIComponent(JSON.stringify(result.LastEvaluatedKey))
              : null,
          },
          stats,
        },
      }),
    };
  } catch (error: any) {
    console.error("❌ USER LIST ERROR:", error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: "Failed to retrieve users",
        error: error.message,
      }),
    };
  }
};

// Get platform statistics
async function getPlatformStats() {
  try {
    // Get total users
    const usersScan = new ScanCommand({
      TableName: USERS_TABLE,
      Select: "COUNT",
    });
    const usersResult = await dynamo.send(usersScan);
    const totalUsers = usersResult.Count || 0;

    // Get active users (users with recent activity)
    const activeUsersScan = new ScanCommand({
      TableName: USERS_TABLE,
      FilterExpression: "attribute_exists(updatedAt)",
    });
    const activeUsersResult = await dynamo.send(activeUsersScan);
    const activeUsers = activeUsersResult.Count || 0;

    // Get users by type
    const adminUsers = await countUsersByType("admin");
    const organizerUsers = await countUsersByType("organizer");
    const attendeeUsers = await countUsersByType("attendee");

    return {
      totalUsers,
      activeUsers,
      adminUsers,
      organizerUsers,
      attendeeUsers,
      // These would come from other tables
      totalEvents: 0,
      activeEvents: 0,
      ticketsSold: 0,
      totalRevenue: 0,
    };
  } catch (error) {
    console.error("Error getting platform stats:", error);
    return {
      totalUsers: 0,
      activeUsers: 0,
      adminUsers: 0,
      organizerUsers: 0,
      attendeeUsers: 0,
      totalEvents: 0,
      activeEvents: 0,
      ticketsSold: 0,
      totalRevenue: 0,
    };
  }
}

// Helper function to count users by type
async function countUsersByType(userType: string): Promise<number> {
  try {
    const queryCommand = new QueryCommand({
      TableName: USERS_TABLE,
      IndexName: "UserTypeIndex",
      KeyConditionExpression: "userType = :userType",
      ExpressionAttributeValues: {
        ":userType": userType,
      },
      Select: "COUNT",
    });

    const result = await dynamo.send(queryCommand);
    return result.Count || 0;
  } catch (error) {
    console.error(`Error counting ${userType} users:`, error);
    return 0;
  }
}

export default handler;
