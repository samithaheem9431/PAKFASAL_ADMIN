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
