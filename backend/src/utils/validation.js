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

export function validateBilingualArticle(body) {
  const errors = [];
  const te = body.title?.en;
  const tu = body.title?.ur;
  const ce = body.content?.en;
  const cu = body.content?.ur;
  if (!hasText(te) && !hasText(tu)) {
    errors.push("At least one title (English or Urdu) is required");
  }
  if (!hasText(ce) && !hasText(cu)) {
    errors.push("At least one content (English or Urdu) is required");
  }
  return errors;
}

export function normalizeBilingualArticle(body) {
  return {
    title: {
      en: (body.title?.en ?? "").trim(),
      ur: (body.title?.ur ?? "").trim(),
    },
    content: {
      en: (body.content?.en ?? "").trim(),
      ur: (body.content?.ur ?? "").trim(),
    },
  };
}

export function validateBilingualCropsPest(body) {
  const errors = [];
  const ce = body.cropName?.en;
  const cu = body.cropName?.ur;
  if (!hasText(ce) && !hasText(cu)) {
    errors.push("At least one crop name (English or Urdu) is required");
  }
  return errors;
}

export function normalizeBilingualCropsPest(body) {
  return {
    cropName: {
      en: (body.cropName?.en ?? "").trim(),
      ur: (body.cropName?.ur ?? "").trim(),
    },
    diseaseName: {
      en: (body.diseaseName?.en ?? "").trim(),
      ur: (body.diseaseName?.ur ?? "").trim(),
    },
    symptoms: {
      en: (body.symptoms?.en ?? "").trim(),
      ur: (body.symptoms?.ur ?? "").trim(),
    },
    treatment: {
      en: (body.treatment?.en ?? "").trim(),
      ur: (body.treatment?.ur ?? "").trim(),
    },
  };
}

function stepTitleParts(s) {
  const t = s?.title;
  if (t != null && typeof t === "object" && !Array.isArray(t)) {
    return { en: t.en, ur: t.ur };
  }
  return { en: typeof t === "string" ? t : "", ur: "" };
}

function stepDescParts(s) {
  const d = s?.description;
  if (d != null && typeof d === "object" && !Array.isArray(d)) {
    return { en: d.en, ur: d.ur };
  }
  return { en: typeof d === "string" ? d : "", ur: "" };
}

export function validateCultivationSteps(steps) {
  const errors = [];
  if (!Array.isArray(steps) || !steps.length) {
    errors.push("steps array is required");
    return errors;
  }
  steps.forEach((s, i) => {
    const st = stepTitleParts(s);
    if (!hasText(st.en) && !hasText(st.ur)) {
      errors.push(
        `Step ${i + 1}: at least one title (English or Urdu) is required`
      );
    }
    const sd = stepDescParts(s);
    if (!hasText(sd.en) && !hasText(sd.ur)) {
      errors.push(
        `Step ${i + 1}: at least one description (English or Urdu) is required`
      );
    }
  });
  return errors;
}

export function normalizeCultivationStep(s, i) {
  const st = stepTitleParts(s);
  const sd = stepDescParts(s);
  return {
    title: {
      en: String(st.en ?? "").trim(),
      ur: String(st.ur ?? "").trim(),
    },
    description: {
      en: String(sd.en ?? "").trim(),
      ur: String(sd.ur ?? "").trim(),
    },
    image: String(s.image ?? "").trim(),
    order: typeof s.order === "number" ? s.order : i,
  };
}

export function validateBilingualCropName(body) {
  const errors = [];
  if (body.name != null && typeof body.name === "string") {
    if (!hasText(body.name)) errors.push("name is required");
    return errors;
  }
  const en = body.name?.en;
  const ur = body.name?.ur;
  if (!hasText(en) && !hasText(ur)) {
    errors.push("At least one crop name (English or Urdu) is required");
  }
  return errors;
}

export function normalizeBilingualCropName(body) {
  if (body.name != null && typeof body.name === "string") {
    return {
      en: String(body.name).trim(),
      ur: "",
    };
  }
  return {
    en: (body.name?.en ?? "").trim(),
    ur: (body.name?.ur ?? "").trim(),
  };
}
