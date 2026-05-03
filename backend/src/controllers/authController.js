import {
  SESSION_COOKIE_NAME,
  clearSessionCookieOptions,
} from "../config/session.js";

export async function me(req, res) {
  res.json({
    uid: req.user.uid,
    email: req.user.email,
    admin: {
      email: req.admin?.email,
      role: req.admin?.role,
    },
  });
}

/** Current Firebase ID token session (claims + expiry). Requires admin auth. */
export async function session(req, res) {
  const u = req.user;
  const nowSec = Math.floor(Date.now() / 1000);
  const expSec = typeof u.exp === "number" ? u.exp : null;
  const expiresInSeconds =
    expSec != null ? Math.max(0, expSec - nowSec) : null;

  res.json({
    uid: u.uid,
    email: u.email ?? null,
    emailVerified: Boolean(u.email_verified),
    issuedAt: typeof u.iat === "number" ? new Date(u.iat * 1000).toISOString() : null,
    expiresAt:
      typeof u.exp === "number" ? new Date(u.exp * 1000).toISOString() : null,
    expiresInSeconds,
    authMethod: req.authMethod ?? null,
    admin: {
      email: req.admin?.email ?? null,
      role: req.admin?.role ?? null,
    },
  });
}

/** Bind server session cookie after Firebase + admin checks (call from client with Bearer). */
export function establishCookieSession(req, res) {
  req.session.regenerate((err) => {
    if (err) {
      console.error("establishCookieSession regenerate", err);
      return res.status(500).json({ error: "Could not create session" });
    }
    req.session.firebaseUid = req.user.uid;
    req.session.email = req.user.email ?? null;
    req.session.createdAt = Date.now();
    req.session.save((saveErr) => {
      if (saveErr) {
        console.error("establishCookieSession save", saveErr);
        return res.status(500).json({ error: "Could not save session" });
      }
      res.status(201).json({ ok: true });
    });
  });
}

/** Destroy HTTP-only session cookie (safe to call without auth). */
export function logoutCookie(req, res) {
  const done = () => {
    res.clearCookie(SESSION_COOKIE_NAME, clearSessionCookieOptions());
    res.json({ ok: true });
  };
  if (req.session) {
    req.session.destroy((err) => {
      if (err) console.error("logoutCookie destroy", err);
      done();
    });
  } else {
    done();
  }
}
