import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { api } from "../services/api.js";
import toast from "react-hot-toast";
import { Spinner } from "../components/Spinner.jsx";
import { ArrowLeft } from "lucide-react";
import { trackEvent } from "../services/analytics.js";
import { fetchWithCache } from "../utils/offlineCache.js";

const CROPS_CACHE_KEY = "learning-crops";

function arrToText(arr) {
  return Array.isArray(arr) ? arr.join("\n") : "";
}

function textToArr(text) {
  return String(text ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

function validateForm(data) {
  if (!data.cropId) return "Please choose a crop.";
  if (data.order === "" || Number.isNaN(Number(data.order))) return "Order must be a number.";
  if (!data.nameEn?.trim()) return "Name (English) is required.";
  if (!data.nameUr?.trim()) return "Name (Urdu) is required.";
  if (!data.descriptionEn?.trim()) return "Description (English) is required.";
  if (!data.descriptionUr?.trim()) return "Description (Urdu) is required.";
  if (!textToArr(data.symptomsEn).length) return "At least one symptom (English) is required.";
  if (!textToArr(data.symptomsUr).length) return "At least one symptom (Urdu) is required.";
  if (!textToArr(data.solutionsEn).length) return "At least one solution (English) is required.";
  if (!textToArr(data.solutionsUr).length) return "At least one solution (Urdu) is required.";
  return null;
}

export function CropDiseaseForm() {
  const { id } = useParams();
  const isNew = !id || id === "new";
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!isNew);
  const [crops, setCrops] = useState([]);

  const { register, control, handleSubmit, reset } = useForm({
    defaultValues: {
      cropId: "",
      order: 0,
      nameEn: "",
      nameUr: "",
      descriptionEn: "",
      descriptionUr: "",
      symptomsEn: "",
      symptomsUr: "",
      solutionsEn: "",
      solutionsUr: "",
    },
  });

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const { data, fromCache } = await fetchWithCache(CROPS_CACHE_KEY, async () => {
          const res = await api.get("/api/learning-crops");
          return res.data.items || [];
        });
        if (cancel) return;
        setCrops(data);
        if (fromCache) {
          toast("You're offline — showing cached crop list", { icon: "📴" });
        }
      } catch (e) {
        toast.error(e.response?.data?.error || "Failed to load crops");
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
        const { data } = await api.get("/api/crop-diseases");
        const d = data.items?.find((x) => x.id === id);
        if (!d) {
          toast.error("Entry not found");
          navigate("/learning/diseases");
          return;
        }
        if (cancel) return;
        reset({
          cropId: d.cropId ?? "",
          order: d.order ?? 0,
          nameEn: d.nameEn ?? "",
          nameUr: d.nameUr ?? "",
          descriptionEn: d.descriptionEn ?? "",
          descriptionUr: d.descriptionUr ?? "",
          symptomsEn: arrToText(d.symptomsEn),
          symptomsUr: arrToText(d.symptomsUr),
          solutionsEn: arrToText(d.solutionsEn),
          solutionsUr: arrToText(d.solutionsUr),
        });
      } catch (e) {
        toast.error(e.response?.data?.error || "Failed to load");
        navigate("/learning/diseases");
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
    const body = {
      cropId: data.cropId,
      order: Number(data.order),
      nameEn: data.nameEn.trim(),
      nameUr: data.nameUr.trim(),
      descriptionEn: data.descriptionEn.trim(),
      descriptionUr: data.descriptionUr.trim(),
      symptomsEn: textToArr(data.symptomsEn),
      symptomsUr: textToArr(data.symptomsUr),
      solutionsEn: textToArr(data.solutionsEn),
      solutionsUr: textToArr(data.solutionsUr),
    };
    try {
      if (isNew) {
        await api.post("/api/crop-diseases", body);
        trackEvent("admin_crop_disease_create", { crop_id: body.cropId });
        toast.success("Created");
      } else {
        await api.put(`/api/crop-diseases/${id}`, body);
        trackEvent("admin_crop_disease_update", { disease_id: id });
        toast.success("Updated");
      }
      navigate("/learning/diseases");
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
        to="/learning/diseases"
        className="mb-4 inline-flex items-center gap-2 text-sm text-slate-600 hover:text-brand-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to pests & diseases
      </Link>

      <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
        {isNew ? "Add pest/disease" : "Edit pest/disease"}
      </h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mx-auto mt-6 w-full max-w-2xl space-y-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Crop</label>
            <Controller
              name="cropId"
              control={control}
              render={({ field }) => (
                <select
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  {...field}
                >
                  <option value="">Select a crop…</option>
                  {crops.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nameEn}
                    </option>
                  ))}
                </select>
              )}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Display order (within crop)</label>
            <input
              type="number"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              {...register("order", { valueAsNumber: true })}
            />
          </div>
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
            <label className="mb-1 block text-sm font-medium">Description (English)</label>
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              {...register("descriptionEn")}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Description (Urdu)</label>
            <input
              dir="rtl"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              {...register("descriptionUr")}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Symptoms (English)</label>
            <textarea
              rows={4}
              placeholder={"One symptom per line"}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              {...register("symptomsEn")}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Symptoms (Urdu)</label>
            <textarea
              dir="rtl"
              rows={4}
              placeholder={"ایک سطر میں ایک علامت"}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              {...register("symptomsUr")}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Treatment / solutions (English)</label>
            <textarea
              rows={4}
              placeholder={"One tip per line"}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              {...register("solutionsEn")}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Treatment / solutions (Urdu)</label>
            <textarea
              dir="rtl"
              rows={4}
              placeholder={"ایک سطر میں ایک نکتہ"}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              {...register("solutionsUr")}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:gap-3">
          <button
            type="submit"
            className="order-2 w-full rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 sm:order-1 sm:w-auto"
          >
            Save
          </button>
          <Link
            to="/learning/diseases"
            className="order-1 w-full rounded-lg border border-slate-300 px-5 py-2.5 text-center text-sm hover:bg-slate-50 sm:order-2 sm:w-auto"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
