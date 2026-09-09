import cloudinary, { isCloudinaryConfigured } from "../config/cloudinary.js";

const ALLOWED = /^image\/(jpeg|png|gif|webp)$/i;

export { isCloudinaryConfigured };

/**
 * Upload a multer memory file to Cloudinary.
 * Returns a durable HTTPS URL — Firestore should store only this URL.
 * @param {{ buffer: Buffer, mimetype?: string }} file
 * @param {string} [folder]
 * @returns {Promise<string>}
 */
export function uploadBufferToCloudinary(file, folder = "pakfasal-admin") {
  if (!file?.buffer) {
    return Promise.reject(new Error("No file"));
  }
  const mimetype = file.mimetype || "application/octet-stream";
  if (!ALLOWED.test(mimetype)) {
    return Promise.reject(new Error("Only JPEG, PNG, GIF, WebP allowed"));
  }
  if (!isCloudinaryConfigured()) {
    return Promise.reject(
      new Error(
        "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in backend/.env, then restart the API."
      )
    );
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        if (!result?.secure_url) {
          reject(new Error("Cloudinary upload returned no URL"));
          return;
        }
        resolve(result.secure_url);
      }
    );
    stream.end(file.buffer);
  });
}
