import admin from "../firebaseAdmin.js";
import { FieldValue } from "firebase-admin/firestore";

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
    if (!String(b.cropName || "").trim()) {
      return res.status(400).json({ errors: ["cropName is required"] });
    }
    const doc = {
      cropName: String(b.cropName).trim(),
      diseaseName: String(b.diseaseName ?? "").trim(),
      symptoms: String(b.symptoms ?? "").trim(),
      treatment: String(b.treatment ?? "").trim(),
      language: String(b.language ?? "en").trim() || "en",
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

export async function updateCropsPests(req, res) {
  try {
    const { id } = req.params;
    const ref = db().collection("crops_pests").doc(id);
    const existing = await ref.get();
    if (!existing.exists) return res.status(404).json({ error: "Not found" });
    const b = req.body;
    const patch = {
      cropName:
        b.cropName != null ? String(b.cropName).trim() : existing.data().cropName,
      diseaseName:
        b.diseaseName != null
          ? String(b.diseaseName).trim()
          : existing.data().diseaseName,
      symptoms:
        b.symptoms != null ? String(b.symptoms).trim() : existing.data().symptoms,
      treatment:
        b.treatment != null
          ? String(b.treatment).trim()
          : existing.data().treatment,
      language:
        b.language != null
          ? String(b.language).trim()
          : existing.data().language,
      images: Array.isArray(b.images) ? b.images : existing.data().images ?? [],
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
