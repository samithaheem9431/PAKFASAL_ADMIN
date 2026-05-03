import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { api, uploadFile } from "../services/api.js";
import toast from "react-hot-toast";
import { Spinner } from "../components/Spinner.jsx";
import { Plus, Trash2, Upload } from "lucide-react";
import { trackEvent } from "../services/analytics.js";
import { displayBilingual } from "../utils/bilingual.js";

const emptyStep = {
  titleEn: "",
  titleUr: "",
  descEn: "",
  descUr: "",
  image: "",
  order: 0,
};

export function Cultivation() {
  const [crops, setCrops] = useState([]);
  const [cropId, setCropId] = useState("");
  const [stages, setStages] = useState([]);
  const [loadingCrops, setLoadingCrops] = useState(true);
  const [loadingStages, setLoadingStages] = useState(false);
  const [newCropNameEn, setNewCropNameEn] = useState("");
  const [newCropNameUr, setNewCropNameUr] = useState("");

  const { register, control, handleSubmit, reset, setValue } = useForm({
    defaultValues: { steps: [{ ...emptyStep }] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "steps" });

  const loadCrops = async () => {
    setLoadingCrops(true);
    try {
      const { data } = await api.get("/api/crops");
      setCrops(data.items || []);
      if (!cropId && data.items?.length) setCropId(data.items[0].id);
    } catch (e) {
      toast.error(e.response?.data?.error || "Failed to load crops");
    } finally {
      setLoadingCrops(false);
    }
  };

  const loadStages = async (cid) => {
    if (!cid) {
      setStages([]);
      return;
    }
    setLoadingStages(true);
    try {
      const { data } = await api.get(`/api/crops/${cid}/stages`);
      setStages(data.items || []);
    } catch (e) {
      toast.error(e.response?.data?.error || "Failed to load stages");
    } finally {
      setLoadingStages(false);
    }
  };

  useEffect(() => {
    loadCrops();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (cropId) loadStages(cropId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cropId]);

  const addCrop = async (e) => {
    e.preventDefault();
    const en = newCropNameEn.trim();
    const ur = newCropNameUr.trim();
    if (!en && !ur) {
      toast.error("Enter crop name in at least English or Urdu");
      return;
    }
    try {
      const { data } = await api.post("/api/crops", {
        name: { en, ur },
      });
      trackEvent("admin_crop_create", { crop_name: en || ur });
      toast.success("Crop added");
      setNewCropNameEn("");
      setNewCropNameUr("");
      setCrops((c) => [...c, { id: data.id, name: data.name }]);
      setCropId(data.id);
    } catch (e) {
      const errs = e.response?.data?.errors;
      toast.error(
        Array.isArray(errs) ? errs.join(" ") : e.response?.data?.error || "Failed"
      );
    }
  };

  const onCreateDoc = handleSubmit(async (form) => {
    if (!cropId) {
      toast.error("Select a crop");
      return;
    }
    const steps = form.steps.map((s, i) => ({
      title: {
        en: s.titleEn?.trim() || "",
        ur: s.titleUr?.trim() || "",
      },
      description: {
        en: s.descEn?.trim() || "",
        ur: s.descUr?.trim() || "",
      },
      image: s.image?.trim() || "",
      order: typeof s.order === "number" ? s.order : i,
    }));
    try {
      await api.post(`/api/crops/${cropId}/stages`, { steps });
      trackEvent("admin_cultivation_doc_create", {
        crop_id: cropId,
        steps_count: steps.length,
      });
      toast.success("Cultivation doc added");
      reset({ steps: [{ ...emptyStep }] });
      loadStages(cropId);
    } catch (e) {
      const errs = e.response?.data?.errors;
      toast.error(
        Array.isArray(errs) ? errs.join(" ") : e.response?.data?.error || "Save failed"
      );
    }
  });

  const deleteDoc = async (sid) => {
    if (!confirm("Delete this cultivation document?")) return;
    try {
      await api.delete(`/api/crops/${cropId}/stages/${sid}`);
      trackEvent("admin_cultivation_doc_delete", { crop_id: cropId, stage_id: sid });
      toast.success("Removed");
      loadStages(cropId);
    } catch (e) {
      toast.error(e.response?.data?.error || "Failed");
    }
  };

  return (
    <div className="w-full min-w-0 max-w-full">
      <h1 className="text-xl font-bold sm:text-2xl">Cultivation stages</h1>
      <p className="text-sm text-slate-600 sm:text-base">
        Per-crop step sequences (nested under crops)
      </p>

      <div className="mt-6 flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 lg:flex-row lg:items-end">
        <div className="min-w-0 flex-1">
          <label className="mb-1 block text-sm font-medium">Crop</label>
          {loadingCrops ? (
            <Spinner className="h-6 w-6" />
          ) : (
            <select
              className="w-full max-w-full rounded-lg border border-slate-300 px-3 py-2 text-sm sm:max-w-md"
              value={cropId}
              onChange={(e) => setCropId(e.target.value)}
            >
              <option value="">Select crop</option>
              {crops.map((c) => (
                <option key={c.id} value={c.id}>
                  {displayBilingual(c.name) || c.id}
                </option>
              ))}
            </select>
          )}
        </div>
        <form
          onSubmit={addCrop}
          className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-end"
        >
          <input
            placeholder="New crop (English)"
            className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm sm:min-w-[10rem] sm:flex-none"
            value={newCropNameEn}
            onChange={(e) => setNewCropNameEn(e.target.value)}
          />
          <input
            placeholder="New crop (Urdu)"
            className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm sm:min-w-[10rem] sm:flex-none"
            dir="rtl"
            value={newCropNameUr}
            onChange={(e) => setNewCropNameUr(e.target.value)}
          />
          <button
            type="submit"
            className="w-full shrink-0 rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white sm:w-auto"
          >
            Add crop
          </button>
        </form>
      </div>

      {cropId && (
        <div className="mt-8 grid gap-6 lg:grid-cols-2 lg:gap-8">
          <div>
            <h2 className="text-lg font-semibold">Add cultivation document</h2>
            <p className="text-sm text-slate-600">
              One document contains an ordered list of steps. Fill English and/or Urdu for each
              field.
            </p>
            <form onSubmit={onCreateDoc} className="mt-4 space-y-3">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="rounded-lg border border-slate-200 p-3 space-y-2"
                >
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Step {index + 1}</span>
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <input
                      className="w-full rounded border px-2 py-1 text-sm"
                      placeholder="Title (English)"
                      {...register(`steps.${index}.titleEn`)}
                    />
                    <input
                      className="w-full rounded border px-2 py-1 text-sm"
                      placeholder="Title (Urdu)"
                      dir="rtl"
                      {...register(`steps.${index}.titleUr`)}
                    />
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <textarea
                      className="w-full rounded border px-2 py-1 text-sm"
                      rows={2}
                      placeholder="Description (English)"
                      {...register(`steps.${index}.descEn`)}
                    />
                    <textarea
                      className="w-full rounded border px-2 py-1 text-sm"
                      rows={2}
                      placeholder="Description (Urdu)"
                      dir="rtl"
                      {...register(`steps.${index}.descUr`)}
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      className="min-w-0 flex-1 rounded border px-2 py-1 text-sm"
                      placeholder="Image URL"
                      {...register(`steps.${index}.image`)}
                    />
                    <StepUpload index={index} setValue={setValue} />
                  </div>
                  <input
                    type="number"
                    className="w-24 rounded border px-2 py-1 text-sm"
                    placeholder="Order"
                    {...register(`steps.${index}.order`, { valueAsNumber: true })}
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  append({
                    ...emptyStep,
                    order: fields.length,
                  })
                }
                className="inline-flex items-center gap-1 text-sm text-brand-600"
              >
                <Plus className="h-4 w-4" />
                Add step
              </button>
              <div>
                <button
                  type="submit"
                  className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white sm:w-auto"
                >
                  Save cultivation doc
                </button>
              </div>
            </form>
          </div>

          <div>
            <h2 className="text-lg font-semibold">Existing documents</h2>
            {loadingStages ? (
              <div className="py-8">
                <Spinner className="h-8 w-8" />
              </div>
            ) : (
              <ul className="mt-4 space-y-4">
                {stages.map((doc) => (
                  <li
                    key={doc.id}
                    className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs text-slate-500">ID: {doc.id}</span>
                      <button
                        type="button"
                        onClick={() => deleteDoc(doc.id)}
                        className="text-sm text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                    <ol className="list-decimal space-y-2 pl-4 text-sm">
                      {(doc.steps || []).map((s, i) => (
                        <li key={i}>
                          <strong>{displayBilingual(s.title)}</strong>
                          {s.image && (
                            <img
                              src={s.image}
                              alt=""
                              className="mt-1 h-16 w-16 rounded object-cover"
                            />
                          )}
                          <p className="text-slate-600">{displayBilingual(s.description)}</p>
                        </li>
                      ))}
                    </ol>
                  </li>
                ))}
              </ul>
            )}
            {!loadingStages && stages.length === 0 && (
              <p className="mt-4 text-slate-500">No documents for this crop yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StepUpload({ index, setValue }) {
  const [busy, setBusy] = useState(false);
  return (
    <label className="inline-flex cursor-pointer items-center gap-1 rounded border border-dashed px-2 py-1 text-xs">
      <Upload className="h-3 w-3" />
      {busy ? "…" : "Upload"}
      <input
        type="file"
        accept="image/*"
        className="hidden"
        disabled={busy}
        onChange={async (e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (!f) return;
          setBusy(true);
          try {
            const { url } = await uploadFile(f);
            setValue(`steps.${index}.image`, url);
            toast.success("Image added");
          } catch (err) {
            toast.error(err.message);
          } finally {
            setBusy(false);
          }
        }}
      />
    </label>
  );
}
