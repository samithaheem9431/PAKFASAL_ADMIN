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
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Learning articles</h1>
          <p className="text-slate-600">Markdown content & publishing</p>
        </div>
        <Link
          to="/learning/articles/new"
          className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white"
        >
          <Plus className="h-4 w-4" />
          New article
        </Link>
      </div>

      <div className="mt-4 flex gap-2">
        <select
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner className="h-10 w-10" />
          </div>
        ) : (
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((a) => (
                <tr key={a.id} className="border-b border-slate-100">
                  <td className="px-4 py-3 font-medium">
                    <span className="block">{displayBilingual(a.title)}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{a.slug}</td>
                  <td className="px-4 py-3">
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
                  <td className="px-4 py-3">
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
