import admin from "../firebaseAdmin.js";
import {
  coerceGovtScheme,
  validateGovtScheme,
  normalizeGovtScheme,
} from "../utils/validation.js";

const db = () => admin.firestore();
const col = () => db().collection("govt_schemes");

export async function listGovtSchemes(req, res) {
  try {
    const snap = await col().get();
    const items = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    res.json({ items });
  } catch (err) {
    console.error("listGovtSchemes", err);
    res.status(500).json({ error: "Failed to list government schemes" });
  }
}

export async function createGovtScheme(req, res) {
  try {
    const body = coerceGovtScheme(req.body || {});
    const errs = validateGovtScheme(body);
    if (errs.length) return res.status(400).json({ errors: errs });
    const doc = normalizeGovtScheme(body);
    const ref = await col().add(doc);
    res.status(201).json({ id: ref.id, ...doc });
  } catch (err) {
    console.error("createGovtScheme", err);
    res.status(500).json({ error: "Failed to create government scheme" });
  }
}

export async function updateGovtScheme(req, res) {
  try {
    const { id } = req.params;
    const ref = col().doc(id);
    const existing = await ref.get();
    if (!existing.exists) {
      return res.status(404).json({ error: "Government scheme not found" });
    }
    const body = coerceGovtScheme(req.body || {});
    const errs = validateGovtScheme(body);
    if (errs.length) return res.status(400).json({ errors: errs });
    const doc = normalizeGovtScheme(body);
    await ref.update(doc);
    res.json({ id, ...doc });
  } catch (err) {
    console.error("updateGovtScheme", err);
    res.status(500).json({ error: "Failed to update government scheme" });
  }
}

export async function deleteGovtScheme(req, res) {
  try {
    const { id } = req.params;
    const ref = col().doc(id);
    const existing = await ref.get();
    if (!existing.exists) {
      return res.status(404).json({ error: "Government scheme not found" });
    }
    await ref.delete();
    res.json({ id, deleted: true });
  } catch (err) {
    console.error("deleteGovtScheme", err);
    res.status(500).json({ error: "Failed to delete government scheme" });
  }
}
