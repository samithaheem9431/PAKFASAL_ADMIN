import { Link } from "react-router-dom";
import { Package, BookOpen, Sprout } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../services/api.js";
import { Spinner } from "../components/Spinner.jsx";

export function Dashboard() {
  const [counts, setCounts] = useState({ products: null, articles: null, cd: null });
  const [err, setErr] = useState(null);

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const [p, a, c] = await Promise.all([
          api.get("/api/products"),
          api.get("/api/learning-articles"),
          api.get("/api/crops-pests"),
        ]);
        if (cancel) return;
        setCounts({
          products: p.data.items?.length ?? 0,
          articles: a.data.items?.length ?? 0,
          cd: c.data.items?.length ?? 0,
        });
      } catch (e) {
        if (!cancel) setErr(e.message);
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  const cards = [
    {
      to: "/products",
      label: "Products",
      sub: "Marketplace catalog",
      count: counts.products,
      icon: Package,
    },
    {
      to: "/learning/articles",
      label: "Learning articles",
      sub: "Guides & content",
      count: counts.articles,
      icon: BookOpen,
    },
    {
      to: "/crops-diseases",
      label: "Crops & diseases",
      sub: "Pests & treatments",
      count: counts.cd,
      icon: Sprout,
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
      <p className="mt-1 text-slate-600">
        Welcome to PakFasal administration.
      </p>

      {err && (
        <p className="mt-4 text-sm text-amber-700">
          Some stats could not load: {err}
        </p>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ to, label, sub, count, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-brand-300 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className="rounded-lg bg-brand-50 p-3 text-brand-700">
                <Icon className="h-6 w-6" />
              </div>
              {count === null ? (
                <Spinner className="h-6 w-6" />
              ) : (
                <span className="text-2xl font-bold text-slate-900">{count}</span>
              )}
            </div>
            <h2 className="mt-4 font-semibold text-slate-900 group-hover:text-brand-700">
              {label}
            </h2>
            <p className="mt-1 text-sm text-slate-500">{sub}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
