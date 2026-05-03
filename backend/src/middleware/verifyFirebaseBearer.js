import admin from "../firebaseAdmin.js";

/** Strict Bearer-only verification (for issuing HTTP-only session cookies). */
export async function verifyFirebaseBearer(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Bearer token required" });
  }
  try {
    const decoded = await admin.auth().verifyIdToken(header.slice(7));
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
