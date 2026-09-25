import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Pencil } from "lucide-react";
import { api } from "../services/api.js";
import { Spinner } from "../components/Spinner.jsx";
import toast from "react-hot-toast";
import { trackEvent } from "../services/analytics.js";

const CROPS = [
  { value: "wheat", label: "Wheat" },
  { value: "rice", label: "Rice" },
  { value: "cotton", label: "Cotton" },
];

const PRODUCT_CATEGORIES = [
  { value: "fungicides", label: "Fungicides" },
  { value: "herbicides", label: "Herbicides" },
  { value: "insecticides", label: "Insecticides" },
  { value: "seedcare", label: "Seed Care" },
  { value: "specialty-nutrition", label: "Specialty Nutrition" },
];

const LEGACY_CROP_VALUES = new Set(CROPS.map((c) => c.value));

function cropLabel(value) {
  const found = CROPS.find((c) => c.value === value);
  return found ? found.label : value || "—";
}

function categoryLabel(value) {
  const found = PRODUCT_CATEGORIES.find((c) => c.value === value);
  return found ? found.label : value || "—";
}

/** Prefer `crop`; fall back if older docs stored crop in `category`. */
function productCrop(p) {
  const crop = String(p.crop ?? "").trim();
  if (crop) return crop;
  const cat = String(p.category ?? "").trim();
  if (LEGACY_CROP_VALUES.has(cat)) return cat;
  return "";
}

function productCategory(p) {
  const cat = String(p.category ?? "").trim();
  if (!p.crop && LEGACY_CROP_VALUES.has(cat)) return "";
  return cat;
}

export function Products() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [crop, setCrop] = useState("");
  const [category, setCategory] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/products", {
        params: {
          search: search || undefined,
          crop: crop || undefined,
          category: category || undefined,
        },
      });
      setItems(data.items || []);
    } catch (e) {
      toast.error(e.response?.data?.error || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const crops = useMemo(() => {
    const s = new Set(CROPS.map((c) => c.value));
    items.forEach((p) => {
      const c = productCrop(p);
      if (c) s.add(c);
    });
    return [...s].sort();
  }, [items]);

  const categories = useMemo(() => {
    const s = new Set(PRODUCT_CATEGORIES.map((c) => c.value));
    items.forEach((p) => {
      const cat = productCategory(p);
      if (cat) s.add(cat);
    });
    return [...s].sort();
  }, [items]);

  const filtered = useMemo(() => {
    let list = items;
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((p) => {
        const t = p.title || {};
        const d = p.description || {};
        return (
          (t.en && t.en.toLowerCase().includes(q)) ||
          (t.ur && t.ur.toLowerCase().includes(q)) ||
          (d.en && d.en.toLowerCase().includes(q)) ||
          (d.ur && d.ur.toLowerCase().includes(q)) ||
          (p.sku && String(p.sku).toLowerCase().includes(q)) ||
          (p.company && String(p.company).toLowerCase().includes(q)) ||
          (Array.isArray(p.phones) &&
            p.phones.some((ph) => String(ph).toLowerCase().includes(q)))
        );
      });
    }
    if (crop) list = list.filter((p) => productCrop(p) === crop);
    if (category) list = list.filter((p) => productCategory(p) === category);
    return list;
  }, [items, search, crop, category]);

  const softDelete = async (id) => {
    if (!confirm("Soft-delete this product?")) return;
    try {
      await api.delete(`/api/products/${id}`);
      trackEvent("admin_product_soft_delete", { product_id: id });
      toast.success("Product archived");
      load();
    } catch (e) {
      toast.error(e.response?.data?.error || "Delete failed");
    }
  };

  return (
    <div className="w-full min-w-0 max-w-full">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Products</h1>
          <p className="text-slate-600">Manage marketplace listings</p>
        </div>
        <Link
          to="/products/new"
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Add product
        </Link>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <div className="relative min-w-0 flex-1 sm:min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search title, company, SKU, phone..."
            className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-3 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm sm:w-auto sm:min-w-[9rem]"
          value={crop}
          onChange={(e) => setCrop(e.target.value)}
        >
          <option value="">All crops</option>
          {crops.map((c) => (
            <option key={c} value={c}>
              {cropLabel(c)}
            </option>
          ))}
        </select>
        <select
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm sm:w-auto sm:min-w-[10rem]"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {categoryLabel(c)}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={load}
          className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50 sm:w-auto"
        >
          Refresh
        </button>
      </div>

      <div className="mt-6 overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 bg-white shadow-sm [-webkit-overflow-scrolling:touch]">
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner className="h-10 w-10" />
          </div>
        ) : (
          <table className="w-full min-w-[840px] text-left text-xs sm:min-w-[960px] sm:text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-3 py-2.5 font-medium text-slate-700 sm:px-4 sm:py-3">
                  Image
                </th>
                <th className="px-3 py-2.5 font-medium text-slate-700 sm:px-4 sm:py-3">
                  Title (EN)
                </th>
                <th className="px-3 py-2.5 font-medium text-slate-700 sm:px-4 sm:py-3">
                  Company
                </th>
                <th className="px-3 py-2.5 font-medium text-slate-700 sm:px-4 sm:py-3">
                  Crop
                </th>
                <th className="px-3 py-2.5 font-medium text-slate-700 sm:px-4 sm:py-3">
                  Category
                </th>
                <th className="px-3 py-2.5 font-medium text-slate-700 sm:px-4 sm:py-3">
                  Phone
                </th>
                <th className="px-3 py-2.5 font-medium text-slate-700 sm:px-4 sm:py-3">
                  Price
                </th>
                <th className="px-3 py-2.5 font-medium text-slate-700 sm:px-4 sm:py-3">
                  Active
                </th>
                <th className="px-3 py-2.5 font-medium text-slate-700 sm:px-4 sm:py-3">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const phones = Array.isArray(p.phones)
                  ? p.phones.filter(Boolean)
                  : [];
                const thumb = Array.isArray(p.images)
                  ? p.images.find((u) => String(u ?? "").trim())
                  : null;
                return (
                  <tr key={p.id} className="border-b border-slate-100">
                    <td className="px-3 py-2.5 sm:px-4 sm:py-3">
                      {thumb ? (
                        <img
                          src={thumb}
                          alt=""
                          className="h-10 w-10 rounded object-cover"
                        />
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 sm:px-4 sm:py-3">
                      <div className="font-medium text-slate-900">
                        {p.title?.en || "—"}
                      </div>
                      {p.title?.ur && (
                        <div className="text-xs text-slate-500" dir="rtl">
                          {p.title.ur}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-slate-600 sm:px-4 sm:py-3">
                      {p.company || "—"}
                    </td>
                    <td className="px-3 py-2.5 text-slate-600 sm:px-4 sm:py-3">
                      {cropLabel(productCrop(p))}
                    </td>
                    <td className="px-3 py-2.5 text-slate-600 sm:px-4 sm:py-3">
                      {categoryLabel(productCategory(p))}
                    </td>
                    <td className="px-3 py-2.5 text-slate-600 sm:px-4 sm:py-3">
                      {phones.length ? (
                        <div className="flex flex-col gap-0.5">
                          {phones.map((ph) => (
                            <span key={ph} className="whitespace-nowrap">
                              {ph}
                            </span>
                          ))}
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 sm:px-4 sm:py-3">
                      {p.currency} {p.price}
                    </td>
                    <td className="px-3 py-2.5 sm:px-4 sm:py-3">
                      <span
                        className={
                          p.isActive
                            ? "rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800"
                            : "rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                        }
                      >
                        {p.isActive ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 sm:px-4 sm:py-3">
                      <div className="flex flex-wrap gap-x-2 gap-y-1">
                        <Link
                          to={`/products/${p.id}/edit`}
                          className="inline-flex items-center gap-1 text-brand-600 hover:underline"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => softDelete(p.id)}
                          className="text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        {!loading && filtered.length === 0 && (
          <p className="py-12 text-center text-slate-500">No products found.</p>
        )}
      </div>
    </div>
  );
}
