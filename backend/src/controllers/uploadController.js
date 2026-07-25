const ALLOWED = /^image\/(jpeg|png|gif|webp)$/i;

/**
 * Saves image via multer (disk) and returns a public URL.
 * Free alternative to Firebase Storage (no billing required).
 */
export async function uploadImage(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file" });
    }
    const mimetype = req.file.mimetype || "application/octet-stream";
    if (!ALLOWED.test(mimetype)) {
      return res.status(400).json({ error: "Only JPEG, PNG, GIF, WebP allowed" });
    }

    const base = (
      process.env.PUBLIC_API_URL ||
      `${req.protocol}://${req.get("host")}`
    ).replace(/\/$/, "");

    const url = `${base}/uploads/${req.file.filename}`;
    res.json({ url, path: req.file.filename });
  } catch (err) {
    console.error("uploadImage", err);
    res.status(500).json({ error: "Upload failed" });
  }
}
