import { uploadBufferToCloudinary } from "../utils/cloudinaryUpload.js";

/**
 * Uploads image buffer to Cloudinary and returns a permanent HTTPS URL.
 * Firestore stores only that URL string (via product / crop / disease forms).
 */
export async function uploadImage(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file" });
    }
    const url = await uploadBufferToCloudinary(req.file);
    console.log("uploadImage cloudinary ok", url);
    res.json({
      url,
      host: "cloudinary",
    });
  } catch (err) {
    console.error("uploadImage", err);
    const msg = err?.message || "Upload failed";
    const status = /not configured/i.test(msg)
      ? 503
      : /Only JPEG|No file/i.test(msg)
        ? 400
        : 500;
    res.status(status).json({
      error: msg,
      host: "cloudinary",
    });
  }
}
