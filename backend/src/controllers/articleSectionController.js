import admin from "../firebaseAdmin.js";
import {
  validateArticleSection,
  normalizeArticleSection,
} from "../utils/validation.js";

const db = () => admin.firestore();
const col = () => db().collection("learning_article_sections");

export async function listArticleSections(req, res) {
  try {
    const { articleId } = req.query;
    const snap = await col().get();
    let items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    if (articleId) {
      items = items.filter((x) => x.articleId === articleId);
    }
    items.sort((a, b) => {
      const c = String(a.articleId ?? "").localeCompare(String(b.articleId ?? ""));
      if (c !== 0) return c;
      return (a.order ?? 0) - (b.order ?? 0);
    });
    res.json({ items });
  } catch (err) {
    console.error("listArticleSections", err);
    res.status(500).json({ error: "Failed to list article sections" });
  }
}

export async function createArticleSection(req, res) {
  try {
    const errs = validateArticleSection(req.body || {});
    if (errs.length) return res.status(400).json({ errors: errs });
    const doc = normalizeArticleSection(req.body || {});
    const ref = await col().add(doc);
    res.status(201).json({ id: ref.id, ...doc });
  } catch (err) {
    console.error("createArticleSection", err);
    res.status(500).json({ error: "Failed to create article section" });
  }
}

export async function updateArticleSection(req, res) {
  try {
    const { id } = req.params;
    const ref = col().doc(id);
    const existing = await ref.get();
    if (!existing.exists) {
      return res.status(404).json({ error: "Section not found" });
    }
    const errs = validateArticleSection(req.body || {});
    if (errs.length) return res.status(400).json({ errors: errs });
    const doc = normalizeArticleSection(req.body || {});
    await ref.update(doc);
    res.json({ id, ...doc });
  } catch (err) {
    console.error("updateArticleSection", err);
    res.status(500).json({ error: "Failed to update article section" });
  }
}

export async function deleteArticleSection(req, res) {
  try {
    const { id } = req.params;
    const ref = col().doc(id);
    const existing = await ref.get();
    if (!existing.exists) {
      return res.status(404).json({ error: "Section not found" });
    }
    await ref.delete();
    res.json({ id, deleted: true });
  } catch (err) {
    console.error("deleteArticleSection", err);
    res.status(500).json({ error: "Failed to delete article section" });
  }
}
