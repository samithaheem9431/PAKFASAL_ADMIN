export function hasText(v) {
  return typeof v === "string" && v.trim().length > 0;
}

/** At least one of en or ur must be non-empty for title; same for description (per product spec). */
export function validateBilingualProduct(body) {
  const errors = [];
  const titleEn = body.title?.en;
  const titleUr = body.title?.ur;
  const descEn = body.description?.en;
  const descUr = body.description?.ur;

  if (!hasText(titleEn) && !hasText(titleUr)) {
    errors.push("At least one title (English or Urdu) is required");
  }
  if (!hasText(descEn) && !hasText(descUr)) {
    errors.push("At least one description (English or Urdu) is required");
  }
  return errors;
}

export function normalizeBilingual(body) {
  return {
    title: {
      en: (body.title?.en ?? "").trim(),
      ur: (body.title?.ur ?? "").trim(),
    },
    description: {
      en: (body.description?.en ?? "").trim(),
      ur: (body.description?.ur ?? "").trim(),
    },
  };
}

/* ------------------------------------------------------------------ */
/* Learning module (crops, crop diseases, articles, article sections) */
/* ------------------------------------------------------------------ */

export const LEARNING_ICONS = [
  "grass",
  "rice_bowl",
  "cotton",
  "spa",
  "grass_outlined",
  "eco",
  "terrain",
  "science",
  "water_drop",
  "cloud",
  "storefront",
  "account_balance",
  "bug_report",
  "agriculture",
  "article",
];

const SLUG_RE = /^[a-z0-9_-]+$/;

export function validateCropSlug(slug) {
  if (!hasText(slug)) return "Crop ID / slug is required";
  if (!SLUG_RE.test(slug)) {
    return "Slug must contain only lowercase letters, numbers, - or _";
  }
  return null;
}

export function validateLearningCrop(body) {
  const errors = [];
  if (!hasText(body.nameEn)) errors.push("Name (English) is required");
  if (!hasText(body.nameUr)) errors.push("Name (Urdu) is required");
  if (!LEARNING_ICONS.includes(body.icon)) errors.push("A valid icon is required");
  if (typeof body.order !== "number" || Number.isNaN(body.order)) {
    errors.push("Order must be a number");
  }
  if (typeof body.showInPests !== "boolean") {
    errors.push("showInPests must be true or false");
  }
  return errors;
}

export function normalizeLearningCrop(body) {
  return {
    nameEn: String(body.nameEn ?? "").trim(),
    nameUr: String(body.nameUr ?? "").trim(),
    icon: body.icon,
    order: Number(body.order),
    showInPests: Boolean(body.showInPests),
  };
}

function toStringArray(v) {
  if (Array.isArray(v)) {
    return v.map((s) => String(s).trim()).filter(Boolean);
  }
  if (typeof v === "string") {
    return v
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

export function validateCropDisease(body) {
  const errors = [];
  if (!hasText(body.cropId)) errors.push("Crop is required");
  if (typeof body.order !== "number" || Number.isNaN(body.order)) {
    errors.push("Order must be a number");
  }
  if (!hasText(body.nameEn)) errors.push("Name (English) is required");
  if (!hasText(body.nameUr)) errors.push("Name (Urdu) is required");
  if (!hasText(body.descriptionEn)) errors.push("Description (English) is required");
  if (!hasText(body.descriptionUr)) errors.push("Description (Urdu) is required");
  if (!toStringArray(body.symptomsEn).length) {
    errors.push("At least one symptom (English) is required");
  }
  if (!toStringArray(body.symptomsUr).length) {
    errors.push("At least one symptom (Urdu) is required");
  }
  if (!toStringArray(body.solutionsEn).length) {
    errors.push("At least one solution (English) is required");
  }
  if (!toStringArray(body.solutionsUr).length) {
    errors.push("At least one solution (Urdu) is required");
  }
  return errors;
}

export function normalizeCropDisease(body) {
  return {
    cropId: String(body.cropId ?? "").trim(),
    order: Number(body.order),
    nameEn: String(body.nameEn ?? "").trim(),
    nameUr: String(body.nameUr ?? "").trim(),
    descriptionEn: String(body.descriptionEn ?? "").trim(),
    descriptionUr: String(body.descriptionUr ?? "").trim(),
    symptomsEn: toStringArray(body.symptomsEn),
    symptomsUr: toStringArray(body.symptomsUr),
    solutionsEn: toStringArray(body.solutionsEn),
    solutionsUr: toStringArray(body.solutionsUr),
  };
}

export function validateLearningArticle(body) {
  const errors = [];
  if (!hasText(body.categoryEn)) errors.push("Category (English) is required");
  if (!hasText(body.categoryUr)) errors.push("Category (Urdu) is required");
  if (!hasText(body.titleEn)) errors.push("Title (English) is required");
  if (!hasText(body.titleUr)) errors.push("Title (Urdu) is required");
  if (!hasText(body.summaryEn)) errors.push("Summary (English) is required");
  if (!hasText(body.summaryUr)) errors.push("Summary (Urdu) is required");
  const readTime = Number(body.readTimeMinutes);
  if (Number.isNaN(readTime) || readTime <= 0) {
    errors.push("Read time (minutes) must be a positive number");
  }
  if (!LEARNING_ICONS.includes(body.icon)) errors.push("A valid icon is required");
  if (typeof body.order !== "number" || Number.isNaN(body.order)) {
    errors.push("Order must be a number");
  }
  return errors;
}

export function normalizeLearningArticle(body) {
  return {
    categoryEn: String(body.categoryEn ?? "").trim(),
    categoryUr: String(body.categoryUr ?? "").trim(),
    titleEn: String(body.titleEn ?? "").trim(),
    titleUr: String(body.titleUr ?? "").trim(),
    summaryEn: String(body.summaryEn ?? "").trim(),
    summaryUr: String(body.summaryUr ?? "").trim(),
    readTimeMinutes: Number(body.readTimeMinutes),
    icon: body.icon,
    order: Number(body.order),
  };
}

export function validateArticleSection(body) {
  const errors = [];
  if (!hasText(body.articleId)) errors.push("Article is required");
  if (typeof body.order !== "number" || Number.isNaN(body.order)) {
    errors.push("Order must be a number");
  }
  if (!hasText(body.headingEn)) errors.push("Heading (English) is required");
  if (!hasText(body.headingUr)) errors.push("Heading (Urdu) is required");
  if (!hasText(body.bodyEn)) errors.push("Body (English) is required");
  if (!hasText(body.bodyUr)) errors.push("Body (Urdu) is required");
  return errors;
}

export function normalizeArticleSection(body) {
  return {
    articleId: String(body.articleId ?? "").trim(),
    order: Number(body.order),
    headingEn: String(body.headingEn ?? "").trim(),
    headingUr: String(body.headingUr ?? "").trim(),
    bodyEn: String(body.bodyEn ?? "").trim(),
    bodyUr: String(body.bodyUr ?? "").trim(),
  };
}
