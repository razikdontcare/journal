// S3-compatible storage client for image uploads
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// Initialize S3 client with environment variables
// For custom domain S3-compatible storage with bucketEndpoint
// Set S3_BUCKET_ENDPOINT=true when your endpoint already includes the bucket
// e.g., https://bucket.your-domain.com instead of https://your-domain.com/bucket
const s3Client = new S3Client({
  endpoint: process.env.S3_ENDPOINT, // e.g., https://bucket.your-domain.com
  region: process.env.S3_REGION || "auto",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
  },
  forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
  bucketEndpoint: process.env.S3_BUCKET_ENDPOINT === "true", // Treat endpoint as bucket URL
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || "blog-uploads";
const PUBLIC_URL = process.env.S3_PUBLIC_URL || process.env.S3_ENDPOINT; // Custom domain for public access

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Generate a unique filename with timestamp and random string
 */
function generateFilename(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split(".").pop()?.toLowerCase() || "jpg";
  const safeName = originalName
    .replace(/\.[^/.]+$/, "") // Remove extension
    .replace(/[^a-zA-Z0-9]/g, "-") // Replace special chars with dash
    .substring(0, 50); // Limit length

  return `uploads/${timestamp}-${random}-${safeName}.${extension}`;
}

/**
 * Validate that the file is an allowed image type
 */
function isValidImageType(mimeType: string): boolean {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
  ];
  return allowedTypes.includes(mimeType);
}

/**
 * Upload an image to S3-compatible storage
 */
export async function uploadImage(
  file: File | Blob,
  originalFilename: string
): Promise<UploadResult> {
  try {
    // Validate file type
    if (!isValidImageType(file.type)) {
      return {
        success: false,
        error: `Invalid file type: ${file.type}. Allowed: JPEG, PNG, GIF, WebP, SVG`,
      };
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return {
        success: false,
        error: "File too large. Maximum size is 10MB.",
      };
    }

    // Generate unique filename
    const key = generateFilename(originalFilename);

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to S3
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: file.type,
      // Make the object publicly readable
      ACL: "public-read",
    });

    await s3Client.send(command);

    // Construct public URL
    const publicUrl = `${PUBLIC_URL}/${key}`;

    return {
      success: true,
      url: publicUrl,
    };
  } catch (error) {
    console.error("S3 upload error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed",
    };
  }
}
