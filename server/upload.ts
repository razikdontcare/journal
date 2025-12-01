import { Router } from "express";
import multer from "multer";
import { uploadImage } from "../app/lib/s3.server";
import { auth } from "../app/lib/auth.server";
import { fromNodeHeaders } from "better-auth/node";

const router = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}`));
    }
  },
});

// Upload endpoint
router.post("/", upload.single("file"), async (req, res) => {
  try {
    // Check authentication using better-auth
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file provided" });
    }

    // Convert buffer to Blob for the upload function
    const uint8Array = new Uint8Array(req.file.buffer);
    const blob = new Blob([uint8Array], { type: req.file.mimetype });

    const result = await uploadImage(blob, req.file.originalname);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    return res.json({ url: result.url });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Upload failed",
    });
  }
});

export default router;
