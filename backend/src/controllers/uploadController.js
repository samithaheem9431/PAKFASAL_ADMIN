import {
  cloudinary,
  configureCloudinary,
} from "../config/cloudinary.js";

const ALLOWED = /^image\/(jpeg|png|gif|webp)$/i;

/**
 * Multer (memory buffer) → Cloudinary permanent URL.
 *
 * Firebase Storage cannot be used on this project until Blaze billing is
 * enabled (bucket create returns: billing account absent/disabled).
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

    if (!configureCloudinary()) {
      return res.status(503).json({
        error:
          "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.",
      });
    }

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "pakfasal/admin-uploads",
          resource_type: "image",
          overwrite: false,
        },
        (err, uploaded) => {
          if (err) reject(err);
          else resolve(uploaded);
        }
      );
      stream.end(req.file.buffer);
    });

    console.log("uploadImage cloudinary ok", result.public_id);
    res.json({
      url: result.secure_url,
      path: result.public_id,
      host: "cloudinary",
    });
  } catch (err) {
    console.error("uploadImage", err);
    res.status(500).json({ error: err?.message || "Upload failed" });
  }
}
