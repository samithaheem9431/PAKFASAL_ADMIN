/** Firestore may store string (legacy) or { en, ur } */
export function displayBilingual(v, sep = " · ") {
  if (v == null || v === "") return "";
  if (typeof v === "string") return v;
  const en = (v.en || "").trim();
  const ur = (v.ur || "").trim();
  if (en && ur) return `${en}${sep}${ur}`;
  return en || ur || "";
}

export function readBilingualField(value) {
  if (value == null) return { en: "", ur: "" };
  if (typeof value === "string") return { en: value, ur: "" };
  return {
    en: value.en ?? "",
    ur: value.ur ?? "",
  };
}
