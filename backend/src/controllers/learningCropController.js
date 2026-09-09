import admin from "../firebaseAdmin.js";
import {
  validateCropSlug,
  validateLearningCrop,
  normalizeLearningCrop,
} from "../utils/validation.js";

const db = () => admin.firestore();
const col = () => db().collection("learning_crops");

export async function listLearningCrops(req, res) {
  try {
    const snap = await col().get();
    const items = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    res.json({ items });
  } catch (err) {
    console.error("listLearningCrops", err);
    res.status(500).json({ error: "Failed to list crops" });
  }
}

export async function createLearningCrop(req, res) {
  try {
    const body = req.body || {};
    const slug = String(body.id ?? "").trim().toLowerCase();
    const slugErr = validateCropSlug(slug);
    if (slugErr) return res.status(400).json({ errors: [slugErr] });

    const errs = validateLearningCrop(body);
    if (errs.length) return res.status(400).json({ errors: errs });

    const ref = col().doc(slug);
    const existing = await ref.get();
    if (existing.exists) {
      return res
        .status(409)
        .json({ errors: ["A crop with this ID already exists"] });
    }

    const doc = normalizeLearningCrop(body);
    // Always persist imageUrl explicitly
    doc.imageUrl = String(body.imageUrl ?? "").trim();
    await ref.set(doc);
    console.log("createLearningCrop", slug, "imageUrl=", doc.imageUrl || "(empty)");
    res.status(201).json({ id: slug, ...doc });
  } catch (err) {
    console.error("createLearningCrop", err);
    res.status(500).json({ error: "Failed to create crop" });
  }
}

export async function updateLearningCrop(req, res) {
  try {
    const { id } = req.params;
    const body = req.body || {};
    const errs = validateLearningCrop(body);
    if (errs.length) return res.status(400).json({ errors: errs });

    const ref = col().doc(id);
    const existing = await ref.get();
    if (!existing.exists) {
      return res.status(404).json({ error: "Crop not found" });
    }

    const doc = normalizeLearningCrop(body);
    doc.imageUrl = String(body.imageUrl ?? "").trim();
    await ref.set(doc, { merge: true });
    // Second write so imageUrl cannot be dropped by older deploy quirks
    await ref.update({ imageUrl: doc.imageUrl });
    console.log("updateLearningCrop", id, "imageUrl=", doc.imageUrl || "(empty)");
    res.json({ id, ...doc });
  } catch (err) {
    console.error("updateLearningCrop", err);
    res.status(500).json({ error: "Failed to update crop" });
  }
}

/** Dedicated image-only update — minimal payload, always writes imageUrl */
export async function updateLearningCropImage(req, res) {
  try {
    const { id } = req.params;
    const imageUrl = String(req.body?.imageUrl ?? "").trim();
    if (!imageUrl) {
      return res.status(400).json({ error: "imageUrl is required" });
    }
    const ref = col().doc(id);
    const existing = await ref.get();
    if (!existing.exists) {
      return res.status(404).json({ error: "Crop not found" });
    }
    await ref.set({ imageUrl }, { merge: true });
    console.log("updateLearningCropImage", id, imageUrl);
    res.json({ id, imageUrl });
  } catch (err) {
    console.error("updateLearningCropImage", err);
    res.status(500).json({ error: "Failed to save image URL" });
  }
}

export async function deleteLearningCrop(req, res) {
  try {
    const { id } = req.params;
    const ref = col().doc(id);
    const existing = await ref.get();
    if (!existing.exists) {
      return res.status(404).json({ error: "Crop not found" });
    }
    await ref.delete();
    res.json({ id, deleted: true });
  } catch (err) {
    console.error("deleteLearningCrop", err);
    res.status(500).json({ error: "Failed to delete crop" });
  }
}
