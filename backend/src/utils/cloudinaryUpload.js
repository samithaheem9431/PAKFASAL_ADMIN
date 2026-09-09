import {
  cloudinary,
  configureCloudinary,
} from "../config/cloudinary.js";

const ALLOWED = /^image\/(jpeg|png|gif|webp)$/i;

/**
 * Upload a multer memory file to Cloudinary.
 * @returns {Promise<string>} secure_url
 */
export async function uploadBufferToCloudinary(file) {
  if (!file?.buffer) {
    throw new Error("No file");
  }
  const mimetype = file.mimetype || "application/octet-stream";
  if (!ALLOWED.test(mimetype)) {
    throw new Error("Only JPEG, PNG, GIF, WebP allowed");
  }
  if (!configureCloudinary()) {
    throw new Error(
      "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET on the API server (Render env), then redeploy."
    );
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
    stream.end(file.buffer);
  });

  if (!result?.secure_url) {
    throw new Error("Cloudinary upload returned no URL");
  }
  return result.secure_url;
}
