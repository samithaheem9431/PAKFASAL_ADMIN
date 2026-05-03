import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { api, uploadFile } from "../services/api.js";
import toast from "react-hot-toast";
import { Spinner } from "../components/Spinner.jsx";
import { ArrowLeft, Upload } from "lucide-react";
import { trackEvent } from "../services/analytics.js";

function validateBilingual(data) {
  const te = data.titleEn?.trim();
  const tu = data.titleUr?.trim();
  const de = data.descEn?.trim();
  const du = data.descUr?.trim();
  if (!te && !tu) return "Fill title in at least English or Urdu.";
  if (!de && !du) return "Fill description in at least English or Urdu.";
  return null;
}

export function ProductForm() {
  const { id } = useParams();
  const isNew = !id || id === "new";
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!isNew);
  const [uploading, setUploading] = useState(false);

  const { register, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: {
      titleEn: "",
      titleUr: "",
      descEn: "",
      descUr: "",
      price: 0,
      category: "",
      sku: "",
      isActive: true,
      images: [],
    },
  });

  const images = watch("images") || [];

  useEffect(() => {
    if (isNew) return;
    let cancel = false;
    (async () => {
      try {
        const { data } = await api.get("/api/products", {
          params: { includeDeleted: "true" },
        });
        const p = data.items?.find((x) => x.id === id);
        if (!p) {
          toast.error("Product not found");
          navigate("/products");
          return;
        }
        if (cancel) return;
        reset({
          titleEn: p.title?.en ?? "",
          titleUr: p.title?.ur ?? "",
          descEn: p.description?.en ?? "",
          descUr: p.description?.ur ?? "",
          price: p.price ?? 0,
          category: p.category ?? "",
          sku: p.sku ?? "",
          isActive: p.isActive !== false,
          images: p.images ?? [],
        });
      } catch (e) {
        toast.error(e.response?.data?.error || "Failed to load");
        navigate("/products");
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [id, isNew, navigate, reset]);

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await uploadFile(file);
      setValue("images", [...images, url]);
      toast.success("Image uploaded");
    } catch (err) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (url) => {
    setValue(
      "images",
      images.filter((u) => u !== url)
    );
  };

  const onSubmit = async (data) => {
    const v = validateBilingual(data);
    if (v) {
      toast.error(v);
      return;
    }
    const body = {
      title: { en: data.titleEn?.trim() || "", ur: data.titleUr?.trim() || "" },
      description: {
        en: data.descEn?.trim() || "",
        ur: data.descUr?.trim() || "",
      },
      price: Number(data.price),
      currency: "PKR",
      category: data.category?.trim() || "general",
      sku: data.sku?.trim() || "",
      isActive: !!data.isActive,
      images,
    };
    try {
      if (isNew) {
        await api.post("/api/products", body);
        trackEvent("admin_product_create", { category: body.category });
        toast.success("Product created");
      } else {
        await api.put(`/api/products/${id}`, body);
        trackEvent("admin_product_update", { product_id: id, category: body.category });
        toast.success("Product updated");
      }
      navigate("/products");
    } catch (e) {
      const msg = e.response?.data?.errors?.join?.(", ") || e.response?.data?.error;
      toast.error(msg || "Save failed");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="h-10 w-10" />
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 max-w-full">
      <Link
        to="/products"
        className="mb-4 inline-flex items-center gap-2 text-sm text-slate-600 hover:text-brand-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to products
      </Link>

      <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
        {isNew ? "Add product" : "Edit product"}
      </h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mx-auto mt-6 w-full max-w-2xl space-y-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Title (English)</label>
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              {...register("titleEn")}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Title (Urdu)</label>
            <input
              dir="rtl"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              {...register("titleUr")}
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Description (English)
          </label>
          <textarea
            rows={4}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            {...register("descEn")}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">
            Description (Urdu)
          </label>
          <textarea
            dir="rtl"
            rows={4}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            {...register("descUr")}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Price (PKR)</label>
            <input
              type="number"
              min={0}
              step="0.01"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              {...register("price", { valueAsNumber: true })}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Category</label>
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              {...register("category")}
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">SKU (optional)</label>
          <input
            className="w-full max-w-md rounded-lg border border-slate-300 px-3 py-2 text-sm"
            {...register("sku")}
          />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" {...register("isActive")} />
          Active listing
        </label>

        <div>
          <p className="mb-2 text-sm font-medium">Images</p>
          <div className="flex flex-wrap gap-2">
            {images.map((url) => (
              <div key={url} className="relative">
                <img
                  src={url}
                  alt=""
                  className="h-24 w-24 rounded-lg border object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(url)}
                  className="absolute -right-1 -top-1 rounded-full bg-red-500 px-1.5 text-xs text-white"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <label className="mt-2 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-slate-300 px-4 py-2 text-sm hover:bg-slate-50">
            <Upload className="h-4 w-4" />
            {uploading ? "Uploading…" : "Upload image"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onFile}
              disabled={uploading}
            />
          </label>
        </div>

        <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:gap-3">
          <button
            type="submit"
            className="order-2 w-full rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 sm:order-1 sm:w-auto"
          >
            Save
          </button>
          <Link
            to="/products"
            className="order-1 w-full rounded-lg border border-slate-300 px-5 py-2.5 text-center text-sm hover:bg-slate-50 sm:order-2 sm:w-auto"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
