import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { api, uploadFile } from "../services/api.js";
import toast from "react-hot-toast";
import { Spinner } from "../components/Spinner.jsx";
import { Plus, Trash2, Upload } from "lucide-react";
import { trackEvent } from "../services/analytics.js";

export function Cultivation() {
  const [crops, setCrops] = useState([]);
  const [cropId, setCropId] = useState("");
  const [stages, setStages] = useState([]);
  const [loadingCrops, setLoadingCrops] = useState(true);
  const [loadingStages, setLoadingStages] = useState(false);
  const [newCropName, setNewCropName] = useState("");

  const { register, control, handleSubmit, reset, setValue } = useForm({
    defaultValues: { steps: [{ title: "", description: "", image: "", order: 0 }] },
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
    if (!newCropName.trim()) return;
    try {
      const { data } = await api.post("/api/crops", { name: newCropName.trim() });
      trackEvent("admin_crop_create", { crop_name: newCropName.trim() });
      toast.success("Crop added");
      setNewCropName("");
      setCrops((c) => [...c, { id: data.id, name: data.name }]);
      setCropId(data.id);
    } catch (e) {
      toast.error(e.response?.data?.error || "Failed");
    }
  };

  const onCreateDoc = handleSubmit(async (form) => {
    if (!cropId) {
      toast.error("Select a crop");
      return;
    }
    const steps = form.steps.map((s, i) => ({
      title: s.title?.trim() || `Step ${i + 1}`,
      description: s.description?.trim() || "",
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
      reset({ steps: [{ title: "", description: "", image: "", order: 0 }] });
      loadStages(cropId);
    } catch (e) {
      toast.error(e.response?.data?.error || "Save failed");
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
    <div>
      <h1 className="text-2xl font-bold">Cultivation stages</h1>
      <p className="text-slate-600">Per-crop step sequences (nested under crops)</p>

      <div className="mt-6 flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 lg:flex-row lg:items-end">
        <div className="flex-1">
          <label className="mb-1 block text-sm font-medium">Crop</label>
          {loadingCrops ? (
            <Spinner className="h-6 w-6" />
          ) : (
            <select
              className="w-full max-w-md rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={cropId}
              onChange={(e) => setCropId(e.target.value)}
            >
              <option value="">Select crop</option>
              {crops.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name || c.id}
                </option>
              ))}
            </select>
          )}
        </div>
        <form onSubmit={addCrop} className="flex flex-wrap gap-2">
          <input
            placeholder="New crop name"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            value={newCropName}
            onChange={(e) => setNewCropName(e.target.value)}
          />
          <button
            type="submit"
            className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white"
          >
            Add crop
          </button>
        </form>
      </div>

      {cropId && (
        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="text-lg font-semibold">Add cultivation document</h2>
            <p className="text-sm text-slate-600">
              One document contains an ordered list of steps.
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
                  <input
                    className="w-full rounded border px-2 py-1 text-sm"
                    placeholder="Title"
                    {...register(`steps.${index}.title`)}
                  />
                  <textarea
                    className="w-full rounded border px-2 py-1 text-sm"
                    rows={2}
                    placeholder="Description"
                    {...register(`steps.${index}.description`)}
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      className="min-w-0 flex-1 rounded border px-2 py-1 text-sm"
                      placeholder="Image URL"
                      {...register(`steps.${index}.image`)}
                    />
                    <StepUpload
                      index={index}
                      setValue={setValue}
                    />
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
                  append({ title: "", description: "", image: "", order: fields.length })
                }
                className="inline-flex items-center gap-1 text-sm text-brand-600"
              >
                <Plus className="h-4 w-4" />
                Add step
              </button>
              <div>
                <button
                  type="submit"
                  className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white"
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
                          <strong>{s.title}</strong>
                          {s.image && (
                            <img
                              src={s.image}
                              alt=""
                              className="mt-1 h-16 w-16 rounded object-cover"
                            />
                          )}
                          <p className="text-slate-600">{s.description}</p>
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
