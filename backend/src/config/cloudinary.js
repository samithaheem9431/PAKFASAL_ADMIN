import { v2 as cloudinary } from "cloudinary";

/** Read env at call time so host env / dotenv is always picked up */
export function isCloudinaryConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME?.trim() &&
      process.env.CLOUDINARY_API_KEY?.trim() &&
      process.env.CLOUDINARY_API_SECRET?.trim()
  );
}

export function configureCloudinary() {
  if (!isCloudinaryConfigured()) return false;
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME.trim(),
    api_key: process.env.CLOUDINARY_API_KEY.trim(),
    api_secret: process.env.CLOUDINARY_API_SECRET.trim(),
    secure: true,
  });
  return true;
}

export { cloudinary };
