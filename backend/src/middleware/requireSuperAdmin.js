export function requireSuperAdmin(req, res, next) {
  const role = String(req.admin?.role || "").toLowerCase();
  if (role !== "super_admin") {
    return res
      .status(403)
      .json({ error: "Super admin access required for this action" });
  }
  return next();
}

