import admin from "../firebaseAdmin.js";
import { randomUUID } from "crypto";
import { extname } from "path";

const ALLOWED = /^image\/(jpeg|png|gif|webp)$/i;

export async function uploadImage(req, res) {
  try {
    if (!req.file?.buffer) {
      return res.status(400).json({ error: "No file" });
    }
    const mimetype = req.file.mimetype || "application/octet-stream";
    if (!ALLOWED.test(mimetype)) {
      return res.status(400).json({ error: "Only JPEG, PNG, GIF, WebP allowed" });
    }
    const ext = extname(req.file.originalname || "") || ".jpg";
    const safeExt = ext.match(/^\.[a-z0-9]+$/i) ? ext.toLowerCase() : ".jpg";
    const objectPath = `admin-uploads/${randomUUID()}${safeExt}`;

    const bucket = admin.storage().bucket();
    const file = bucket.file(objectPath);
    await file.save(req.file.buffer, {
      metadata: { contentType: mimetype },
    });
    await file.makePublic();
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${objectPath}`;
    res.json({ url: publicUrl, path: objectPath });
  } catch (err) {
    console.error("uploadImage", err);
    res.status(500).json({
      error:
        err.message?.includes("bucket") || err.code === 404
          ? "Configure FIREBASE_STORAGE_BUCKET or enable Storage for this project"
          : "Upload failed",
    });
  }
}
