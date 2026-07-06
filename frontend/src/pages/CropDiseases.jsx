import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil, WifiOff } from "lucide-react";
import { api } from "../services/api.js";
import { Spinner } from "../components/Spinner.jsx";
import toast from "react-hot-toast";
import { trackEvent } from "../services/analytics.js";
import { fetchWithCache, formatCacheTimestamp } from "../utils/offlineCache.js";

const DISEASES_CACHE_KEY = "crop-diseases";
const CROPS_CACHE_KEY = "learning-crops";

export function CropDiseases() {
  const [items, setItems] = useState([]);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offlineInfo, setOfflineInfo] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [d, c] = await Promise.all([
        fetchWithCache(DISEASES_CACHE_KEY, async () => {
          const res = await api.get("/api/crop-diseases");
          return res.data.items || [];
        }),
        fetchWithCache(CROPS_CACHE_KEY, async () => {
          const res = await api.get("/api/learning-crops");
          return res.data.items || [];
        }),
      ]);
      setItems(d.data);
      setCrops(c.data);
      const fromCache = d.fromCache || c.fromCache;
      const cachedAt = d.cachedAt ?? c.cachedAt;
      setOfflineInfo(fromCache ? { cachedAt } : null);
      if (fromCache) {
        toast(`You're offline — showing data cached from ${formatCacheTimestamp(cachedAt)}`, {
          icon: "📴",
        });
      }
    } catch (e) {
      toast.error(e.response?.data?.error || "Failed to load crop diseases");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const cropNameById = useMemo(() => {
    const m = new Map();
    crops.forEach((c) => m.set(c.id, c.nameEn));
    return m;
  }, [crops]);

  const remove = async (id) => {
    if (!confirm("Delete this pest/disease entry?")) return;
    try {
      await api.delete(`/api/crop-diseases/${id}`);
      trackEvent("admin_crop_disease_delete", { disease_id: id });
      toast.success("Deleted");
      load();
    } catch (e) {
      toast.error(e.response?.data?.error || "Delete failed");
    }
  };

  return (
    <div className="w-full min-w-0 max-w-full">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Pests & Diseases</h1>
          <p className="text-slate-600">Manage the "Keera aur Bimariyan" content</p>
        </div>
        <Link
          to="/learning/diseases/new"
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Add pest/disease
        </Link>
      </div>

      {offlineInfo && (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 sm:text-sm">
          <WifiOff className="h-4 w-4 shrink-0" />
          Offline — showing data cached on {formatCacheTimestamp(offlineInfo.cachedAt)}
        </div>
      )}

      <div className="mt-6 overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 bg-white shadow-sm [-webkit-overflow-scrolling:touch]">
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner className="h-10 w-10" />
          </div>
        ) : (
          <table className="w-full min-w-[560px] text-left text-xs sm:min-w-[640px] sm:text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-3 py-2.5 font-medium text-slate-700 sm:px-4 sm:py-3">Crop</th>
                <th className="px-3 py-2.5 font-medium text-slate-700 sm:px-4 sm:py-3">Order</th>
                <th className="px-3 py-2.5 font-medium text-slate-700 sm:px-4 sm:py-3">Name (EN)</th>
                <th className="px-3 py-2.5 font-medium text-slate-700 sm:px-4 sm:py-3">Name (UR)</th>
                <th className="px-3 py-2.5 font-medium text-slate-700 sm:px-4 sm:py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((d) => (
                <tr key={d.id} className="border-b border-slate-100">
                  <td className="px-3 py-2.5 text-slate-600 sm:px-4 sm:py-3">
                    {cropNameById.get(d.cropId) || d.cropId}
                  </td>
                  <td className="px-3 py-2.5 sm:px-4 sm:py-3">{d.order}</td>
                  <td className="px-3 py-2.5 font-medium text-slate-900 sm:px-4 sm:py-3">{d.nameEn}</td>
                  <td className="px-3 py-2.5 text-slate-600 sm:px-4 sm:py-3" dir="rtl">{d.nameUr}</td>
                  <td className="px-3 py-2.5 sm:px-4 sm:py-3">
                    <div className="flex flex-wrap gap-x-2 gap-y-1">
                      <Link
                        to={`/learning/diseases/${d.id}/edit`}
                        className="inline-flex items-center gap-1 text-brand-600 hover:underline"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => remove(d.id)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && items.length === 0 && (
          <p className="py-12 text-center text-slate-500">No pests/diseases found.</p>
        )}
      </div>
    </div>
  );
}
