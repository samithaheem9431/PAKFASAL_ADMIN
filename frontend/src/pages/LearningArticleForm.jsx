import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { api } from "../services/api.js";
import toast from "react-hot-toast";
import { Spinner } from "../components/Spinner.jsx";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { trackEvent } from "../services/analytics.js";
import { LEARNING_ICONS } from "../constants/learningIcons.js";

function validateForm(data) {
  if (!data.categoryEn?.trim()) return "Category (English) is required.";
  if (!data.categoryUr?.trim()) return "Category (Urdu) is required.";
  if (!data.titleEn?.trim()) return "Title (English) is required.";
  if (!data.titleUr?.trim()) return "Title (Urdu) is required.";
  if (!data.summaryEn?.trim()) return "Summary (English) is required.";
  if (!data.summaryUr?.trim()) return "Summary (Urdu) is required.";
  const readTime = Number(data.readTimeMinutes);
  if (Number.isNaN(readTime) || readTime <= 0) return "Read time must be a positive number.";
  if (!LEARNING_ICONS.includes(data.icon)) return "Please choose a valid icon.";
  if (data.order === "" || Number.isNaN(Number(data.order))) return "Order must be a number.";

  for (let i = 0; i < (data.sections?.length ?? 0); i++) {
    const s = data.sections[i];
    if (!s.headingEn?.trim() || !s.headingUr?.trim() || !s.bodyEn?.trim() || !s.bodyUr?.trim()) {
      return `Section ${i + 1}: fill heading and body in both English and Urdu.`;
    }
  }
  return null;
}

export function LearningArticleForm() {
  const { id } = useParams();
  const isNew = !id || id === "new";
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [originalSectionIds, setOriginalSectionIds] = useState([]);
  // Tracks the article ID once created, so a retry after a partial failure
  // (article saved, some section save failed) updates it instead of
  // creating a duplicate article.
  const createdArticleIdRef = useRef(null);

  const { register, control, handleSubmit, reset, setValue } = useForm({
    defaultValues: {
      categoryEn: "",
      categoryUr: "",
      titleEn: "",
      titleUr: "",
      summaryEn: "",
      summaryUr: "",
      readTimeMinutes: 4,
      icon: LEARNING_ICONS[0],
      order: 0,
      sections: [],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "sections" });

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const { data } = await api.get("/api/learning-articles");
        if (cancel) return;
        const cats = new Set();
        (data.items || []).forEach((a) => {
          if (a.categoryEn) cats.add(a.categoryEn);
        });
        setCategories([...cats].sort());
      } catch {
        // Category suggestions are a nicety; ignore failures.
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  useEffect(() => {
    if (isNew) return;
    let cancel = false;
    (async () => {
      try {
        const [{ data: articlesData }, { data: sectionsData }] = await Promise.all([
          api.get("/api/learning-articles"),
          api.get("/api/article-sections", { params: { articleId: id } }),
        ]);
        const a = articlesData.items?.find((x) => x.id === id);
        if (!a) {
          toast.error("Article not found");
          navigate("/learning/articles");
          return;
        }
        if (cancel) return;
        const sections = (sectionsData.items || [])
          .slice()
          .sort((x, y) => (x.order ?? 0) - (y.order ?? 0));
        setOriginalSectionIds(sections.map((s) => s.id));
        reset({
          categoryEn: a.categoryEn ?? "",
          categoryUr: a.categoryUr ?? "",
          titleEn: a.titleEn ?? "",
          titleUr: a.titleUr ?? "",
          summaryEn: a.summaryEn ?? "",
          summaryUr: a.summaryUr ?? "",
          readTimeMinutes: a.readTimeMinutes ?? 4,
          icon: a.icon ?? LEARNING_ICONS[0],
          order: a.order ?? 0,
          sections: sections.map((s) => ({
            _id: s.id,
            headingEn: s.headingEn ?? "",
            headingUr: s.headingUr ?? "",
            bodyEn: s.bodyEn ?? "",
            bodyUr: s.bodyUr ?? "",
          })),
        });
      } catch (e) {
        toast.error(e.response?.data?.error || "Failed to load");
        navigate("/learning/articles");
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [id, isNew, navigate, reset]);

  const onSubmit = async (data) => {
    const v = validateForm(data);
    if (v) {
      toast.error(v);
      return;
    }
    setSaving(true);
    try {
      const body = {
        categoryEn: data.categoryEn.trim(),
        categoryUr: data.categoryUr.trim(),
        titleEn: data.titleEn.trim(),
        titleUr: data.titleUr.trim(),
        summaryEn: data.summaryEn.trim(),
        summaryUr: data.summaryUr.trim(),
        readTimeMinutes: Number(data.readTimeMinutes),
        icon: data.icon,
        order: Number(data.order),
      };

      // If a previous save attempt already created the article but failed
      // partway through saving its sections, reuse that ID and PUT instead
      // of POSTing a duplicate article on retry.
      const alreadyCreated = !isNew || !!createdArticleIdRef.current;
      let articleId = isNew ? createdArticleIdRef.current : id;

      if (alreadyCreated) {
        await api.put(`/api/learning-articles/${articleId}`, body);
        trackEvent("admin_learning_article_update", { article_id: articleId });
      } else {
        const { data: created } = await api.post("/api/learning-articles", body);
        articleId = created.id;
        createdArticleIdRef.current = articleId;
        trackEvent("admin_learning_article_create", { article_id: articleId });
      }

      const currentIds = new Set();
      for (let i = 0; i < data.sections.length; i++) {
        const s = data.sections[i];
        const sectionBody = {
          articleId,
          order: i + 1,
          headingEn: s.headingEn.trim(),
          headingUr: s.headingUr.trim(),
          bodyEn: s.bodyEn.trim(),
          bodyUr: s.bodyUr.trim(),
        };
        if (s._id) {
          currentIds.add(s._id);
          await api.put(`/api/article-sections/${s._id}`, sectionBody);
        } else {
          // Record the new section's ID immediately so a retry after a
          // later failure updates it instead of creating a duplicate.
          const { data: createdSection } = await api.post(
            "/api/article-sections",
            sectionBody
          );
          setValue(`sections.${i}._id`, createdSection.id);
          currentIds.add(createdSection.id);
        }
      }
      const removed = originalSectionIds.filter((sid) => !currentIds.has(sid));
      for (const sid of removed) {
        await api.delete(`/api/article-sections/${sid}`);
      }
      setOriginalSectionIds([...currentIds]);

      toast.success(alreadyCreated ? "Article updated" : "Article created");
      navigate("/learning/articles");
    } catch (e) {
      const msg = e.response?.data?.errors?.join?.(", ") || e.response?.data?.error;
      toast.error(msg || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="h-10 w-10" />
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 max-w-full">
      <Link
        to="/learning/articles"
        className="mb-4 inline-flex items-center gap-2 text-sm text-slate-600 hover:text-brand-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to articles
      </Link>

      <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
        {isNew ? "Add article" : "Edit article"}
      </h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mx-auto mt-6 w-full max-w-3xl space-y-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Category (English)</label>
            <input
              list="category-suggestions"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              {...register("categoryEn")}
            />
            <datalist id="category-suggestions">
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Category (Urdu)</label>
            <input
              dir="rtl"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              {...register("categoryUr")}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Title (English)</label>
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              {...register("titleEn")}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Title (Urdu)</label>
            <input
              dir="rtl"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              {...register("titleUr")}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Summary (English)</label>
            <textarea
              rows={2}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              {...register("summaryEn")}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Summary (Urdu)</label>
            <textarea
              dir="rtl"
              rows={2}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              {...register("summaryUr")}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium">Read time (minutes)</label>
            <input
              type="number"
              min={1}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              {...register("readTimeMinutes", { valueAsNumber: true })}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Icon</label>
            <select
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              {...register("icon")}
            >
              {LEARNING_ICONS.map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Display order</label>
            <input
              type="number"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              {...register("order", { valueAsNumber: true })}
            />
          </div>
        </div>

        <div className="border-t border-slate-200 pt-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Sections</h2>
            <button
              type="button"
              onClick={() =>
                append({ headingEn: "", headingUr: "", bodyEn: "", bodyUr: "" })
              }
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50"
            >
              <Plus className="h-4 w-4" />
              Add section
            </button>
          </div>

          <div className="mt-4 space-y-4">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="rounded-lg border border-slate-200 bg-slate-50/60 p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">
                    Section {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="inline-flex items-center gap-1 text-sm text-red-600 hover:underline"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove
                  </button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium">Heading (English)</label>
                    <input
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                      {...register(`sections.${index}.headingEn`)}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium">Heading (Urdu)</label>
                    <input
                      dir="rtl"
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                      {...register(`sections.${index}.headingUr`)}
                    />
                  </div>
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium">Body (English)</label>
                    <textarea
                      rows={4}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                      {...register(`sections.${index}.bodyEn`)}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium">Body (Urdu)</label>
                    <textarea
                      dir="rtl"
                      rows={4}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                      {...register(`sections.${index}.bodyUr`)}
                    />
                  </div>
                </div>
              </div>
            ))}
            {fields.length === 0 && (
              <p className="text-sm text-slate-500">No sections yet. Add at least one.</p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:gap-3">
          <button
            type="submit"
            disabled={saving}
            className="order-2 w-full rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60 sm:order-1 sm:w-auto"
          >
            {saving ? "Saving…" : "Save"}
          </button>
          <Link
            to="/learning/articles"
            className="order-1 w-full rounded-lg border border-slate-300 px-5 py-2.5 text-center text-sm hover:bg-slate-50 sm:order-2 sm:w-auto"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
