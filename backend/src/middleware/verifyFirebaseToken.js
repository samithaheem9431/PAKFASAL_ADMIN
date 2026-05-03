import admin from "../firebaseAdmin.js";

/**
 * Accepts a valid Firebase Bearer token, or a previously issued HTTP-only session cookie.
 * Bearer is tried first; invalid/expired Bearer falls through to cookie (graceful refresh UX).
 */
export async function verifyFirebaseToken(req, res, next) {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    try {
      const decoded = await admin.auth().verifyIdToken(header.slice(7));
      req.user = decoded;
      req.authMethod = "bearer";
      return next();
    } catch {
      // Continue to session cookie (e.g. ID token expired but session still valid)
    }
  }

  if (req.session?.firebaseUid) {
    req.user = {
      uid: req.session.firebaseUid,
      email: req.session.email || undefined,
    };
    req.authMethod = "cookie";
    return next();
  }

  return res.status(401).json({ error: "Authentication required" });
}
