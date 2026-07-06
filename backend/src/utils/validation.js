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
