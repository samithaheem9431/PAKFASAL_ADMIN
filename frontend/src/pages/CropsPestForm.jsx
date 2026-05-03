import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { api, uploadFile } from "../services/api.js";
import toast from "react-hot-toast";
import { Spinner } from "../components/Spinner.jsx";
import { ArrowLeft, Upload } from "lucide-react";
import { trackEvent } from "../services/analytics.js";
import { readBilingualField } from "../utils/bilingual.js";

function validateCrop(data) {
  const ce = data.cropNameEn?.trim();
  const cu = data.cropNameUr?.trim();
  if (!ce && !cu) return "Fill crop name in at least English or Urdu.";
  return null;
}

export function CropsPestForm() {
  const { id } = useParams();
  const isNew = !id || id === "new";
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!isNew);
  const [uploading, setUploading] = useState(false);

  const { register, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: {
      cropNameEn: "",
      cropNameUr: "",
      diseaseNameEn: "",
      diseaseNameUr: "",
      symptomsEn: "",
      symptomsUr: "",
      treatmentEn: "",
      treatmentUr: "",
      images: [],
    },
  });
  const images = watch("images") || [];

  useEffect(() => {
    if (isNew) return;
    let cancel = false;
    (async () => {
      try {
        const { data } = await api.get("/api/crops-pests");
        const row = data.items?.find((x) => x.id === id);
        if (!row) {
          toast.error("Not found");
          navigate("/crops-diseases");
          return;
        }
        if (cancel) return;
        const cn = readBilingualField(row.cropName);
        const dn = readBilingualField(row.diseaseName);
        const sy = readBilingualField(row.symptoms);
        const tr = readBilingualField(row.treatment);
        reset({
          cropNameEn: cn.en,
          cropNameUr: cn.ur,
          diseaseNameEn: dn.en,
          diseaseNameUr: dn.ur,
          symptomsEn: sy.en,
          symptomsUr: sy.ur,
          treatmentEn: tr.en,
          treatmentUr: tr.ur,
          images: row.images ?? [],
        });
      } catch (e) {
        toast.error("Failed to load");
        navigate("/crops-diseases");
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [id, isNew, navigate, reset]);

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await uploadFile(file);
      setValue("images", [...images, url]);
      toast.success("Uploaded");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data) => {
    const v = validateCrop(data);
    if (v) {
      toast.error(v);
      return;
    }
    const body = {
      cropName: {
        en: data.cropNameEn?.trim() || "",
        ur: data.cropNameUr?.trim() || "",
      },
      diseaseName: {
        en: data.diseaseNameEn?.trim() || "",
        ur: data.diseaseNameUr?.trim() || "",
      },
      symptoms: {
        en: data.symptomsEn?.trim() || "",
        ur: data.symptomsUr?.trim() || "",
      },
      treatment: {
        en: data.treatmentEn?.trim() || "",
        ur: data.treatmentUr?.trim() || "",
      },
      images,
    };
    try {
      if (isNew) {
        await api.post("/api/crops-pests", body);
        trackEvent("admin_crop_disease_create", {});
        toast.success("Created");
      } else {
        await api.put(`/api/crops-pests/${id}`, body);
        trackEvent("admin_crop_disease_update", { record_id: id });
        toast.success("Updated");
      }
      navigate("/crops-diseases");
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
        to="/crops-diseases"
        className="mb-4 inline-flex items-center gap-2 text-sm text-slate-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>
      <h1 className="text-xl font-bold sm:text-2xl">
        {isNew ? "Add crop / disease" : "Edit entry"}
      </h1>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-6 w-full max-w-3xl space-y-4 rounded-xl border border-slate-200 bg-white p-4 sm:p-6"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Crop name (English) *</label>
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              {...register("cropNameEn")}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Crop name (Urdu)</label>
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              dir="rtl"
              {...register("cropNameUr")}
            />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Disease name (English)</label>
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              {...register("diseaseNameEn")}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Disease name (Urdu)</label>
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              dir="rtl"
              {...register("diseaseNameUr")}
            />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Symptoms (English)</label>
            <textarea
              rows={3}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              {...register("symptomsEn")}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Symptoms (Urdu)</label>
            <textarea
              rows={3}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              dir="rtl"
              {...register("symptomsUr")}
            />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Treatment (English)</label>
            <textarea
              rows={3}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              {...register("treatmentEn")}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Treatment (Urdu)</label>
            <textarea
              rows={3}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              dir="rtl"
              {...register("treatmentUr")}
            />
          </div>
        </div>
        <div>
          <p className="mb-2 text-sm font-medium">Images</p>
          <div className="flex flex-wrap gap-2">
            {images.map((url) => (
              <div key={url} className="relative">
                <img src={url} alt="" className="h-20 w-20 rounded border object-cover" />
                <button
                  type="button"
                  onClick={() =>
                    setValue(
                      "images",
                      images.filter((u) => u !== url)
                    )
                  }
                  className="absolute -right-1 -top-1 rounded-full bg-red-500 px-1 text-xs text-white"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <label className="mt-2 inline-flex cursor-pointer items-center gap-2 rounded border border-dashed px-3 py-2 text-sm">
            <Upload className="h-4 w-4" />
            {uploading ? "…" : "Upload"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onFile}
              disabled={uploading}
            />
          </label>
        </div>
        <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:gap-3">
          <button
            type="submit"
            className="w-full rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white sm:w-auto"
          >
            Save
          </button>
          <Link
            to="/crops-diseases"
            className="w-full rounded-lg border px-5 py-2.5 text-center text-sm sm:w-auto"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
