import admin from "../firebaseAdmin.js";
import {
  validateLearningArticle,
  normalizeLearningArticle,
} from "../utils/validation.js";

const db = () => admin.firestore();
const col = () => db().collection("learning_articles");
const sectionsCol = () => db().collection("learning_article_sections");

export async function listLearningArticles(req, res) {
  try {
    const snap = await col().get();
    const items = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    res.json({ items });
  } catch (err) {
    console.error("listLearningArticles", err);
    res.status(500).json({ error: "Failed to list articles" });
  }
}

export async function createLearningArticle(req, res) {
  try {
    const errs = validateLearningArticle(req.body || {});
    if (errs.length) return res.status(400).json({ errors: errs });
    const doc = normalizeLearningArticle(req.body || {});
    const ref = await col().add(doc);
    res.status(201).json({ id: ref.id, ...doc });
  } catch (err) {
    console.error("createLearningArticle", err);
    res.status(500).json({ error: "Failed to create article" });
  }
}

export async function updateLearningArticle(req, res) {
  try {
    const { id } = req.params;
    const ref = col().doc(id);
    const existing = await ref.get();
    if (!existing.exists) {
      return res.status(404).json({ error: "Article not found" });
    }
    const errs = validateLearningArticle(req.body || {});
    if (errs.length) return res.status(400).json({ errors: errs });
    const doc = normalizeLearningArticle(req.body || {});
    await ref.update(doc);
    res.json({ id, ...doc });
  } catch (err) {
    console.error("updateLearningArticle", err);
    res.status(500).json({ error: "Failed to update article" });
  }
}

export async function deleteLearningArticle(req, res) {
  try {
    const { id } = req.params;
    const ref = col().doc(id);
    const existing = await ref.get();
    if (!existing.exists) {
      return res.status(404).json({ error: "Article not found" });
    }

    // Cascade-delete sections so the app never sees orphaned rows with a
    // dangling articleId.
    const sectionsSnap = await sectionsCol()
      .where("articleId", "==", id)
      .get();
    const batch = db().batch();
    sectionsSnap.docs.forEach((d) => batch.delete(d.ref));
    batch.delete(ref);
    await batch.commit();

    res.json({ id, deleted: true });
  } catch (err) {
    console.error("deleteLearningArticle", err);
    res.status(500).json({ error: "Failed to delete article" });
  }
}
