import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import {
  cloudinary,
  configureCloudinary,
  isCloudinaryConfigured,
} from "../config/cloudinary.js";

const ALLOWED = /^image\/(jpeg|png|gif|webp)$/i;

function extFor(mimetype) {
  if (/jpeg/i.test(mimetype)) return ".jpg";
  if (/png/i.test(mimetype)) return ".png";
  if (/gif/i.test(mimetype)) return ".gif";
  if (/webp/i.test(mimetype)) return ".webp";
  return ".bin";
}

/**
 * Prefer Cloudinary; if not configured, save to local uploads/ (Render ephemeral but works).
 * @returns {Promise<{ url: string, host: string }>}
 */
export async function uploadImageBuffer(file, req) {
  if (!file?.buffer) {
    throw new Error("No file");
  }
  const mimetype = file.mimetype || "application/octet-stream";
  if (!ALLOWED.test(mimetype)) {
    throw new Error("Only JPEG, PNG, GIF, WebP allowed");
  }

  if (isCloudinaryConfigured() && configureCloudinary()) {
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
    return { url: result.secure_url, host: "cloudinary" };
  }

  // Fallback: disk (same pattern as older disease uploads)
  const dir = path.join(process.cwd(), "uploads");
  fs.mkdirSync(dir, { recursive: true });
  const name = `${randomUUID()}${extFor(mimetype)}`;
  fs.writeFileSync(path.join(dir, name), file.buffer);

  const envBase = process.env.PUBLIC_API_URL?.replace(/\/$/, "");
  const proto = req?.headers?.["x-forwarded-proto"] || req?.protocol || "https";
  const host = req?.get?.("host");
  const base = envBase || (host ? `${proto}://${host}` : "");
  if (!base) {
    throw new Error(
      "Cloudinary is not configured and PUBLIC_API_URL is missing. Set Cloudinary env vars on Render."
    );
  }
  return { url: `${base}/uploads/${name}`, host: "disk" };
}

/** @deprecated use uploadImageBuffer — kept for older imports */
export async function uploadBufferToCloudinary(file) {
  const { url } = await uploadImageBuffer(file, null);
  return url;
}
