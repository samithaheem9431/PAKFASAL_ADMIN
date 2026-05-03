import admin from "../firebaseAdmin.js";
import { FieldValue } from "firebase-admin/firestore";
import {
  validateCultivationSteps,
  normalizeCultivationStep,
  validateBilingualCropName,
  normalizeBilingualCropName,
} from "../utils/validation.js";

const db = () => admin.firestore();

function stagesCol(cropId) {
  return db().collection("crops").doc(cropId).collection("cultivation_stages");
}

export async function listCultivationStages(req, res) {
  try {
    const { cropId } = req.params;
    const crop = await db().collection("crops").doc(cropId).get();
    if (!crop.exists) {
      return res.status(404).json({ error: "Crop not found" });
    }
    const snap = await stagesCol(cropId).get();
    let items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    res.json({ items, cropId });
  } catch (err) {
    console.error("listCultivationStages", err);
    res.status(500).json({ error: "Failed to list stages" });
  }
}

export async function createCultivationStage(req, res) {
  try {
    const { cropId } = req.params;
    const cropRef = db().collection("crops").doc(cropId);
    const crop = await cropRef.get();
    if (!crop.exists) {
      return res.status(404).json({ error: "Crop not found" });
    }
    const b = req.body;
    const steps = Array.isArray(b.steps) ? b.steps : [];
    const stepErrs = validateCultivationSteps(steps);
    if (stepErrs.length) {
      return res.status(400).json({ errors: stepErrs });
    }
    const normalized = steps.map((s, i) => normalizeCultivationStep(s, i));
    const doc = {
      steps: normalized,
      updatedAt: FieldValue.serverTimestamp(),
    };
    const ref = await stagesCol(cropId).add({
      ...doc,
      createdAt: FieldValue.serverTimestamp(),
    });
    const created = await ref.get();
    res.status(201).json({ id: ref.id, cropId, ...created.data() });
  } catch (err) {
    console.error("createCultivationStage", err);
    res.status(500).json({ error: "Failed to create stage document" });
  }
}

export async function updateCultivationStage(req, res) {
  try {
    const { cropId, stageId } = req.params;
    const ref = stagesCol(cropId).doc(stageId);
    const existing = await ref.get();
    if (!existing.exists) return res.status(404).json({ error: "Not found" });
    const b = req.body;
    const ex = existing.data();
    let steps = ex.steps;
    if (Array.isArray(b.steps)) {
      const stepErrs = validateCultivationSteps(b.steps);
      if (stepErrs.length) {
        return res.status(400).json({ errors: stepErrs });
      }
      steps = b.steps.map((s, i) => normalizeCultivationStep(s, i));
    }
    await ref.update({
      steps,
      updatedAt: FieldValue.serverTimestamp(),
    });
    const updated = await ref.get();
    res.json({ id: stageId, cropId, ...updated.data() });
  } catch (err) {
    console.error("updateCultivationStage", err);
    res.status(500).json({ error: "Failed to update" });
  }
}

export async function deleteCultivationStage(req, res) {
  try {
    const { cropId, stageId } = req.params;
    const ref = stagesCol(cropId).doc(stageId);
    const existing = await ref.get();
    if (!existing.exists) return res.status(404).json({ error: "Not found" });
    await ref.delete();
    res.json({ id: stageId, cropId, deleted: true });
  } catch (err) {
    console.error("deleteCultivationStage", err);
    res.status(500).json({ error: "Failed to delete" });
  }
}

/** List crop IDs for dropdown — documents under `crops` collection */
export async function listCropDocs(req, res) {
  try {
    const snap = await db().collection("crops").get();
    const items = snap.docs.map((d) => {
      const data = d.data();
      return {
        ...data,
        id: d.id,
        name: data.name ?? data.title ?? d.id,
      };
    });
    res.json({ items });
  } catch (err) {
    console.error("listCropDocs", err);
    res.status(500).json({ error: "Failed to list crops" });
  }
}

export async function ensureCropDoc(req, res) {
  try {
    const errs = validateBilingualCropName(req.body || {});
    if (errs.length) {
      return res.status(400).json({ errors: errs });
    }
    const name = normalizeBilingualCropName(req.body || {});
    const ref = await db().collection("crops").add({
      name,
      createdAt: FieldValue.serverTimestamp(),
    });
    res.status(201).json({ id: ref.id, name });
  } catch (err) {
    console.error("ensureCropDoc", err);
    res.status(500).json({ error: "Failed to create crop" });
  }
}
