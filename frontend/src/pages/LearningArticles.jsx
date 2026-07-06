import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil, WifiOff } from "lucide-react";
import { api } from "../services/api.js";
import { Spinner } from "../components/Spinner.jsx";
import toast from "react-hot-toast";
import { trackEvent } from "../services/analytics.js";
import { fetchWithCache, formatCacheTimestamp } from "../utils/offlineCache.js";

const CACHE_KEY = "learning-articles";

export function LearningArticles() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offlineInfo, setOfflineInfo] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data, fromCache, cachedAt } = await fetchWithCache(CACHE_KEY, async () => {
        const res = await api.get("/api/learning-articles");
        return res.data.items || [];
      });
      setItems(data);
      setOfflineInfo(fromCache ? { cachedAt } : null);
      if (fromCache) {
        toast(`You're offline — showing articles cached from ${formatCacheTimestamp(cachedAt)}`, {
          icon: "📴",
        });
      }
    } catch (e) {
      toast.error(e.response?.data?.error || "Failed to load articles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id) => {
    if (!confirm("Delete this article? Its sections will also be deleted.")) return;
    try {
      await api.delete(`/api/learning-articles/${id}`);
      trackEvent("admin_learning_article_delete", { article_id: id });
      toast.success("Article deleted");
      load();
    } catch (e) {
      toast.error(e.response?.data?.error || "Delete failed");
    }
  };

  return (
    <div className="w-full min-w-0 max-w-full">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Learning articles</h1>
          <p className="text-slate-600">Manage Learning module articles</p>
        </div>
        <Link
          to="/learning/articles/new"
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Add article
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
                <th className="px-3 py-2.5 font-medium text-slate-700 sm:px-4 sm:py-3">Order</th>
                <th className="px-3 py-2.5 font-medium text-slate-700 sm:px-4 sm:py-3">Category</th>
                <th className="px-3 py-2.5 font-medium text-slate-700 sm:px-4 sm:py-3">Title (EN)</th>
                <th className="px-3 py-2.5 font-medium text-slate-700 sm:px-4 sm:py-3">Read time</th>
                <th className="px-3 py-2.5 font-medium text-slate-700 sm:px-4 sm:py-3">Icon</th>
                <th className="px-3 py-2.5 font-medium text-slate-700 sm:px-4 sm:py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((a) => (
                <tr key={a.id} className="border-b border-slate-100">
                  <td className="px-3 py-2.5 sm:px-4 sm:py-3">{a.order}</td>
                  <td className="px-3 py-2.5 text-slate-600 sm:px-4 sm:py-3">{a.categoryEn}</td>
                  <td className="px-3 py-2.5 font-medium text-slate-900 sm:px-4 sm:py-3">
                    <div>{a.titleEn}</div>
                    {a.titleUr && (
                      <div className="text-xs text-slate-500" dir="rtl">
                        {a.titleUr}
                      </div>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-slate-600 sm:px-4 sm:py-3">
                    {a.readTimeMinutes} min
                  </td>
                  <td className="px-3 py-2.5 text-slate-600 sm:px-4 sm:py-3">{a.icon}</td>
                  <td className="px-3 py-2.5 sm:px-4 sm:py-3">
                    <div className="flex flex-wrap gap-x-2 gap-y-1">
                      <Link
                        to={`/learning/articles/${a.id}/edit`}
                        className="inline-flex items-center gap-1 text-brand-600 hover:underline"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => remove(a.id)}
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
          <p className="py-12 text-center text-slate-500">No articles found.</p>
        )}
      </div>
    </div>
  );
}
