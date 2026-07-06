import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { api } from "../services/api.js";
import toast from "react-hot-toast";
import { Spinner } from "../components/Spinner.jsx";
import { ArrowLeft } from "lucide-react";
import { trackEvent } from "../services/analytics.js";
import { LEARNING_ICONS } from "../constants/learningIcons.js";

const SLUG_RE = /^[a-z0-9_-]+$/;

function validateForm(data) {
  if (!data.nameEn?.trim()) return "Name (English) is required.";
  if (!data.nameUr?.trim()) return "Name (Urdu) is required.";
  if (!LEARNING_ICONS.includes(data.icon)) return "Please choose a valid icon.";
  if (data.order === "" || Number.isNaN(Number(data.order))) return "Order must be a number.";
  return null;
}

export function LearningCropForm() {
  const { id } = useParams();
  const isNew = !id || id === "new";
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!isNew);

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      slug: "",
      nameEn: "",
      nameUr: "",
      icon: LEARNING_ICONS[0],
      order: 0,
      showInPests: true,
    },
  });

  useEffect(() => {
    if (isNew) return;
    let cancel = false;
    (async () => {
      try {
        const { data } = await api.get("/api/learning-crops");
        const c = data.items?.find((x) => x.id === id);
        if (!c) {
          toast.error("Crop not found");
          navigate("/learning/crops");
          return;
        }
        if (cancel) return;
        reset({
          slug: c.id,
          nameEn: c.nameEn ?? "",
          nameUr: c.nameUr ?? "",
          icon: c.icon ?? LEARNING_ICONS[0],
          order: c.order ?? 0,
          showInPests: c.showInPests !== false,
        });
      } catch (e) {
        toast.error(e.response?.data?.error || "Failed to load");
        navigate("/learning/crops");
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [id, isNew, navigate, reset]);

  const onSubmit = async (data) => {
    const slug = String(data.slug ?? "").trim().toLowerCase();
    if (isNew && !SLUG_RE.test(slug)) {
      toast.error("Slug must contain only lowercase letters, numbers, - or _.");
      return;
    }
    const v = validateForm(data);
    if (v) {
      toast.error(v);
      return;
    }
    const body = {
      nameEn: data.nameEn.trim(),
      nameUr: data.nameUr.trim(),
      icon: data.icon,
      order: Number(data.order),
      showInPests: !!data.showInPests,
    };
    try {
      if (isNew) {
        body.id = slug;
        await api.post("/api/learning-crops", body);
        trackEvent("admin_learning_crop_create", { crop_id: slug });
        toast.success("Crop created");
      } else {
        await api.put(`/api/learning-crops/${id}`, body);
        trackEvent("admin_learning_crop_update", { crop_id: id });
        toast.success("Crop updated");
      }
      navigate("/learning/crops");
    } catch (e) {
      const msg = e.response?.data?.errors?.join?.(", ") || e.response?.data?.error;
      toast.error(msg || "Save failed");
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
        to="/learning/crops"
        className="mb-4 inline-flex items-center gap-2 text-sm text-slate-600 hover:text-brand-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to crops
      </Link>

      <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
        {isNew ? "Add crop" : "Edit crop"}
      </h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mx-auto mt-6 w-full max-w-2xl space-y-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
      >
        <div>
          <label className="mb-1 block text-sm font-medium">Crop ID / slug</label>
          <input
            className="w-full max-w-md rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono disabled:bg-slate-100 disabled:text-slate-500"
            placeholder="e.g. wheat"
            disabled={!isNew}
            {...register("slug")}
          />
          <p className="mt-1 text-xs text-slate-500">
            Lowercase letters, numbers, - or _ only. Cannot be changed after creation.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Name (English)</label>
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              {...register("nameEn")}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Name (Urdu)</label>
            <input
              dir="rtl"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              {...register("nameUr")}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
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

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" {...register("showInPests")} />
          Show in "Pests & Diseases" module
        </label>

        <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:gap-3">
          <button
            type="submit"
            className="order-2 w-full rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 sm:order-1 sm:w-auto"
          >
            Save
          </button>
          <Link
            to="/learning/crops"
            className="order-1 w-full rounded-lg border border-slate-300 px-5 py-2.5 text-center text-sm hover:bg-slate-50 sm:order-2 sm:w-auto"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
