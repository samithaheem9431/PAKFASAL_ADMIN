import { Link } from "react-router-dom";
import { Package, Sprout, Bug, BookOpen } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../services/api.js";
import { Spinner } from "../components/Spinner.jsx";

export function Dashboard() {
  const [counts, setCounts] = useState({
    products: null,
    crops: null,
    diseases: null,
    articles: null,
  });
  const [crops, setCrops] = useState([]);
  const [diseases, setDiseases] = useState([]);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const [p, cr, d, a] = await Promise.all([
          api.get("/api/products"),
          api.get("/api/learning-crops"),
          api.get("/api/crop-diseases"),
          api.get("/api/learning-articles"),
        ]);
        if (cancel) return;
        const cropItems = cr.data.items || [];
        const diseaseItems = d.data.items || [];
        setCrops(cropItems);
        setDiseases(diseaseItems);
        setCounts({
          products: p.data.items?.length ?? 0,
          crops: cropItems.length,
          diseases: diseaseItems.length,
          articles: a.data.items?.length ?? 0,
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
      to: "/learning/crops",
      label: "Crops",
      sub: "Keera aur Bimariyan crop list",
      count: counts.crops,
      icon: Sprout,
    },
    {
      to: "/learning/diseases",
      label: "Pests & diseases",
      sub: "Symptoms & treatments",
      count: counts.diseases,
      icon: Bug,
    },
    {
      to: "/learning/articles",
      label: "Learning articles",
      sub: "Guides & content",
      count: counts.articles,
      icon: BookOpen,
    },
  ];

  const cropsWithImages = crops.filter((c) => c.imageUrl);
  const diseasesWithImages = diseases.filter((d) => d.imageUrl);

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
        {cards.map(({ to, label, sub, count, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-brand-300 hover:shadow-md sm:p-6"
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

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-slate-900">Crop images</h2>
          <Link
            to="/learning/crops"
            className="text-sm text-brand-600 hover:underline"
          >
            Manage crops
          </Link>
        </div>
        {counts.crops === null ? (
          <div className="flex justify-center py-8">
            <Spinner className="h-8 w-8" />
          </div>
        ) : crops.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500">
            No crops yet.
          </p>
        ) : cropsWithImages.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500">
            No crop images yet. Edit a crop, upload an image, then click Save.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {crops.map((c) => (
              <Link
                key={c.id}
                to={`/learning/crops/${c.id}/edit`}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:border-brand-300 hover:shadow-md"
              >
                <div className="aspect-square bg-slate-100">
                  {c.imageUrl ? (
                    <img
                      src={c.imageUrl}
                      alt={c.nameEn || c.id}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-slate-400">
                      No image
                    </div>
                  )}
                </div>
                <div className="px-2 py-2">
                  <p className="truncate text-sm font-medium text-slate-900">
                    {c.nameEn || c.id}
                  </p>
                  <p className="truncate text-xs text-slate-500" dir="rtl">
                    {c.nameUr || ""}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {diseasesWithImages.length > 0 && (
        <section className="mt-8">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-slate-900">
              Pest & disease images
            </h2>
            <Link
              to="/learning/diseases"
              className="text-sm text-brand-600 hover:underline"
            >
              Manage
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {diseasesWithImages.slice(0, 10).map((d) => (
              <Link
                key={d.id}
                to={`/learning/diseases/${d.id}/edit`}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:border-brand-300 hover:shadow-md"
              >
                <div className="aspect-square bg-slate-100">
                  <img
                    src={d.imageUrl}
                    alt={d.nameEn || d.id}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="px-2 py-2">
                  <p className="truncate text-sm font-medium text-slate-900">
                    {d.nameEn || d.id}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
