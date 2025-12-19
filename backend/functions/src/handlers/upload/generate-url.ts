// src/handlers/upload/generate-url.ts
import { APIGatewayProxyEvent } from "aws-lambda";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const BUCKET_NAME = "event-ticketing-images";

const s3 = new S3Client({
  region: "us-east-1",
  endpoint: process.env.LOCALSTACK_ENDPOINT || "http://localhost:4566",
  credentials: { accessKeyId: "test", secretAccessKey: "test" },
  forcePathStyle: true,
});

export default async function generateUrlHandler(event: APIGatewayProxyEvent) {
  try {
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing request body" }),
      };
    }

    const { filename, contentType } = JSON.parse(event.body);

    if (!filename || !contentType) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "filename and contentType required" }),
      };
    }

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: filename,
      ContentType: contentType,
    });

    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });

    return { statusCode: 200, body: JSON.stringify({ url }) };
  } catch (err: any) {
    console.error("Generate URL error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Internal server error",
        details: err.message,
      }),
    };
  }
}
