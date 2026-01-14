import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

// Try without credentials for LocalStack
export const dynamo = new DynamoDBClient({
  region: "us-east-1",
  endpoint: "http://localhost:4566",
  // No credentials for LocalStack
});

// Table names
export const USERS_TABLE = process.env.USERS_TABLE || "Users";
export const EVENTS_TABLE = process.env.EVENTS_TABLE || "Events";
export const TICKETS_TABLE = process.env.TICKETS_TABLE || "Tickets";
