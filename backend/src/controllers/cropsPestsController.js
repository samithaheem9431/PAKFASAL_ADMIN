import admin from "../firebaseAdmin.js";
import { FieldValue } from "firebase-admin/firestore";
import {
  validateBilingualCropsPest,
  normalizeBilingualCropsPest,
} from "../utils/validation.js";

const db = () => admin.firestore();

export async function listCropsPests(req, res) {
  try {
    const snap = await db().collection("crops_pests").get();
    const items = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => {
        const ta = a.updatedAt?.toMillis?.() ?? 0;
        const tb = b.updatedAt?.toMillis?.() ?? 0;
        return tb - ta;
      });
    res.json({ items });
  } catch (err) {
    console.error("listCropsPests", err);
    res.status(500).json({ error: "Failed to list records" });
  }
}

export async function createCropsPests(req, res) {
  try {
    const b = req.body;
    const errs = validateBilingualCropsPest(b);
    if (errs.length) {
      return res.status(400).json({ errors: errs });
    }
    const bi = normalizeBilingualCropsPest(b);
    const doc = {
      cropName: bi.cropName,
      diseaseName: bi.diseaseName,
      symptoms: bi.symptoms,
      treatment: bi.treatment,
      images: Array.isArray(b.images) ? b.images : [],
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };
    const ref = await db().collection("crops_pests").add(doc);
    const created = await ref.get();
    res.status(201).json({ id: ref.id, ...created.data() });
  } catch (err) {
    console.error("createCropsPests", err);
    res.status(500).json({ error: "Failed to create" });
  }
}

function legacyField(v, fallback = { en: "", ur: "" }) {
  if (v == null) return fallback;
  if (typeof v === "string") return { en: v.trim(), ur: "" };
  return {
    en: String(v.en ?? "").trim(),
    ur: String(v.ur ?? "").trim(),
  };
}

export async function updateCropsPests(req, res) {
  try {
    const { id } = req.params;
    const ref = db().collection("crops_pests").doc(id);
    const existing = await ref.get();
    if (!existing.exists) return res.status(404).json({ error: "Not found" });
    const b = req.body;
    const ex = existing.data();
    const prev = {
      cropName: legacyField(ex.cropName),
      diseaseName: legacyField(ex.diseaseName),
      symptoms: legacyField(ex.symptoms),
      treatment: legacyField(ex.treatment),
    };
    const merged = {
      cropName: {
        en: b.cropName?.en != null ? b.cropName.en : prev.cropName.en,
        ur: b.cropName?.ur != null ? b.cropName.ur : prev.cropName.ur,
      },
      diseaseName: {
        en: b.diseaseName?.en != null ? b.diseaseName.en : prev.diseaseName.en,
        ur: b.diseaseName?.ur != null ? b.diseaseName.ur : prev.diseaseName.ur,
      },
      symptoms: {
        en: b.symptoms?.en != null ? b.symptoms.en : prev.symptoms.en,
        ur: b.symptoms?.ur != null ? b.symptoms.ur : prev.symptoms.ur,
      },
      treatment: {
        en: b.treatment?.en != null ? b.treatment.en : prev.treatment.en,
        ur: b.treatment?.ur != null ? b.treatment.ur : prev.treatment.ur,
      },
    };
    const errs = validateBilingualCropsPest(merged);
    if (errs.length) {
      return res.status(400).json({ errors: errs });
    }
    const bi = normalizeBilingualCropsPest(merged);
    const patch = {
      cropName: bi.cropName,
      diseaseName: bi.diseaseName,
      symptoms: bi.symptoms,
      treatment: bi.treatment,
      images: Array.isArray(b.images) ? b.images : ex.images ?? [],
      updatedAt: FieldValue.serverTimestamp(),
    };
    await ref.update(patch);
    const updated = await ref.get();
    res.json({ id, ...updated.data() });
  } catch (err) {
    console.error("updateCropsPests", err);
    res.status(500).json({ error: "Failed to update" });
  }
}

export async function deleteCropsPests(req, res) {
  try {
    const { id } = req.params;
    const ref = db().collection("crops_pests").doc(id);
    const existing = await ref.get();
    if (!existing.exists) return res.status(404).json({ error: "Not found" });
    await ref.delete();
    res.json({ id, deleted: true });
  } catch (err) {
    console.error("deleteCropsPests", err);
    res.status(500).json({ error: "Failed to delete" });
  }
}
