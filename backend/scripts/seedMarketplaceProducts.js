// Seed marketplace products (wheat / rice / cotton) into Firestore.
// Images are uploaded to Cloudinary; only HTTPS URLs are stored in Firestore.
//
// Safe to re-run: each product uses a fixed doc ID (`sku` or `id`) via `.set()`.
//
// Usage (from the backend/ folder, where .env + service account live):
//   1. Put image files under scripts/assets/marketplace/
//   2. Fill PRODUCTS below (company, titles, prices, imagePaths)
//   3. node scripts/seedMarketplaceProducts.js
//
// Example imagePaths: ["wheat-seed.jpg"] → scripts/assets/marketplace/wheat-seed.jpg

import "dotenv/config";
import { readFileSync, existsSync } from "fs";
import { join, dirname, extname } from "path";
import { fileURLToPath } from "url";
import admin from "../src/firebaseAdmin.js";
import { FieldValue } from "firebase-admin/firestore";
import {
  uploadBufferToCloudinary,
  isCloudinaryConfigured,
} from "../src/utils/cloudinaryUpload.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ASSETS_DIR = join(__dirname, "assets", "marketplace");
const db = admin.firestore();

const MIME_BY_EXT = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
};

/**
 * Edit this list when you have real company data + images.
 * crop must be: wheat | rice | cotton
 * category e.g.: fungicides | herbicides | insecticides | seedcare | specialty-nutrition
 */
const PRODUCTS = [
  {
    id: "marketplace-wheat-sample",
    company: "Sample Agri Co",
    crop: "wheat",
    category: "seedcare",
    title: { en: "Wheat Seed (Sample)", ur: "گندم کا بیج" },
    description: {
      en: "Replace this sample wheat listing with real company data.",
      ur: "اس نمونہ اندراج کو حقیقی کمپنی ڈیٹا سے بدلیں۔",
    },
    price: 0,
    sku: "WHEAT-SAMPLE",
    phones: [],
    imagePaths: [], // e.g. ["wheat-1.jpg"]
    isActive: true,
  },
  {
    id: "marketplace-rice-sample",
    company: "Sample Agri Co",
    crop: "rice",
    category: "seedcare",
    title: { en: "Rice Seed (Sample)", ur: "چاول کا بیج" },
    description: {
      en: "Replace this sample rice listing with real company data.",
      ur: "اس نمونہ اندراج کو حقیقی کمپنی ڈیٹا سے بدلیں۔",
    },
    price: 0,
    sku: "RICE-SAMPLE",
    phones: [],
    imagePaths: [],
    isActive: true,
  },
  {
    id: "marketplace-cotton-sample",
    company: "Sample Agri Co",
    crop: "cotton",
    category: "seedcare",
    title: { en: "Cotton Seed (Sample)", ur: "کپاس کا بیج" },
    description: {
      en: "Replace this sample cotton listing with real company data.",
      ur: "اس نمونہ اندراج کو حقیقی کمپنی ڈیٹا سے بدلیں۔",
    },
    price: 0,
    sku: "COTTON-SAMPLE",
    phones: [],
    imagePaths: [],
    isActive: true,
  },
];

function mimeFromFilename(filename) {
  const ext = extname(filename).toLowerCase();
  return MIME_BY_EXT[ext] || null;
}

async function uploadLocalImages(imagePaths) {
  const urls = [];
  for (const name of imagePaths || []) {
    const full = join(ASSETS_DIR, name);
    if (!existsSync(full)) {
      throw new Error(`Image not found: ${full}`);
    }
    const mimetype = mimeFromFilename(name);
    if (!mimetype) {
      throw new Error(`Unsupported image type: ${name}`);
    }
    const buffer = readFileSync(full);
    const url = await uploadBufferToCloudinary(
      { buffer, mimetype },
      "pakfasal-admin/marketplace"
    );
    urls.push(url);
    console.log(`  uploaded ${name} → ${url}`);
  }
  return urls;
}

async function seed() {
  if (!isCloudinaryConfigured()) {
    console.warn(
      "Cloudinary not configured — products will be written with empty images[]. Set CLOUDINARY_* in .env to upload."
    );
  }

  console.log(`Assets dir: ${ASSETS_DIR}`);
  console.log(`Seeding ${PRODUCTS.length} marketplace product(s)...\n`);

  for (const p of PRODUCTS) {
    const docId = String(p.id || p.sku || "").trim();
    if (!docId) {
      throw new Error("Each product needs an id or sku for a stable Firestore doc ID");
    }
    if (!["wheat", "rice", "cotton"].includes(p.crop)) {
      throw new Error(`Invalid crop for ${docId}: ${p.crop}`);
    }

    console.log(`→ ${docId} (${p.crop}/${p.category}) — ${p.company}`);

    let images = [];
    if ((p.imagePaths || []).length) {
      if (!isCloudinaryConfigured()) {
        throw new Error(
          "Product has imagePaths but Cloudinary is not configured in .env"
        );
      }
      images = await uploadLocalImages(p.imagePaths);
    }

    const doc = {
      title: {
        en: String(p.title?.en ?? "").trim(),
        ur: String(p.title?.ur ?? "").trim(),
      },
      description: {
        en: String(p.description?.en ?? "").trim(),
        ur: String(p.description?.ur ?? "").trim(),
      },
      price: Number(p.price) || 0,
      currency: "PKR",
      crop: p.crop,
      category: String(p.category ?? "").trim() || "general",
      company: String(p.company ?? "").trim(),
      images,
      phones: Array.isArray(p.phones)
        ? p.phones.map((x) => String(x).trim()).filter(Boolean)
        : [],
      sku: String(p.sku ?? "").trim(),
      isActive: p.isActive !== false,
      isDeleted: false,
      updatedAt: FieldValue.serverTimestamp(),
    };

    const ref = db.collection("products").doc(docId);
    const existing = await ref.get();
    if (!existing.exists) {
      doc.createdAt = FieldValue.serverTimestamp();
    }
    await ref.set(doc, { merge: true });
    console.log(`  saved products/${docId}\n`);
  }

  console.log("Done.");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
