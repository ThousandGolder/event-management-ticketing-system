// backend/functions/src/utils/s3.ts
import {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
  ListBucketsCommand,
  CreateBucketCommand,
  HeadBucketCommand,
  PutBucketPolicyCommand,
  PutBucketCorsCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { config } from "dotenv";

config();

const region = process.env.AWS_REGION || "us-east-1";
const accessKeyId = process.env.AWS_ACCESS_KEY_ID || "test";
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || "test";
const endpoint = process.env.AWS_ENDPOINT || "http://localhost:4566";
const bucketName = process.env.S3_BUCKET_NAME || "event-images";

const DEFAULT_EVENT_IMAGE =
  "https://images.unsplash.com/photo-1501281668745-f6f2612e4e71?w=800";

const s3Client = new S3Client({
  region,
  credentials: { accessKeyId, secretAccessKey },
  endpoint,
  forcePathStyle: true,
});

export interface UploadOptions {
  fileName: string;
  contentType: string;
  fileType?: string; // optional, now fully supported
  expiresIn?: number;
}

export interface PresignedUrlResponse {
  success: boolean;
  url?: string;
  key?: string;
  bucket?: string;
  error?: string;
  message?: string;
}

export interface S3Object {
  Key?: string;
  LastModified?: Date;
  ETag?: string;
  Size?: number;
  StorageClass?: string;
}

export function generateUniqueFileName(
  originalName: string,
  folder = "event-images"
): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const ext = originalName.split(".").pop()?.toLowerCase() || "jpg";
  return `${folder}/${timestamp}-${random}.${ext}`;
}

export async function generatePresignedUrl(
  options: UploadOptions
): Promise<PresignedUrlResponse> {
  try {
    const { fileName, contentType, fileType, expiresIn = 3600 } = options;

    // Use fileType as folder prefix if provided
    const folder = fileType || "event-images";
    const key = fileName.includes("/")
      ? fileName
      : generateUniqueFileName(fileName, folder);

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: contentType,
      ACL: "public-read",
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn });

    return {
      success: true,
      url,
      key,
      bucket: bucketName,
      message: "Presigned URL generated successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to generate upload URL",
      message: "Failed to generate presigned URL",
    };
  }
}

export function getPublicUrl(key: string): string {
  if (!key) return DEFAULT_EVENT_IMAGE;
  const cleanKey = key.startsWith("/") ? key.slice(1) : key;
  return `${endpoint}/${bucketName}/${cleanKey}`;
}

export async function ensureBucketExists(): Promise<boolean> {
  try {
    await s3Client.send(new HeadBucketCommand({ Bucket: bucketName }));
    return true;
  } catch (error: any) {
    if (error.name === "NotFound" || error.Code === "NotFound") {
      try {
        await s3Client.send(new CreateBucketCommand({ Bucket: bucketName }));
        await configureBucketPolicy();
        await configureBucketCors();
        return true;
      } catch (createError: any) {
        console.error("Failed to create bucket:", createError.message);
        return false;
      }
    }
    console.error("Error checking bucket:", error.message);
    return false;
  }
}

async function configureBucketPolicy() {
  const policy = {
    Version: "2012-10-17",
    Statement: [
      {
        Sid: "PublicReadGetObject",
        Effect: "Allow",
        Principal: "*",
        Action: ["s3:GetObject"],
        Resource: [`arn:aws:s3:::${bucketName}/*`],
      },
      {
        Sid: "AllowUploads",
        Effect: "Allow",
        Principal: "*",
        Action: ["s3:PutObject"],
        Resource: [`arn:aws:s3:::${bucketName}/*`],
        Condition: { StringEquals: { "s3:x-amz-acl": "public-read" } },
      },
    ],
  };
  await s3Client.send(
    new PutBucketPolicyCommand({
      Bucket: bucketName,
      Policy: JSON.stringify(policy),
    })
  );
}

async function configureBucketCors() {
  const corsConfig = {
    CORSRules: [
      {
        AllowedHeaders: ["*"],
        AllowedMethods: ["PUT", "POST", "GET", "DELETE"],
        AllowedOrigins: ["*"],
        ExposeHeaders: ["ETag"],
        MaxAgeSeconds: 3000,
      },
    ],
  };
  await s3Client.send(
    new PutBucketCorsCommand({
      Bucket: bucketName,
      CORSConfiguration: corsConfig,
    })
  );
}

export async function listObjects(prefix = ""): Promise<S3Object[]> {
  try {
    const data = await s3Client.send(
      new ListObjectsV2Command({ Bucket: bucketName, Prefix: prefix })
    );
    return data.Contents || [];
  } catch {
    return [];
  }
}

export async function deleteObject(key: string): Promise<boolean> {
  try {
    await s3Client.send(
      new DeleteObjectCommand({ Bucket: bucketName, Key: key })
    );
    return true;
  } catch {
    return false;
  }
}

export async function testS3Connection(): Promise<boolean> {
  try {
    const buckets = await s3Client.send(new ListBucketsCommand({}));
    await ensureBucketExists();
    return true;
  } catch {
    return false;
  }
}

export const s3 = s3Client;
export const S3 = {
  generatePresignedUrl,
  getPublicUrl,
  ensureBucketExists,
  testS3Connection,
  listObjects,
  deleteObject,
  generateUniqueFileName,
  bucketName,
  endpoint,
  DEFAULT_EVENT_IMAGE,
};
export default S3;
