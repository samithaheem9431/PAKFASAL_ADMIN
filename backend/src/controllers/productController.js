import admin from "../firebaseAdmin.js";
import { FieldValue } from "firebase-admin/firestore";
import {
  validateBilingualProduct,
  normalizeBilingual,
} from "../utils/validation.js";

const db = () => admin.firestore();

export async function listProducts(req, res) {
  try {
    const { search, category, includeDeleted } = req.query;
    const snap = await db().collection("products").get();
    let items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    if (includeDeleted !== "true") {
      items = items.filter((p) => p.isDeleted !== true);
    }

    if (search) {
      const q = String(search).toLowerCase();
      items = items.filter((p) => {
        const t = p.title || {};
        const d = p.description || {};
        return (
          (t.en && t.en.toLowerCase().includes(q)) ||
          (t.ur && t.ur.toLowerCase().includes(q)) ||
          (d.en && d.en.toLowerCase().includes(q)) ||
          (d.ur && d.ur.toLowerCase().includes(q)) ||
          (p.sku && String(p.sku).toLowerCase().includes(q))
        );
      });
    }
    if (category) {
      items = items.filter((p) => p.category === category);
    }
    items.sort((a, b) => {
      const ta = a.updatedAt?.toMillis?.() ?? a.createdAt?.toMillis?.() ?? 0;
      const tb = b.updatedAt?.toMillis?.() ?? b.createdAt?.toMillis?.() ?? 0;
      return tb - ta;
    });
    res.json({ items });
  } catch (err) {
    console.error("listProducts", err);
    res.status(500).json({ error: "Failed to list products" });
  }
}

export async function createProduct(req, res) {
  try {
    const body = req.body;
    const errs = validateBilingualProduct(body);
    if (errs.length) return res.status(400).json({ errors: errs });

    const price = Number(body.price);
    if (Number.isNaN(price) || price < 0) {
      return res.status(400).json({ errors: ["Invalid price"] });
    }

    const bi = normalizeBilingual(body);
    const doc = {
      ...bi,
      price,
      currency: body.currency === "PKR" ? "PKR" : "PKR",
      category: String(body.category ?? "").trim() || "general",
      images: Array.isArray(body.images) ? body.images : [],
      sku: body.sku != null ? String(body.sku).trim() : "",
      isActive: Boolean(body.isActive),
      isDeleted: false,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };
    const ref = await db().collection("products").add(doc);
    const created = await ref.get();
    res.status(201).json({ id: ref.id, ...created.data() });
  } catch (err) {
    console.error("createProduct", err);
    res.status(500).json({ error: "Failed to create product" });
  }
}

export async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    const body = req.body;
    const errs = validateBilingualProduct(body);
    if (errs.length) return res.status(400).json({ errors: errs });

    const ref = db().collection("products").doc(id);
    const existing = await ref.get();
    if (!existing.exists) {
      return res.status(404).json({ error: "Product not found" });
    }

    const price = Number(body.price);
    if (Number.isNaN(price) || price < 0) {
      return res.status(400).json({ errors: ["Invalid price"] });
    }

    const bi = normalizeBilingual(body);
    const patch = {
      ...bi,
      price,
      currency: "PKR",
      category: String(body.category ?? "").trim() || "general",
      images: Array.isArray(body.images) ? body.images : [],
      sku: body.sku != null ? String(body.sku).trim() : "",
      isActive: Boolean(body.isActive),
      updatedAt: FieldValue.serverTimestamp(),
    };
    if (typeof body.isDeleted === "boolean") {
      patch.isDeleted = body.isDeleted;
    }
    await ref.update(patch);
    const updated = await ref.get();
    res.json({ id, ...updated.data() });
  } catch (err) {
    console.error("updateProduct", err);
    res.status(500).json({ error: "Failed to update product" });
  }
}

export async function softDeleteProduct(req, res) {
  try {
    const { id } = req.params;
    const ref = db().collection("products").doc(id);
    const existing = await ref.get();
    if (!existing.exists) {
      return res.status(404).json({ error: "Product not found" });
    }
    await ref.update({
      isDeleted: true,
      updatedAt: FieldValue.serverTimestamp(),
    });
    res.json({ id, isDeleted: true });
  } catch (err) {
    console.error("softDeleteProduct", err);
    res.status(500).json({ error: "Failed to delete product" });
  }
}
