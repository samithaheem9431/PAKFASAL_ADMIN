import { randomUUID } from "crypto";
import admin from "../firebaseAdmin.js";

const ALLOWED = /^image\/(jpeg|png|gif|webp)$/i;

function extFromMime(mimetype) {
  if (/png/i.test(mimetype)) return "png";
  if (/gif/i.test(mimetype)) return "gif";
  if (/webp/i.test(mimetype)) return "webp";
  return "jpg";
}

/** True when Admin SDK has a storage bucket name configured. */
export function isStorageConfigured() {
  try {
    return Boolean(admin.storage().bucket()?.name);
  } catch {
    return false;
  }
}

/**
 * Upload a multer memory file to Firebase Storage.
 * Returns a durable download URL (token-based) — Firestore should store only this URL.
 * @returns {Promise<string>}
 */
export async function uploadBufferToFirebaseStorage(
  file,
  folder = "admin-uploads"
) {
  if (!file?.buffer) {
    throw new Error("No file");
  }
  const mimetype = file.mimetype || "application/octet-stream";
  if (!ALLOWED.test(mimetype)) {
    throw new Error("Only JPEG, PNG, GIF, WebP allowed");
  }

  const bucket = admin.storage().bucket();
  if (!bucket?.name) {
    throw new Error(
      "Firebase Storage is not configured. Set FIREBASE_STORAGE_BUCKET (e.g. your-project.firebasestorage.app), enable Storage in Firebase Console, then restart the API."
    );
  }

  const objectPath = `${folder}/${Date.now()}-${randomUUID().slice(0, 8)}.${extFromMime(mimetype)}`;
  const token = randomUUID();
  const storageFile = bucket.file(objectPath);

  await storageFile.save(file.buffer, {
    resumable: false,
    metadata: {
      contentType: mimetype,
      cacheControl: "public, max-age=31536000",
      metadata: {
        firebaseStorageDownloadTokens: token,
      },
    },
  });

  const encoded = encodeURIComponent(objectPath);
  return `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encoded}?alt=media&token=${token}`;
}
