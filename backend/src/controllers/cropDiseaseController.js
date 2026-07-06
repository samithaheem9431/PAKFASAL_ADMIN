import admin from "../firebaseAdmin.js";
import {
  validateCropDisease,
  normalizeCropDisease,
} from "../utils/validation.js";

const db = () => admin.firestore();
const col = () => db().collection("learning_crop_diseases");

export async function listCropDiseases(req, res) {
  try {
    const { cropId } = req.query;
    const snap = await col().get();
    let items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    if (cropId) {
      items = items.filter((x) => x.cropId === cropId);
    }
    items.sort((a, b) => {
      const c = String(a.cropId ?? "").localeCompare(String(b.cropId ?? ""));
      if (c !== 0) return c;
      return (a.order ?? 0) - (b.order ?? 0);
    });
    res.json({ items });
  } catch (err) {
    console.error("listCropDiseases", err);
    res.status(500).json({ error: "Failed to list crop diseases" });
  }
}

export async function createCropDisease(req, res) {
  try {
    const errs = validateCropDisease(req.body || {});
    if (errs.length) return res.status(400).json({ errors: errs });
    const doc = normalizeCropDisease(req.body || {});
    const ref = await col().add(doc);
    res.status(201).json({ id: ref.id, ...doc });
  } catch (err) {
    console.error("createCropDisease", err);
    res.status(500).json({ error: "Failed to create crop disease" });
  }
}

export async function updateCropDisease(req, res) {
  try {
    const { id } = req.params;
    const ref = col().doc(id);
    const existing = await ref.get();
    if (!existing.exists) {
      return res.status(404).json({ error: "Crop disease not found" });
    }
    const errs = validateCropDisease(req.body || {});
    if (errs.length) return res.status(400).json({ errors: errs });
    const doc = normalizeCropDisease(req.body || {});
    await ref.update(doc);
    res.json({ id, ...doc });
  } catch (err) {
    console.error("updateCropDisease", err);
    res.status(500).json({ error: "Failed to update crop disease" });
  }
}

export async function deleteCropDisease(req, res) {
  try {
    const { id } = req.params;
    const ref = col().doc(id);
    const existing = await ref.get();
    if (!existing.exists) {
      return res.status(404).json({ error: "Crop disease not found" });
    }
    await ref.delete();
    res.json({ id, deleted: true });
  } catch (err) {
    console.error("deleteCropDisease", err);
    res.status(500).json({ error: "Failed to delete crop disease" });
  }
}
