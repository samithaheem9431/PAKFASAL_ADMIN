import admin from "../firebaseAdmin.js";
import { FieldValue } from "firebase-admin/firestore";
import {
  validateBilingualArticle,
  normalizeBilingualArticle,
} from "../utils/validation.js";

const db = () => admin.firestore();

function slugify(s) {
  return String(s || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export async function listArticles(req, res) {
  try {
    const { status } = req.query;
    let ref = db().collection("learning_articles");
    const snap = await ref.get();
    let items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    if (status) {
      items = items.filter((a) => a.status === status);
    }
    items.sort((a, b) => {
      const ta = a.updatedAt?.toMillis?.() ?? 0;
      const tb = b.updatedAt?.toMillis?.() ?? 0;
      return tb - ta;
    });
    res.json({ items });
  } catch (err) {
    console.error("listArticles", err);
    res.status(500).json({ error: "Failed to list articles" });
  }
}

export async function createArticle(req, res) {
  try {
    const b = req.body;
    const errs = validateBilingualArticle(b);
    if (errs.length) {
      return res.status(400).json({ errors: errs });
    }
    const bi = normalizeBilingualArticle(b);
    let slug = slugify(b.slug || bi.title.en || bi.title.ur);
    if (!slug) slug = `article-${Date.now()}`;
    const doc = {
      title: bi.title,
      slug,
      content: bi.content,
      coverImage: String(b.coverImage ?? "").trim(),
      tags: Array.isArray(b.tags) ? b.tags.map(String) : [],
      status: b.status === "published" ? "published" : "draft",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };
    const ref = await db().collection("learning_articles").add(doc);
    const created = await ref.get();
    res.status(201).json({ id: ref.id, ...created.data() });
  } catch (err) {
    console.error("createArticle", err);
    res.status(500).json({ error: "Failed to create article" });
  }
}

export async function updateArticle(req, res) {
  try {
    const { id } = req.params;
    const ref = db().collection("learning_articles").doc(id);
    const existing = await ref.get();
    if (!existing.exists) return res.status(404).json({ error: "Not found" });
    const b = req.body;
    const ex = existing.data();
    const prevTitle =
      typeof ex.title === "string"
        ? { en: ex.title, ur: "" }
        : { en: ex.title?.en ?? "", ur: ex.title?.ur ?? "" };
    const prevContent =
      typeof ex.content === "string"
        ? { en: ex.content, ur: "" }
        : { en: ex.content?.en ?? "", ur: ex.content?.ur ?? "" };

    const mergedForValidate = {
      title: {
        en: b.title?.en != null ? b.title.en : prevTitle.en,
        ur: b.title?.ur != null ? b.title.ur : prevTitle.ur,
      },
      content: {
        en: b.content?.en != null ? b.content.en : prevContent.en,
        ur: b.content?.ur != null ? b.content.ur : prevContent.ur,
      },
    };
    const errs = validateBilingualArticle(mergedForValidate);
    if (errs.length) {
      return res.status(400).json({ errors: errs });
    }

    const bi = normalizeBilingualArticle(mergedForValidate);
    const slug =
      b.slug != null
        ? slugify(b.slug) || ex.slug
        : b.title != null
          ? slugify(bi.title.en || bi.title.ur) || ex.slug
          : ex.slug;
    const patch = {
      title: bi.title,
      slug,
      content: bi.content,
      coverImage:
        b.coverImage != null ? String(b.coverImage).trim() : ex.coverImage,
      tags: Array.isArray(b.tags) ? b.tags.map(String) : ex.tags ?? [],
      status:
        b.status === "published" || b.status === "draft"
          ? b.status
          : ex.status,
      updatedAt: FieldValue.serverTimestamp(),
    };
    await ref.update(patch);
    const updated = await ref.get();
    res.json({ id, ...updated.data() });
  } catch (err) {
    console.error("updateArticle", err);
    res.status(500).json({ error: "Failed to update article" });
  }
}

export async function deleteArticle(req, res) {
  try {
    const { id } = req.params;
    const ref = db().collection("learning_articles").doc(id);
    const existing = await ref.get();
    if (!existing.exists) return res.status(404).json({ error: "Not found" });
    await ref.delete();
    res.json({ id, deleted: true });
  } catch (err) {
    console.error("deleteArticle", err);
    res.status(500).json({ error: "Failed to delete article" });
  }
}
