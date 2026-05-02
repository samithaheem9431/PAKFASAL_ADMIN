import admin from "firebase-admin";
import { readFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join, isAbsolute, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

if (!admin.apps.length) {
  const keyJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  const keyPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  const defaultBase = join(__dirname, "..");
  let credential;

  if (keyPath) {
    const resolved = isAbsolute(keyPath) ? keyPath : resolve(defaultBase, keyPath);
    if (!existsSync(resolved)) {
      throw new Error(
        `FIREBASE_SERVICE_ACCOUNT_PATH does not exist: ${resolved}`
      );
    }
    credential = admin.credential.cert(JSON.parse(readFileSync(resolved, "utf8")));
  } else if (keyJson) {
    try {
      credential = admin.credential.cert(JSON.parse(keyJson));
    } catch {
      const legacyPath = isAbsolute(keyJson)
        ? keyJson
        : resolve(defaultBase, keyJson);
      if (existsSync(legacyPath)) {
        credential = admin.credential.cert(
          JSON.parse(readFileSync(legacyPath, "utf8"))
        );
      } else {
        throw new Error(
          "Invalid FIREBASE_SERVICE_ACCOUNT_KEY: provide JSON string or valid path to JSON file"
        );
      }
    }
  } else {
    throw new Error(
      "Set FIREBASE_SERVICE_ACCOUNT_PATH (recommended) or FIREBASE_SERVICE_ACCOUNT_KEY (JSON string/path)"
    );
  }
  if (!credential) {
      throw new Error(
        "Could not create Firebase Admin credential from provided service account"
      );
  }
  admin.initializeApp({
    credential,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || undefined,
  });
}

export default admin;
