import admin from "../firebaseAdmin.js";

export async function checkAdminRole(req, res, next) {
  if (!req.user?.uid) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const snap = await admin
      .firestore()
      .collection("admins")
      .doc(req.user.uid)
      .get();
    if (!snap.exists) {
      return res.status(403).json({ error: "Admin access required" });
    }
    req.admin = { uid: req.user.uid, ...snap.data() };
    next();
  } catch (err) {
    console.error("checkAdminRole", err);
    return res.status(500).json({ error: "Failed to verify admin" });
  }
}
