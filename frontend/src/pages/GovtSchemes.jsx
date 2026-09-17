import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil, WifiOff } from "lucide-react";
import { api } from "../services/api.js";
import { Spinner } from "../components/Spinner.jsx";
import toast from "react-hot-toast";
import { trackEvent } from "../services/analytics.js";
import { clearCache, fetchWithCache, formatCacheTimestamp } from "../utils/offlineCache.js";

const CACHE_KEY = "govt-schemes";

function statusBadge(status) {
  const s = String(status || "active").toLowerCase();
  if (s === "closed") return "bg-slate-100 text-slate-700";
  if (s === "inactive") return "bg-amber-50 text-amber-800";
  return "bg-emerald-50 text-emerald-800";
}

export function GovtSchemes() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offlineInfo, setOfflineInfo] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data, fromCache, cachedAt } = await fetchWithCache(CACHE_KEY, async () => {
        const res = await api.get("/api/govt-schemes");
        return res.data.items || [];
      });
      setItems(data);
      setOfflineInfo(fromCache ? { cachedAt } : null);
      if (fromCache) {
        toast(`You're offline — showing schemes cached from ${formatCacheTimestamp(cachedAt)}`, {
          icon: "📴",
        });
      }
    } catch (e) {
      toast.error(e.response?.data?.error || "Failed to load schemes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id) => {
    if (!confirm("Delete this government scheme?")) return;
    try {
      await api.delete(`/api/govt-schemes/${id}`);
      trackEvent("admin_govt_scheme_delete", { scheme_id: id });
      clearCache(CACHE_KEY);
      toast.success("Scheme deleted");
      load();
    } catch (e) {
      toast.error(e.response?.data?.error || "Delete failed");
    }
  };

  return (
    <div className="w-full min-w-0 max-w-full">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Govt schemes</h1>
          <p className="text-slate-600">Manage government agricultural schemes</p>
        </div>
        <Link
          to="/govt-schemes/new"
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Add scheme
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
          <table className="w-full min-w-[700px] text-left text-xs sm:min-w-[820px] sm:text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-3 py-2.5 font-medium text-slate-700 sm:px-4 sm:py-3">Image</th>
                <th className="px-3 py-2.5 font-medium text-slate-700 sm:px-4 sm:py-3">Order</th>
                <th className="px-3 py-2.5 font-medium text-slate-700 sm:px-4 sm:py-3">Title</th>
                <th className="px-3 py-2.5 font-medium text-slate-700 sm:px-4 sm:py-3">Category</th>
                <th className="px-3 py-2.5 font-medium text-slate-700 sm:px-4 sm:py-3">Province</th>
                <th className="px-3 py-2.5 font-medium text-slate-700 sm:px-4 sm:py-3">Status</th>
                <th className="px-3 py-2.5 font-medium text-slate-700 sm:px-4 sm:py-3">Featured</th>
                <th className="px-3 py-2.5 font-medium text-slate-700 sm:px-4 sm:py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((s) => (
                <tr key={s.id} className="border-b border-slate-100">
                  <td className="px-3 py-2.5 sm:px-4 sm:py-3">
                    {s.imageUrl ? (
                      <img
                        src={s.imageUrl}
                        alt=""
                        className="h-10 w-10 rounded object-cover"
                      />
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 sm:px-4 sm:py-3">{s.order}</td>
                  <td className="px-3 py-2.5 font-medium text-slate-900 sm:px-4 sm:py-3">
                    <div>{s.titleEn}</div>
                    {s.titleUr && (
                      <div className="text-xs text-slate-500" dir="rtl">
                        {s.titleUr}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-slate-600 sm:px-4 sm:py-3">{s.categoryEn}</td>
                  <td className="px-3 py-2.5 text-slate-600 sm:px-4 sm:py-3">{s.province}</td>
                  <td className="px-3 py-2.5 sm:px-4 sm:py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusBadge(s.status)}`}
                    >
                      {s.status || "active"}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-slate-600 sm:px-4 sm:py-3">
                    {s.featured ? "Yes" : "No"}
                  </td>
                  <td className="px-3 py-2.5 sm:px-4 sm:py-3">
                    <div className="flex flex-wrap gap-x-2 gap-y-1">
                      <Link
                        to={`/govt-schemes/${s.id}/edit`}
                        className="inline-flex items-center gap-1 text-brand-600 hover:underline"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => remove(s.id)}
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
          <p className="py-12 text-center text-slate-500">No schemes found.</p>
        )}
      </div>
    </div>
  );
}
