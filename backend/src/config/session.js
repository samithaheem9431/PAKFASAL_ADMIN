import session from "express-session";

export const SESSION_COOKIE_NAME =
  process.env.SESSION_COOKIE_NAME || "pakfasal.sid";

/**
 * Options used when clearing the cookie (must match session cookie attributes).
 */
export function clearSessionCookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  const o = {
    path: "/",
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
  };
  if (process.env.SESSION_DOMAIN) {
    o.domain = process.env.SESSION_DOMAIN;
  }
  return o;
}

function cookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  const o = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: Number(process.env.SESSION_MAX_AGE_MS || 7 * 24 * 60 * 60 * 1000),
    path: "/",
  };
  if (process.env.SESSION_DOMAIN) {
    o.domain = process.env.SESSION_DOMAIN;
  }
  return o;
}

export function createSessionMiddleware() {
  const isProd = process.env.NODE_ENV === "production";
  const secret = process.env.SESSION_SECRET;
  if (isProd && (!secret || secret.length < 32)) {
    throw new Error(
      "SESSION_SECRET must be set to at least 32 characters in production"
    );
  }

  return session({
    name: SESSION_COOKIE_NAME,
    secret: secret || "dev-only-min-32-chars-secret-key-change-me!!",
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: cookieOptions(),
  });
}
