import admin from "../firebaseAdmin.js";

const db = () => admin.firestore();

export async function listAdmins(_req, res) {
  try {
    const snap = await db().collection("admins").get();
    const items = await Promise.all(
      snap.docs.map(async (d) => {
        const data = d.data() || {};
        let authUser = null;
        try {
          authUser = await admin.auth().getUser(d.id);
        } catch {
          authUser = null;
        }
        return {
          uid: d.id,
          email: data.email || authUser?.email || "",
          role: data.role || "admin",
          disabled: !!authUser?.disabled,
        };
      })
    );
    items.sort((a, b) => a.email.localeCompare(b.email));
    res.json({ items });
  } catch (err) {
    console.error("listAdmins", err);
    res.status(500).json({ error: "Failed to list admins" });
  }
}

export async function createAdmin(req, res) {
  try {
    const { email, password, role } = req.body || {};
    const normalizedEmail = String(email || "").trim().toLowerCase();
    if (!normalizedEmail || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }
    if (String(password).length < 6) {
      return res
        .status(400)
        .json({ error: "password must be at least 6 characters" });
    }
    const adminRole =
      String(role || "").toLowerCase() === "super_admin"
        ? "super_admin"
        : "admin";

    const userRecord = await admin.auth().createUser({
      email: normalizedEmail,
      password: String(password),
      emailVerified: true,
      disabled: false,
    });
    await db().collection("admins").doc(userRecord.uid).set({
      email: normalizedEmail,
      role: adminRole,
    });
    res.status(201).json({
      uid: userRecord.uid,
      email: normalizedEmail,
      role: adminRole,
    });
  } catch (err) {
    console.error("createAdmin", err);
    if (err.code === "auth/email-already-exists") {
      return res.status(409).json({ error: "Email already exists" });
    }
    res.status(500).json({ error: "Failed to create admin" });
  }
}

export async function removeAdmin(req, res) {
  try {
    const { uid } = req.params;
    if (!uid) return res.status(400).json({ error: "uid is required" });
    if (uid === req.user.uid) {
      return res
        .status(400)
        .json({ error: "You cannot remove your own admin access" });
    }
    await db().collection("admins").doc(uid).delete();
    try {
      await admin.auth().deleteUser(uid);
    } catch {
      // If user is already missing from Auth, admin doc deletion is still done.
    }
    res.json({ uid, removed: true });
  } catch (err) {
    console.error("removeAdmin", err);
    res.status(500).json({ error: "Failed to remove admin" });
  }
}

