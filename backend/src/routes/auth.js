import { Router } from "express";
import {
  me,
  session,
  establishCookieSession,
  logoutCookie,
} from "../controllers/authController.js";
import { adminAuth } from "../middleware/adminAuth.js";
import { verifyFirebaseBearer } from "../middleware/verifyFirebaseBearer.js";
import { checkAdminRole } from "../middleware/checkAdminRole.js";

const r = Router();

/** Mint HTTP-only session cookie (requires valid Bearer ID token + admin). */
r.post(
  "/cookie",
  verifyFirebaseBearer,
  checkAdminRole,
  establishCookieSession
);

/** Clear server session + cookie (call before client Firebase signOut). */
r.post("/logout", logoutCookie);

r.get("/me", ...adminAuth, me);
r.get("/session", ...adminAuth, session);

export default r;
