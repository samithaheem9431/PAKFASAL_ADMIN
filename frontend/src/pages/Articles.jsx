import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil } from "lucide-react";
import { api } from "../services/api.js";
import { Spinner } from "../components/Spinner.jsx";
import toast from "react-hot-toast";
import { trackEvent } from "../services/analytics.js";
import { displayBilingual } from "../utils/bilingual.js";

export function Articles() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/learning-articles", {
        params: filter ? { status: filter } : {},
      });
      setItems(data.items || []);
    } catch (e) {
      toast.error(e.response?.data?.error || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const remove = async (id) => {
    if (!confirm("Delete this article?")) return;
    try {
      await api.delete(`/api/learning-articles/${id}`);
      trackEvent("admin_article_delete", { article_id: id });
      toast.success("Deleted");
      load();
    } catch (e) {
      toast.error(e.response?.data?.error || "Failed");
    }
  };

  return (
    <div className="w-full min-w-0 max-w-full">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-bold sm:text-2xl">Learning articles</h1>
          <p className="text-slate-600">Markdown content & publishing</p>
        </div>
        <Link
          to="/learning/articles/new"
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          New article
        </Link>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <select
          className="w-full min-w-0 rounded-lg border border-slate-300 px-3 py-2 text-sm sm:w-auto sm:min-w-[12rem]"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </div>

      <div className="mt-6 overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 bg-white shadow-sm [-webkit-overflow-scrolling:touch]">
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner className="h-10 w-10" />
          </div>
        ) : (
          <table className="w-full min-w-[520px] text-left text-xs sm:min-w-[640px] sm:text-sm">
            <thead className="border-b bg-slate-50">
              <tr>
                <th className="px-3 py-2.5 font-medium sm:px-4 sm:py-3">Title</th>
                <th className="px-3 py-2.5 font-medium sm:px-4 sm:py-3">Slug</th>
                <th className="px-3 py-2.5 font-medium sm:px-4 sm:py-3">Status</th>
                <th className="px-3 py-2.5 font-medium sm:px-4 sm:py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((a) => (
                <tr key={a.id} className="border-b border-slate-100">
                  <td className="max-w-[12rem] px-3 py-2.5 font-medium sm:max-w-none sm:px-4 sm:py-3">
                    <span className="block break-words">{displayBilingual(a.title)}</span>
                  </td>
                  <td className="max-w-[8rem] break-all px-3 py-2.5 text-slate-600 sm:max-w-none sm:px-4 sm:py-3">
                    {a.slug}
                  </td>
                  <td className="px-3 py-2.5 sm:px-4 sm:py-3">
                    <span
                      className={
                        a.status === "published"
                          ? "rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800"
                          : "rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800"
                      }
                    >
                      {a.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 sm:px-4 sm:py-3">
                    <Link
                      to={`/learning/articles/${a.id}/edit`}
                      className="inline-flex items-center gap-1 text-brand-600"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => remove(a.id)}
                      className="ml-3 text-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && items.length === 0 && (
          <p className="py-12 text-center text-slate-500">No articles.</p>
        )}
      </div>
    </div>
  );
}
