import { Link } from "react-router-dom";
import { Package } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../services/api.js";
import { Spinner } from "../components/Spinner.jsx";

export function Dashboard() {
  const [productCount, setProductCount] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const { data } = await api.get("/api/products");
        if (cancel) return;
        setProductCount(data.items?.length ?? 0);
      } catch (e) {
        if (!cancel) setErr(e.message);
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  return (
    <div className="w-full min-w-0 max-w-full">
      <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Dashboard</h1>
      <p className="mt-1 text-slate-600">
        Welcome to PakFasal administration.
      </p>

      {err && (
        <p className="mt-4 text-sm text-amber-700">
          Some stats could not load: {err}
        </p>
      )}

      <div className="mt-6 grid gap-3 sm:mt-8 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        <Link
          to="/products"
          className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-brand-300 hover:shadow-md sm:p-6"
        >
          <div className="flex items-start justify-between">
            <div className="rounded-lg bg-brand-50 p-3 text-brand-700">
              <Package className="h-6 w-6" />
            </div>
            {productCount === null ? (
              <Spinner className="h-6 w-6" />
            ) : (
              <span className="text-2xl font-bold text-slate-900">{productCount}</span>
            )}
          </div>
          <h2 className="mt-4 font-semibold text-slate-900 group-hover:text-brand-700">
            Products
          </h2>
          <p className="mt-1 text-sm text-slate-500">Marketplace catalog</p>
        </Link>
      </div>
    </div>
  );
}
