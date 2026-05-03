import admin from "firebase-admin";
import { readFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join, isAbsolute, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadCredentialFromServiceAccountFileOrJson() {
  const pathEnv = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  const keyJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  const backendRoot = join(__dirname, "..");

  if (pathEnv) {
    const resolved = isAbsolute(pathEnv)
      ? pathEnv
      : resolve(backendRoot, pathEnv);
    if (!existsSync(resolved)) {
      throw new Error(`FIREBASE_SERVICE_ACCOUNT_PATH file not found: ${resolved}`);
    }
    return JSON.parse(readFileSync(resolved, "utf8"));
  }

  if (keyJson) {
    try {
      return JSON.parse(keyJson);
    } catch {
      const legacyPath = isAbsolute(keyJson)
        ? keyJson
        : resolve(backendRoot, keyJson);
      if (existsSync(legacyPath)) {
        return JSON.parse(readFileSync(legacyPath, "utf8"));
      }
      throw new Error(
        "FIREBASE_SERVICE_ACCOUNT_KEY must be valid JSON or a path to a JSON file"
      );
    }
  }

  return null;
}

function loadCredentialFromSeparateEnv() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    return null;
  }

  return {
    projectId,
    clientEmail,
    privateKey: privateKey.replace(/\\n/g, "\n"),
  };
}

if (!admin.apps.length) {
  let credentialJson =
    loadCredentialFromServiceAccountFileOrJson() ||
    loadCredentialFromSeparateEnv();

  if (!credentialJson) {
    throw new Error(
      "Firebase Admin credentials missing. Use ONE of:\n" +
        "  • FIREBASE_SERVICE_ACCOUNT_PATH=path/to/serviceAccount.json (recommended)\n" +
        "  • FIREBASE_SERVICE_ACCOUNT_KEY=<full JSON string or relative path>\n" +
        "  • FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY"
    );
  }

  admin.initializeApp({
    credential: admin.credential.cert(credentialJson),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || undefined,
  });
}

export default admin;
