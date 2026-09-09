import { uploadImageBuffer } from "../utils/cloudinaryUpload.js";

/**
 * Uploads image and returns a permanent (or disk) public URL.
 */
export async function uploadImage(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file" });
    }
    const { url, host } = await uploadImageBuffer(req.file, req);
    console.log("uploadImage ok", host, url);
    res.json({ url, host });
  } catch (err) {
    console.error("uploadImage", err);
    const msg = err?.message || "Upload failed";
    const status = /Only JPEG|No file/i.test(msg)
      ? 400
      : /not configured|PUBLIC_API_URL/i.test(msg)
        ? 503
        : 500;
    res.status(status).json({ error: msg, host: "upload" });
  }
}
