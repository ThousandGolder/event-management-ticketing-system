
//frontend/lib/dynamodb.ts
import AWS from "aws-sdk";

// Configure AWS SDK
const configureAWS = () => {
  AWS.config.update({
    region: process.env.NEXT_PUBLIC_AWS_REGION || "us-east-1",
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY,
  });
};

configureAWS();

const dynamoDB = new AWS.DynamoDB.DocumentClient();

export interface Event {
  eventId: string;
  title: string;
  description: string;
  date: string; // ISO string
  location: string;
  city: string;
  imageUrl?: string;
  userId: string;
  organizer: string;
  organizerEmail: string;
  ticketsSold: number;
  totalTickets: number;
  revenue: number;
  status: "active" | "pending" | "completed" | "cancelled" | "suspended";
  category: string;
  createdAt: string;
  updatedAt: string;
}

export const EventsTable = {
  TableName: "Events",
  Indexes: {
    StatusIndex: "StatusIndex",
    CategoryIndex: "CategoryIndex",
    UserIdIndex: "UserIdIndex",
  },
};

// Helper function to generate unique ID
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// CRUD Operations
export const dynamoDBService = {
  // Create event
  async createEvent(
    event: Omit<Event, "eventId" | "createdAt" | "updatedAt">
  ): Promise<Event> {
    const newEvent: Event = {
      ...event,
      eventId: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const params = {
      TableName: EventsTable.TableName,
      Item: newEvent,
    };

    await dynamoDB.put(params).promise();
    return newEvent;
  },

  // Get event by ID
  async getEventById(eventId: string): Promise<Event | null> {
    const params = {
      TableName: EventsTable.TableName,
      Key: { eventId },
    };

    try {
      const result = await dynamoDB.get(params).promise();
      return (result.Item as Event) || null;
    } catch (error) {
      console.error("Error getting event:", error);
      return null;
    }
  },

  // Get all events with optional filtering
  async getAllEvents(filters?: {
    status?: string;
    category?: string;
    search?: string;
    userId?: string;
  }): Promise<Event[]> {
    let params: any = {
      TableName: EventsTable.TableName,
    };

    // If we have filters, build query
    if (filters) {
      const { status, category, search, userId } = filters;
      let filterExpression = "";
      const expressionValues: any = {};
      const expressionNames: any = {};

      if (status) {
        filterExpression = "#s = :status";
        expressionNames["#s"] = "status";
        expressionValues[":status"] = status;
      }

      if (category) {
        if (filterExpression) filterExpression += " AND ";
        filterExpression += "category = :category";
        expressionValues[":category"] = category;
      }

      if (userId) {
        if (filterExpression) filterExpression += " AND ";
        filterExpression += "userId = :userId";
        expressionValues[":userId"] = userId;
      }

      if (filterExpression) {
        params.FilterExpression = filterExpression;
        params.ExpressionAttributeValues = expressionValues;
        if (Object.keys(expressionNames).length > 0) {
          params.ExpressionAttributeNames = expressionNames;
        }
      }
    }

    try {
      const result = await dynamoDB.scan(params).promise();
      let events = (result.Items as Event[]) || [];

      // Apply search filter if provided
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        events = events.filter(
          (event) =>
            event.title.toLowerCase().includes(searchLower) ||
            event.organizer.toLowerCase().includes(searchLower) ||
            event.location.toLowerCase().includes(searchLower) ||
            event.city.toLowerCase().includes(searchLower)
        );
      }

      // Sort by date (newest first)
      events.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      return events;
    } catch (error) {
      console.error("Error getting events:", error);
      return [];
    }
  },

  // Update event
  async updateEvent(
    eventId: string,
    updates: Partial<Event>
  ): Promise<Event | null> {
    const updateExpression: string[] = [];
    const expressionValues: any = {};
    const expressionNames: any = {};

    // Build update expression
    Object.keys(updates).forEach((key, index) => {
      if (key !== "eventId" && key !== "createdAt") {
        updateExpression.push(`#${key} = :${key}`);
        expressionNames[`#${key}`] = key;
        expressionValues[`:${key}`] = updates[key as keyof Event];
      }
    });

    // Always update updatedAt
    updateExpression.push("updatedAt = :updatedAt");
    expressionValues[":updatedAt"] = new Date().toISOString();

    const params = {
      TableName: EventsTable.TableName,
      Key: { eventId },
      UpdateExpression: `SET ${updateExpression.join(", ")}`,
      ExpressionAttributeNames: expressionNames,
      ExpressionAttributeValues: expressionValues,
      ReturnValues: "ALL_NEW",
    };

    try {
      const result = await dynamoDB.update(params).promise();
      return result.Attributes as Event;
    } catch (error) {
      console.error("Error updating event:", error);
      return null;
    }
  },

  // Delete event
  async deleteEvent(eventId: string): Promise<boolean> {
    const params = {
      TableName: EventsTable.TableName,
      Key: { eventId },
    };

    try {
      await dynamoDB.delete(params).promise();
      return true;
    } catch (error) {
      console.error("Error deleting event:", error);
      return false;
    }
  },

  // Batch operations
  async updateEventStatusBatch(
    eventIds: string[],
    status: Event["status"]
  ): Promise<boolean> {
    try {
      const promises = eventIds.map((eventId) =>
        this.updateEvent(eventId, { status })
      );
      await Promise.all(promises);
      return true;
    } catch (error) {
      console.error("Error updating event status batch:", error);
      return false;
    }
  },

  async deleteEventsBatch(eventIds: string[]): Promise<boolean> {
    try {
      const promises = eventIds.map((eventId) => this.deleteEvent(eventId));
      await Promise.all(promises);
      return true;
    } catch (error) {
      console.error("Error deleting events batch:", error);
      return false;
    }
  },

  // Get statistics
  async getEventStatistics(): Promise<{
    totalEvents: number;
    totalRevenue: number;
    totalTicketsSold: number;
    activeEvents: number;
    pendingEvents: number;
  }> {
    const events = await this.getAllEvents();

    const totalEvents = events.length;
    const totalRevenue = events.reduce((sum, event) => sum + event.revenue, 0);
    const totalTicketsSold = events.reduce(
      (sum, event) => sum + event.ticketsSold,
      0
    );
    const activeEvents = events.filter(
      (event) => event.status === "active"
    ).length;
    const pendingEvents = events.filter(
      (event) => event.status === "pending"
    ).length;

    return {
      totalEvents,
      totalRevenue,
      totalTicketsSold,
      activeEvents,
      pendingEvents,
    };
  },
};
