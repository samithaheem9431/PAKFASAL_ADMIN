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
  const order = Number(body.order);
  if (Number.isNaN(order)) {
    errors.push("Order must be a number");
  }
  return errors;
}

export function normalizeLearningCrop(body) {
  return {
    nameEn: String(body.nameEn ?? "").trim(),
    nameUr: String(body.nameUr ?? "").trim(),
    // Icon dropdown was removed from the admin form in favour of crop images.
    // Always persist a valid Material icon key so older app builds / validators
    // never reject the document for a missing icon.
    icon: resolveLearningIcon(body.icon, "eco"),
    order: Number(body.order),
    showInPests: Boolean(body.showInPests),
    imageUrl: String(body.imageUrl ?? "").trim(),
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
    imageUrl: String(body.imageUrl ?? "").trim(),
  };
}

/** Resolve to a known Material-style icon name; default when missing/invalid. */
export function resolveLearningIcon(icon, fallback = "article") {
  const value = String(icon ?? "").trim();
  if (LEARNING_ICONS.includes(value)) return value;
  return fallback;
}

/** Coerce article payload so string numbers / missing icon never fail validation. */
export function coerceLearningArticle(body = {}) {
  return {
    ...body,
    categoryEn: body.categoryEn,
    categoryUr: body.categoryUr,
    titleEn: body.titleEn,
    titleUr: body.titleUr,
    summaryEn: body.summaryEn,
    summaryUr: body.summaryUr,
    readTimeMinutes: Number(body.readTimeMinutes),
    icon: resolveLearningIcon(body.icon),
    order: Number(body.order),
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
  const order = Number(body.order);
  if (Number.isNaN(order)) {
    errors.push("Order must be a number");
  }
  return errors;
}

export function normalizeLearningArticle(body) {
  const coerced = coerceLearningArticle(body);
  return {
    categoryEn: String(coerced.categoryEn ?? "").trim(),
    categoryUr: String(coerced.categoryUr ?? "").trim(),
    titleEn: String(coerced.titleEn ?? "").trim(),
    titleUr: String(coerced.titleUr ?? "").trim(),
    summaryEn: String(coerced.summaryEn ?? "").trim(),
    summaryUr: String(coerced.summaryUr ?? "").trim(),
    readTimeMinutes: Number(coerced.readTimeMinutes),
    icon: resolveLearningIcon(coerced.icon),
    order: Number(coerced.order),
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

/* ------------------------------------------------------------------ */
/* Government schemes                                                  */
/* ------------------------------------------------------------------ */

export const GOVT_SCHEME_STATUSES = ["active", "inactive", "closed"];

export const PAKISTAN_PROVINCES = [
  "All Pakistan",
  "Punjab",
  "Sindh",
  "Khyber Pakhtunkhwa",
  "Balochistan",
  "Gilgit-Baltistan",
  "Azad Jammu & Kashmir",
  "Islamabad Capital Territory",
];

function isValidOptionalUrl(v) {
  const s = String(v ?? "").trim();
  if (!s) return true;
  try {
    const u = new URL(s);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export function coerceGovtScheme(body = {}) {
  return {
    ...body,
    order: Number(body.order ?? 0),
    featured: Boolean(body.featured),
    status: String(body.status ?? "active").trim().toLowerCase(),
  };
}

export function validateGovtScheme(body) {
  const errors = [];
  if (!hasText(body.titleEn)) errors.push("Scheme title (English) is required");
  if (!hasText(body.titleUr)) errors.push("Scheme title (Urdu) is required");
  if (!hasText(body.descriptionEn)) errors.push("Short description (English) is required");
  if (!hasText(body.descriptionUr)) errors.push("Short description (Urdu) is required");
  if (!hasText(body.categoryEn)) errors.push("Category (English) is required");
  if (!hasText(body.categoryUr)) errors.push("Category (Urdu) is required");
  if (!hasText(body.departmentEn)) errors.push("Department (English) is required");
  if (!hasText(body.departmentUr)) errors.push("Department (Urdu) is required");
  if (!hasText(body.province)) errors.push("Province is required");
  if (!toStringArray(body.eligibilityEn).length) {
    errors.push("At least one eligibility point (English) is required");
  }
  if (!toStringArray(body.eligibilityUr).length) {
    errors.push("At least one eligibility point (Urdu) is required");
  }
  if (!toStringArray(body.benefitsEn).length) {
    errors.push("At least one benefit (English) is required");
  }
  if (!toStringArray(body.benefitsUr).length) {
    errors.push("At least one benefit (Urdu) is required");
  }
  const status = String(body.status ?? "").trim().toLowerCase();
  if (!GOVT_SCHEME_STATUSES.includes(status)) {
    errors.push("Status must be active, inactive, or closed");
  }
  if (!isValidOptionalUrl(body.applyUrl)) {
    errors.push("Apply link must be a valid http(s) URL");
  }
  if (!isValidOptionalUrl(body.website)) {
    errors.push("Official website must be a valid http(s) URL");
  }
  const order = Number(body.order);
  if (Number.isNaN(order)) errors.push("Order must be a number");
  const deadline = String(body.deadline ?? "").trim();
  if (deadline && !/^\d{4}-\d{2}-\d{2}$/.test(deadline)) {
    errors.push("Deadline must be a date (YYYY-MM-DD) or empty");
  }
  return errors;
}

export function normalizeGovtScheme(body) {
  const coerced = coerceGovtScheme(body);
  return {
    titleEn: String(coerced.titleEn ?? "").trim(),
    titleUr: String(coerced.titleUr ?? "").trim(),
    descriptionEn: String(coerced.descriptionEn ?? "").trim(),
    descriptionUr: String(coerced.descriptionUr ?? "").trim(),
    categoryEn: String(coerced.categoryEn ?? "").trim(),
    categoryUr: String(coerced.categoryUr ?? "").trim(),
    departmentEn: String(coerced.departmentEn ?? "").trim(),
    departmentUr: String(coerced.departmentUr ?? "").trim(),
    province: String(coerced.province ?? "").trim(),
    eligibilityEn: toStringArray(coerced.eligibilityEn),
    eligibilityUr: toStringArray(coerced.eligibilityUr),
    benefitsEn: toStringArray(coerced.benefitsEn),
    benefitsUr: toStringArray(coerced.benefitsUr),
    deadline: String(coerced.deadline ?? "").trim(),
    status: GOVT_SCHEME_STATUSES.includes(coerced.status)
      ? coerced.status
      : "active",
    applyUrl: String(coerced.applyUrl ?? "").trim(),
    website: String(coerced.website ?? "").trim(),
    imageUrl: String(coerced.imageUrl ?? "").trim(),
    featured: Boolean(coerced.featured),
    order: Number(coerced.order),
  };
}
