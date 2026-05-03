import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { api, uploadFile } from "../services/api.js";
import toast from "react-hot-toast";
import { Spinner } from "../components/Spinner.jsx";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, Upload } from "lucide-react";
import { trackEvent } from "../services/analytics.js";
import { readBilingualField } from "../utils/bilingual.js";

function validateBilingual(data) {
  const te = data.titleEn?.trim();
  const tu = data.titleUr?.trim();
  const ce = data.contentEn?.trim();
  const cu = data.contentUr?.trim();
  if (!te && !tu) return "Fill title in at least English or Urdu.";
  if (!ce && !cu) return "Fill content in at least English or Urdu.";
  return null;
}

export function ArticleForm() {
  const { id } = useParams();
  const isNew = !id || id === "new";
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!isNew);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(false);

  const { register, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: {
      titleEn: "",
      titleUr: "",
      slug: "",
      contentEn: "",
      contentUr: "",
      coverImage: "",
      tags: "",
      status: "draft",
    },
  });
  const contentEn = watch("contentEn");
  const contentUr = watch("contentUr");

  useEffect(() => {
    if (isNew) return;
    let cancel = false;
    (async () => {
      try {
        const { data } = await api.get("/api/learning-articles");
        const a = data.items?.find((x) => x.id === id);
        if (!a) {
          toast.error("Not found");
          navigate("/learning/articles");
          return;
        }
        if (cancel) return;
        const t = readBilingualField(a.title);
        const c = readBilingualField(a.content);
        reset({
          titleEn: t.en,
          titleUr: t.ur,
          slug: a.slug ?? "",
          contentEn: c.en,
          contentUr: c.ur,
          coverImage: a.coverImage ?? "",
          tags: (a.tags || []).join(", "),
          status: a.status === "published" ? "published" : "draft",
        });
      } catch {
        navigate("/learning/articles");
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [id, isNew, navigate, reset]);

  const onCover = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await uploadFile(file);
      setValue("coverImage", url);
      toast.success("Cover uploaded");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data) => {
    const v = validateBilingual(data);
    if (v) {
      toast.error(v);
      return;
    }
    const body = {
      title: {
        en: data.titleEn?.trim() || "",
        ur: data.titleUr?.trim() || "",
      },
      content: {
        en: data.contentEn ?? "",
        ur: data.contentUr ?? "",
      },
      slug: data.slug?.trim() || undefined,
      coverImage: data.coverImage?.trim() || "",
      tags: data.tags
        ? data.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [],
      status: data.status === "published" ? "published" : "draft",
    };
    try {
      if (isNew) {
        await api.post("/api/learning-articles", body);
        trackEvent("admin_article_create", { status: body.status });
        toast.success("Created");
      } else {
        await api.put(`/api/learning-articles/${id}`, body);
        trackEvent("admin_article_update", { article_id: id, status: body.status });
        toast.success("Updated");
      }
      navigate("/learning/articles");
    } catch (e) {
      const errs = e.response?.data?.errors;
      toast.error(
        Array.isArray(errs) ? errs.join(" ") : e.response?.data?.error || "Save failed"
      );
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
        className="mb-4 inline-flex items-center gap-2 text-sm text-slate-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>
      <h1 className="text-xl font-bold sm:text-2xl">
        {isNew ? "New article" : "Edit article"}
      </h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-6 w-full max-w-4xl space-y-4 rounded-xl border border-slate-200 bg-white p-4 sm:p-6"
      >
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
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              dir="rtl"
              {...register("titleUr")}
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Slug</label>
          <input
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="auto from English title if empty"
            {...register("slug")}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Cover image URL</label>
          <div className="flex flex-wrap items-center gap-2">
            <input
              className="min-w-[200px] flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
              {...register("coverImage")}
            />
            <label className="inline-flex cursor-pointer items-center gap-2 rounded border border-dashed px-3 py-2 text-sm">
              <Upload className="h-4 w-4" />
              {uploading ? "…" : "Upload"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onCover}
                disabled={uploading}
              />
            </label>
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Tags (comma separated)</label>
          <input
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            {...register("tags")}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Status</label>
          <select
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm sm:w-auto sm:min-w-[12rem]"
            {...register("status")}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        <div>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm font-medium">Content (Markdown)</span>
            <button
              type="button"
              onClick={() => setPreview((p) => !p)}
              className="text-sm text-brand-600"
            >
              {preview ? "Edit" : "Preview"}
            </button>
          </div>
          {preview ? (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="mb-1 text-xs font-medium text-slate-500">English</p>
                <div className="prose prose-sm max-w-none min-h-[160px] rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <ReactMarkdown>{contentEn || ""}</ReactMarkdown>
                </div>
              </div>
              <div dir="rtl">
                <p className="mb-1 text-xs font-medium text-slate-500">Urdu</p>
                <div className="prose prose-sm max-w-none min-h-[160px] rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <ReactMarkdown>{contentUr || ""}</ReactMarkdown>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  English
                </label>
                <textarea
                  rows={14}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm"
                  {...register("contentEn")}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Urdu
                </label>
                <textarea
                  rows={14}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm"
                  dir="rtl"
                  {...register("contentUr")}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:gap-3">
          <button
            type="submit"
            className="w-full rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white sm:w-auto"
          >
            Save
          </button>
          <Link
            to="/learning/articles"
            className="w-full rounded-lg border px-5 py-2.5 text-center text-sm sm:w-auto"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
