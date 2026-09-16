import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { api, uploadFile } from "../services/api.js";
import toast from "react-hot-toast";
import { Spinner } from "../components/Spinner.jsx";
import { ArrowLeft, Upload } from "lucide-react";
import { trackEvent } from "../services/analytics.js";
import { clearCache } from "../utils/offlineCache.js";

const PROVINCES = [
  "All Pakistan",
  "Punjab",
  "Sindh",
  "Khyber Pakhtunkhwa",
  "Balochistan",
  "Gilgit-Baltistan",
  "Azad Jammu & Kashmir",
  "Islamabad Capital Territory",
];

const STATUSES = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "closed", label: "Closed" },
];

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
  if (!data.titleEn?.trim()) return "Scheme title (English) is required.";
  if (!data.titleUr?.trim()) return "Scheme title (Urdu) is required.";
  if (!data.descriptionEn?.trim()) return "Short description (English) is required.";
  if (!data.descriptionUr?.trim()) return "Short description (Urdu) is required.";
  if (!data.categoryEn?.trim()) return "Category (English) is required.";
  if (!data.categoryUr?.trim()) return "Category (Urdu) is required.";
  if (!data.departmentEn?.trim()) return "Department (English) is required.";
  if (!data.departmentUr?.trim()) return "Department (Urdu) is required.";
  if (!data.province?.trim()) return "Province is required.";
  if (!textToArr(data.eligibilityEn).length) {
    return "At least one eligibility point (English) is required.";
  }
  if (!textToArr(data.eligibilityUr).length) {
    return "At least one eligibility point (Urdu) is required.";
  }
  if (!textToArr(data.benefitsEn).length) {
    return "At least one benefit (English) is required.";
  }
  if (!textToArr(data.benefitsUr).length) {
    return "At least one benefit (Urdu) is required.";
  }
  if (data.order === "" || Number.isNaN(Number(data.order))) {
    return "Order must be a number.";
  }
  return null;
}

export function GovtSchemeForm() {
  const { id } = useParams();
  const isNew = !id || id === "new";
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState([]);

  const { register, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: {
      titleEn: "",
      titleUr: "",
      descriptionEn: "",
      descriptionUr: "",
      categoryEn: "",
      categoryUr: "",
      departmentEn: "",
      departmentUr: "",
      province: "All Pakistan",
      eligibilityEn: "",
      eligibilityUr: "",
      benefitsEn: "",
      benefitsUr: "",
      deadline: "",
      status: "active",
      applyUrl: "",
      website: "",
      imageUrl: "",
      featured: false,
      order: 0,
    },
  });

  const imageUrl = watch("imageUrl") || "";

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const { data } = await api.get("/api/govt-schemes");
        if (cancel) return;
        const cats = new Set();
        (data.items || []).forEach((s) => {
          if (s.categoryEn) cats.add(s.categoryEn);
        });
        setCategories([...cats].sort());
      } catch {
        // Category suggestions are optional.
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
        const { data } = await api.get("/api/govt-schemes");
        const s = data.items?.find((x) => x.id === id);
        if (!s) {
          toast.error("Scheme not found");
          navigate("/govt-schemes");
          return;
        }
        if (cancel) return;
        reset({
          titleEn: s.titleEn ?? "",
          titleUr: s.titleUr ?? "",
          descriptionEn: s.descriptionEn ?? "",
          descriptionUr: s.descriptionUr ?? "",
          categoryEn: s.categoryEn ?? "",
          categoryUr: s.categoryUr ?? "",
          departmentEn: s.departmentEn ?? "",
          departmentUr: s.departmentUr ?? "",
          province: s.province || "All Pakistan",
          eligibilityEn: arrToText(s.eligibilityEn),
          eligibilityUr: arrToText(s.eligibilityUr),
          benefitsEn: arrToText(s.benefitsEn),
          benefitsUr: arrToText(s.benefitsUr),
          deadline: s.deadline ?? "",
          status: s.status || "active",
          applyUrl: s.applyUrl ?? "",
          website: s.website ?? "",
          imageUrl: s.imageUrl ?? "",
          featured: !!s.featured,
          order: s.order ?? 0,
        });
      } catch (e) {
        toast.error(e.response?.data?.error || "Failed to load");
        navigate("/govt-schemes");
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
      setValue("imageUrl", url, { shouldDirty: true, shouldValidate: true });
      toast.success("Image uploaded");
    } catch (err) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data) => {
    const v = validateForm(data);
    if (v) {
      toast.error(v);
      return;
    }
    setSaving(true);
    const body = {
      titleEn: data.titleEn.trim(),
      titleUr: data.titleUr.trim(),
      descriptionEn: data.descriptionEn.trim(),
      descriptionUr: data.descriptionUr.trim(),
      categoryEn: data.categoryEn.trim(),
      categoryUr: data.categoryUr.trim(),
      departmentEn: data.departmentEn.trim(),
      departmentUr: data.departmentUr.trim(),
      province: data.province.trim(),
      eligibilityEn: textToArr(data.eligibilityEn),
      eligibilityUr: textToArr(data.eligibilityUr),
      benefitsEn: textToArr(data.benefitsEn),
      benefitsUr: textToArr(data.benefitsUr),
      deadline: (data.deadline || "").trim(),
      status: data.status,
      applyUrl: (data.applyUrl || "").trim(),
      website: (data.website || "").trim(),
      imageUrl: (imageUrl || data.imageUrl || "").trim(),
      featured: !!data.featured,
      order: Number(data.order),
    };
    try {
      if (isNew) {
        const { data: created } = await api.post("/api/govt-schemes", body);
        trackEvent("admin_govt_scheme_create", { scheme_id: created.id });
        toast.success("Scheme created");
      } else {
        await api.put(`/api/govt-schemes/${id}`, body);
        trackEvent("admin_govt_scheme_update", { scheme_id: id });
        toast.success("Scheme updated");
      }
      clearCache("govt-schemes");
      navigate("/govt-schemes");
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
        to="/govt-schemes"
        className="mb-4 inline-flex items-center gap-2 text-sm text-slate-600 hover:text-brand-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to govt schemes
      </Link>

      <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
        {isNew ? "Add govt scheme" : "Edit govt scheme"}
      </h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mx-auto mt-6 w-full max-w-3xl space-y-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Scheme title (English)</label>
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              {...register("titleEn")}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Scheme title (Urdu)</label>
            <input
              dir="rtl"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              {...register("titleUr")}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Short description (English)</label>
            <textarea
              rows={3}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              {...register("descriptionEn")}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Short description (Urdu)</label>
            <textarea
              dir="rtl"
              rows={3}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              {...register("descriptionUr")}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Category (English)</label>
            <input
              list="scheme-category-suggestions"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              placeholder="e.g. Subsidy, Loan, Insurance"
              {...register("categoryEn")}
            />
            <datalist id="scheme-category-suggestions">
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
            <label className="mb-1 block text-sm font-medium">Department (English)</label>
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              placeholder="e.g. Ministry of National Food Security"
              {...register("departmentEn")}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Department (Urdu)</label>
            <input
              dir="rtl"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              {...register("departmentUr")}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Province</label>
            <select
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              {...register("province")}
            >
              {PROVINCES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Deadline (optional)</label>
            <input
              type="date"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              {...register("deadline")}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Eligibility (English)</label>
            <textarea
              rows={4}
              placeholder={"One point per line"}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              {...register("eligibilityEn")}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Eligibility (Urdu)</label>
            <textarea
              dir="rtl"
              rows={4}
              placeholder={"ایک سطر میں ایک نکتہ"}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              {...register("eligibilityUr")}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Benefits (English)</label>
            <textarea
              rows={4}
              placeholder={"One benefit per line"}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              {...register("benefitsEn")}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Benefits (Urdu)</label>
            <textarea
              dir="rtl"
              rows={4}
              placeholder={"ایک سطر میں ایک فائدہ"}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              {...register("benefitsUr")}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Apply link</label>
            <input
              type="url"
              placeholder="https://…"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              {...register("applyUrl")}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Official website</label>
            <input
              type="url"
              placeholder="https://…"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              {...register("website")}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium">Status</label>
            <select
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              {...register("status")}
            >
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
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
          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" className="rounded border-slate-300" {...register("featured")} />
              Featured scheme
            </label>
          </div>
        </div>

        <input type="hidden" {...register("imageUrl")} />

        <div>
          <p className="mb-2 text-sm font-medium">Image (optional)</p>
          {imageUrl ? (
            <div className="relative mb-2 inline-block">
              <img
                src={imageUrl}
                alt=""
                className="h-28 w-28 rounded-lg border border-slate-200 object-cover"
              />
              <button
                type="button"
                onClick={() => setValue("imageUrl", "")}
                className="absolute -right-1 -top-1 rounded-full bg-red-500 px-1.5 text-xs text-white"
              >
                ×
              </button>
            </div>
          ) : null}
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-slate-300 px-4 py-2 text-sm hover:bg-slate-50">
            <Upload className="h-4 w-4" />
            {uploading ? "Uploading…" : imageUrl ? "Replace image" : "Upload image"}
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
            disabled={saving}
            className="order-2 w-full rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60 sm:order-1 sm:w-auto"
          >
            {saving ? "Saving…" : "Save"}
          </button>
          <Link
            to="/govt-schemes"
            className="order-1 w-full rounded-lg border border-slate-300 px-5 py-2.5 text-center text-sm hover:bg-slate-50 sm:order-2 sm:w-auto"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
