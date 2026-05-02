import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { api, uploadFile } from "../services/api.js";
import toast from "react-hot-toast";
import { Spinner } from "../components/Spinner.jsx";
import { ArrowLeft, Upload } from "lucide-react";
import { trackEvent } from "../services/analytics.js";

export function CropsPestForm() {
  const { id } = useParams();
  const isNew = !id || id === "new";
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!isNew);
  const [uploading, setUploading] = useState(false);

  const { register, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: {
      cropName: "",
      diseaseName: "",
      symptoms: "",
      treatment: "",
      language: "en",
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
        reset({
          cropName: row.cropName ?? "",
          diseaseName: row.diseaseName ?? "",
          symptoms: row.symptoms ?? "",
          treatment: row.treatment ?? "",
          language: row.language ?? "en",
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
    if (!data.cropName?.trim()) {
      toast.error("Crop name is required");
      return;
    }
    const body = {
      cropName: data.cropName.trim(),
      diseaseName: data.diseaseName?.trim() || "",
      symptoms: data.symptoms?.trim() || "",
      treatment: data.treatment?.trim() || "",
      language: data.language || "en",
      images,
    };
    try {
      if (isNew) {
        await api.post("/api/crops-pests", body);
        trackEvent("admin_crop_disease_create", { language: body.language });
        toast.success("Created");
      } else {
        await api.put(`/api/crops-pests/${id}`, body);
        trackEvent("admin_crop_disease_update", { record_id: id, language: body.language });
        toast.success("Updated");
      }
      navigate("/crops-diseases");
    } catch (e) {
      toast.error(e.response?.data?.error || "Save failed");
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
    <div>
      <Link
        to="/crops-diseases"
        className="mb-4 inline-flex items-center gap-2 text-sm text-slate-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>
      <h1 className="text-2xl font-bold">
        {isNew ? "Add crop / disease" : "Edit entry"}
      </h1>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-6 max-w-2xl space-y-4 rounded-xl border border-slate-200 bg-white p-6"
      >
        <div>
          <label className="mb-1 block text-sm font-medium">Crop name *</label>
          <input
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            {...register("cropName", { required: true })}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Disease name</label>
          <input
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            {...register("diseaseName")}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Symptoms</label>
          <textarea
            rows={3}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            {...register("symptoms")}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Treatment</label>
          <textarea
            rows={3}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            {...register("treatment")}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Language</label>
          <select
            className="w-full max-w-xs rounded-lg border border-slate-300 px-3 py-2 text-sm"
            {...register("language")}
          >
            <option value="en">English</option>
            <option value="ur">Urdu</option>
          </select>
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
        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            className="rounded-lg bg-brand-600 px-5 py-2 text-sm font-semibold text-white"
          >
            Save
          </button>
          <Link to="/crops-diseases" className="rounded-lg border px-5 py-2 text-sm">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
