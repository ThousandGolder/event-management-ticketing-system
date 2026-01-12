// backend/functions/src/local-server.ts
import express from "express";
import cors from "cors";
import { APIGatewayProxyResult } from "aws-lambda";

// Set environment variables for local development
process.env.IS_OFFLINE = "true";
process.env.EVENTS_TABLE = "Events";
process.env.USERS_TABLE = "Users";
process.env.TICKETS_TABLE = "Tickets";

// ----------------- IMPORT HANDLERS -----------------
import loginHandler from "./handlers/auth/login";
import registerHandler from "./handlers/auth/register";
import { handler as generateUrlHandler } from "./handlers/upload/generate-url";
import { handler as forgotPasswordHandler } from "./handlers/auth/forgot-password";
import { handler as resetPasswordHandler } from "./handlers/auth/reset-password";

import { handler as createEventHandler } from "./handlers/events/create";
import { handler as listEventsHandler } from "./handlers/events/list";
import { handler as getEventHandler } from "./handlers/events/get";
import { handler as updateEventHandler } from "./handlers/events/update";
import { handler as deleteEventHandler } from "./handlers/events/delete";
import { handler as updateStatusHandler } from "./handlers/events/update-status";
import { handler as getEventCountsHandler } from "./handlers/events/get-counts";

import { handler as getAnalyticsHandler } from "./handlers/analytics/get";
import { handler as getUserTicketsHandler } from "./handlers/user/tickets";
import { handler as getUserEventsHandler } from "./handlers/user/events";
import { handler as listUsersHandler } from "./handlers/user/list";
import { handler as userProfileHandler } from "./handlers/user/profile";
import { handler as updateProfileHandler } from "./handlers/user/update-profile";
import { handler as getUserStatsHandler } from "./handlers/user/stats";

// ----------------- EXPRESS SETUP -----------------
const app = express();
app.use(cors());
app.use(express.json());

// Helper to convert Express request to Lambda event
const createLambdaEvent = (req: express.Request, path: string, method: string) => ({
  httpMethod: method,
  path,
  headers: req.headers as Record<string, string>,
  queryStringParameters: Object.keys(req.query).length ? (req.query as Record<string, string>) : null,
  pathParameters: Object.keys(req.params).length ? req.params : null,
  body: req.body ? JSON.stringify(req.body) : null,
  requestContext: {
    accountId: "123456789012",
    apiId: "test-api-id",
    authorizer: null as any,
    protocol: "HTTP/1.1",
    httpMethod: method,
    path,
    stage: "local",
    requestId: "test-request-id",
    requestTimeEpoch: Date.now(),
    resourceId: "test-resource-id",
    resourcePath: path,
  },
  isBase64Encoded: false,
  resource: path,
  stageVariables: null,
  multiValueHeaders: {},
  multiValueQueryStringParameters: null,
  stage: "local",
});

// Helper to handle Lambda response
const handleLambdaResponse = (result: APIGatewayProxyResult, res: express.Response) => {
  if (result.headers) {
    Object.entries(result.headers).forEach(([key, value]) => res.setHeader(key, value as string));
  }
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  let responseBody;
  try {
    responseBody = JSON.parse(result.body);
  } catch {
    responseBody = { message: result.body };
  }

  res.status(result.statusCode).json(responseBody);
};

// ----------------- ROUTES -----------------

// ----- AUTH -----
app.post("/auth/register", async (req, res) => {
  const event = createLambdaEvent(req, "/auth/register", "POST");
  const result = await registerHandler(event as any);
  handleLambdaResponse(result, res);
});

app.post("/auth/login", async (req, res) => {
  const event = createLambdaEvent(req, "/auth/login", "POST");
  const result = await loginHandler(event as any);
  handleLambdaResponse(result, res);
});

app.post("/auth/forgot-password", async (req, res) => {
  const event = createLambdaEvent(req, "/auth/forgot-password", "POST");
  const result = await forgotPasswordHandler(event as any);
  handleLambdaResponse(result, res);
});

app.post("/auth/reset-password", async (req, res) => {
  const event = createLambdaEvent(req, "/auth/reset-password", "POST");
  const result = await resetPasswordHandler(event as any);
  handleLambdaResponse(result, res);
});

// ----- USER -----
app.get("/user/stats", async (req, res) => {
  const event = createLambdaEvent(req, "/user/stats", "GET");
  event.queryStringParameters = req.query as Record<string, string> | null;
  event.requestContext.authorizer ??= {
    claims: { sub: (req.query.userId as string) || "test-user-001", email: "test@example.com" },
  };
  const result = await getUserStatsHandler(event as any);
  handleLambdaResponse(result, res);
});

app.get("/user/profile", async (req, res) => {
  const event = createLambdaEvent(req, "/user/profile", "GET");
  event.queryStringParameters = req.query as Record<string, string> | null;
  event.requestContext.authorizer ??= {
    claims: { sub: (req.query.userId as string) || "test-user-001", email: "test@example.com" },
  };
  const result = await userProfileHandler(event as any);
  handleLambdaResponse(result, res);
});

app.put("/user/profile", async (req, res) => {
  const event = createLambdaEvent(req, "/user/profile", "PUT");
  event.queryStringParameters = req.query as Record<string, string> | null;
  event.requestContext.authorizer ??= {
    claims: { sub: (req.query.userId as string) || "test-user-001", email: "test@example.com" },
  };
  const result = await updateProfileHandler(event as any);
  handleLambdaResponse(result, res);
});

app.get("/user/tickets", async (req, res) => {
  const event = createLambdaEvent(req, "/user/tickets", "GET");
  event.queryStringParameters = req.query as Record<string, string> | null;
  event.requestContext.authorizer ??= {
    claims: { sub: (req.query.userId as string) || "test-user-001", email: "test@example.com" },
  };
  const result = await getUserTicketsHandler(event as any);
  handleLambdaResponse(result, res);
});

app.get("/user/events", async (req, res) => {
  const event = createLambdaEvent(req, "/user/events", "GET");
  event.queryStringParameters = req.query as Record<string, string> | null;
  event.requestContext.authorizer = {
    claims: { sub: (req.query.userId as string) || "test-user-001", email: "test@example.com" },
  };
  const result = await getUserEventsHandler(event as any);
  handleLambdaResponse(result, res);
});

// ----- ADMIN -----
app.get("/admin/users", async (req, res) => {
  const event = createLambdaEvent(req, "/admin/users", "GET");
  event.queryStringParameters = req.query as Record<string, string> | null;
  const result = await listUsersHandler(event as any);
  handleLambdaResponse(result, res);
});

// ----- EVENTS -----
app.get("/events", async (req, res) => {
  const event = createLambdaEvent(req, "/events", "GET");
  const result = await listEventsHandler(event as any);
  handleLambdaResponse(result, res);
});

app.get("/events/:id", async (req, res) => {
  const event = createLambdaEvent(req, "/events/{id}", "GET");
  event.pathParameters = { id: req.params.id };
  const result = await getEventHandler(event as any);
  handleLambdaResponse(result, res);
});

app.post("/events", async (req, res) => {
  const event = createLambdaEvent(req, "/events", "POST");
  const result = await createEventHandler(event as any);
  handleLambdaResponse(result, res);
});

app.put("/events/:id", async (req, res) => {
  const event = createLambdaEvent(req, "/events/{id}", "PUT");
  event.pathParameters = { id: req.params.id };
  const result = await updateEventHandler(event as any);
  handleLambdaResponse(result, res);
});

app.put("/events/:id/status", async (req, res) => {
  const event = createLambdaEvent(req, "/events/{id}/status", "PUT");
  event.pathParameters = { id: req.params.id };
  event.body = JSON.stringify({ status: req.body.status });
  const result = await updateStatusHandler(event as any);
  handleLambdaResponse(result, res);
});

app.delete("/events/:id", async (req, res) => {
  const event = createLambdaEvent(req, "/events/{id}", "DELETE");
  event.pathParameters = { id: req.params.id };
  const result = await deleteEventHandler(event as any);
  handleLambdaResponse(result, res);
});

// ----- UPLOAD -----
app.post("/upload/generate-url", async (req, res) => {
  const event = createLambdaEvent(req, "/upload/generate-url", "POST");
  event.body = JSON.stringify(req.body);
  const result = await generateUrlHandler(event as any);
  handleLambdaResponse(result, res);
});

// ----- HEALTH CHECK -----
app.get("/health", (req, res) => res.json({ success: true, status: "healthy" }));

// ----------------- START SERVER -----------------
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Local backend server running on http://localhost:${PORT}`));
