import { uploadBufferToFirebaseStorage } from "../utils/firebaseStorageUpload.js";

/**
 * Uploads image buffer to Firebase Storage and returns a permanent download URL.
 */
export async function uploadImage(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file" });
    }
    const url = await uploadBufferToFirebaseStorage(req.file);
    console.log("uploadImage firebase storage ok", url);
    res.json({
      url,
      host: "firebase-storage",
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
      host: "firebase-storage",
    });
  }
}
