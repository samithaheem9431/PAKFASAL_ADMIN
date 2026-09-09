import admin from "../firebaseAdmin.js";
import {
  validateCropSlug,
  validateLearningCrop,
  normalizeLearningCrop,
} from "../utils/validation.js";

const db = () => admin.firestore();
const col = () => db().collection("learning_crops");

/** Coerce JSON fields before validate/normalize */
function coerceCropBody(raw = {}) {
  let showInPests = raw.showInPests;
  if (typeof showInPests === "string") {
    showInPests = showInPests === "true" || showInPests === "1";
  }
  return {
    ...raw,
    order: Number(raw.order),
    showInPests: Boolean(showInPests),
    imageUrl: String(raw.imageUrl ?? "").trim(),
  };
}

/** Always persist imageUrl — merge alone has dropped it on older quirks. */
async function writeCropDoc(ref, doc) {
  const imageUrl = String(doc.imageUrl ?? "").trim();
  await ref.set({ ...doc, imageUrl }, { merge: true });
  await ref.update({ imageUrl });
  return { ...doc, imageUrl };
}

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
    const body = coerceCropBody(req.body || {});
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

    const doc = await writeCropDoc(ref, normalizeLearningCrop(body));
    console.log("createLearningCrop saved", slug, "imageUrl=", doc.imageUrl || "(empty)");
    res.status(201).json({ id: slug, ...doc });
  } catch (err) {
    console.error("createLearningCrop", err);
    res.status(500).json({ error: "Failed to create crop" });
  }
}

export async function updateLearningCrop(req, res) {
  try {
    const { id } = req.params;
    const body = coerceCropBody(req.body || {});
    const errs = validateLearningCrop(body);
    if (errs.length) return res.status(400).json({ errors: errs });

    const ref = col().doc(id);
    const existing = await ref.get();
    if (!existing.exists) {
      return res.status(404).json({ error: "Crop not found" });
    }

    const doc = normalizeLearningCrop(body);

    // No imageUrl in request → keep existing URL
    if (!Object.prototype.hasOwnProperty.call(req.body || {}, "imageUrl")) {
      doc.imageUrl = String(existing.data()?.imageUrl ?? "").trim();
    }

    const saved = await writeCropDoc(ref, doc);
    console.log("updateLearningCrop saved", id, "imageUrl=", saved.imageUrl || "(empty)");
    res.json({ id, ...saved });
  } catch (err) {
    console.error("updateLearningCrop", err);
    res.status(500).json({ error: "Failed to update crop" });
  }
}

/** Image-only write — used right after Cloudinary upload so URL is not lost. */
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
    await ref.update({ imageUrl });
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
