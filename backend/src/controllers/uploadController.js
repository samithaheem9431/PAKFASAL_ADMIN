import admin from "../firebaseAdmin.js";
import { randomUUID } from "crypto";
import { extname } from "path";

const ALLOWED = /^image\/(jpeg|png|gif|webp)$/i;

/**
 * Multer (memory) → Firebase Storage. Returns a permanent public download URL.
 */
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
    const downloadToken = randomUUID();

    const bucket = admin.storage().bucket();
    const file = bucket.file(objectPath);

    await file.save(req.file.buffer, {
      resumable: false,
      metadata: {
        contentType: mimetype,
        metadata: {
          firebaseStorageDownloadTokens: downloadToken,
        },
      },
    });

    // Firebase-compatible public URL (works in <img> without makePublic ACL)
    const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(objectPath)}?alt=media&token=${downloadToken}`;

    console.log("uploadImage firebase ok", objectPath);
    res.json({ url: publicUrl, path: objectPath, host: "firebase" });
  } catch (err) {
    console.error("uploadImage", err);
    const msg = String(err?.message || "");
    res.status(500).json({
      error:
        msg.includes("bucket") || err?.code === 404
          ? "Configure FIREBASE_STORAGE_BUCKET (e.g. your-project.appspot.com) and enable Storage in Firebase Console"
          : msg || "Upload failed",
    });
  }
}
