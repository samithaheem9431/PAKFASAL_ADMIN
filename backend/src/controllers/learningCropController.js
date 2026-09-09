import admin from "../firebaseAdmin.js";
import {
  validateCropSlug,
  validateLearningCrop,
  normalizeLearningCrop,
} from "../utils/validation.js";
import { uploadBufferToCloudinary } from "../utils/cloudinaryUpload.js";

const db = () => admin.firestore();
const col = () => db().collection("learning_crops");

/** multipart fields arrive as strings — coerce before validate/normalize */
function coerceCropBody(raw = {}) {
  const order = Number(raw.order);
  let showInPests = raw.showInPests;
  if (typeof showInPests === "string") {
    showInPests = showInPests === "true" || showInPests === "1";
  }
  return {
    ...raw,
    order,
    showInPests: Boolean(showInPests),
    imageUrl: String(raw.imageUrl ?? "").trim(),
  };
}

async function resolveImageUrl(body, file) {
  if (file) {
    return uploadBufferToCloudinary(file);
  }
  return String(body.imageUrl ?? "").trim();
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

    let imageUrl = "";
    try {
      imageUrl = await resolveImageUrl(body, req.file);
    } catch (upErr) {
      return res.status(400).json({ errors: [upErr.message || "Upload failed"] });
    }

    const doc = {
      ...normalizeLearningCrop(body),
      imageUrl,
    };
    await ref.set(doc);
    console.log("createLearningCrop saved", slug, "imageUrl=", imageUrl || "(empty)");
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

    let imageUrl = "";
    try {
      imageUrl = await resolveImageUrl(body, req.file);
    } catch (upErr) {
      return res.status(400).json({ errors: [upErr.message || "Upload failed"] });
    }

    // No new file and no imageUrl field in body → keep existing URL
    if (!req.file && !Object.prototype.hasOwnProperty.call(req.body || {}, "imageUrl")) {
      imageUrl = String(existing.data()?.imageUrl ?? "").trim();
    }

    const doc = {
      ...normalizeLearningCrop(body),
      imageUrl,
    };
    await ref.set(doc, { merge: true });
    console.log("updateLearningCrop saved", id, "imageUrl=", imageUrl || "(empty)");
    res.json({ id, ...doc });
  } catch (err) {
    console.error("updateLearningCrop", err);
    res.status(500).json({ error: "Failed to update crop" });
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
