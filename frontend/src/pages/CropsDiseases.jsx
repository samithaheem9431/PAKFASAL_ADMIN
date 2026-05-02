import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil } from "lucide-react";
import { api } from "../services/api.js";
import { Spinner } from "../components/Spinner.jsx";
import toast from "react-hot-toast";
import { trackEvent } from "../services/analytics.js";

export function CropsDiseases() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/crops-pests");
      setItems(data.items || []);
    } catch (e) {
      toast.error(e.response?.data?.error || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id) => {
    if (!confirm("Delete this record permanently?")) return;
    try {
      await api.delete(`/api/crops-pests/${id}`);
      trackEvent("admin_crop_disease_delete", { record_id: id });
      toast.success("Deleted");
      load();
    } catch (e) {
      toast.error(e.response?.data?.error || "Delete failed");
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Crops & diseases</h1>
          <p className="text-slate-600">Symptoms and treatments by crop</p>
        </div>
        <Link
          to="/crops-diseases/new"
          className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white"
        >
          <Plus className="h-4 w-4" />
          Add entry
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner className="h-10 w-10" />
          </div>
        ) : (
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-medium">Crop</th>
                <th className="px-4 py-3 font-medium">Disease</th>
                <th className="px-4 py-3 font-medium">Language</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr key={row.id} className="border-b border-slate-100">
                  <td className="px-4 py-3 font-medium">{row.cropName}</td>
                  <td className="px-4 py-3 text-slate-600">{row.diseaseName}</td>
                  <td className="px-4 py-3">{row.language}</td>
                  <td className="px-4 py-3">
                    <Link
                      to={`/crops-diseases/${row.id}/edit`}
                      className="inline-flex items-center gap-1 text-brand-600"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => remove(row.id)}
                      className="ml-3 text-red-600 hover:underline"
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
          <p className="py-12 text-center text-slate-500">No entries yet.</p>
        )}
      </div>
    </div>
  );
}
