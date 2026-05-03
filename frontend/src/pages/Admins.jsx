import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { api } from "../services/api.js";
import { Spinner } from "../components/Spinner.jsx";
import { trackEvent } from "../services/analytics.js";

export function Admins() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, reset } = useForm({
    defaultValues: { email: "", password: "", role: "admin" },
  });

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/admins");
      setItems(data.items || []);
    } catch (e) {
      toast.error(e.response?.data?.error || "Failed to load admins");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onSubmit = handleSubmit(async (values) => {
    setSaving(true);
    try {
      await api.post("/api/admins", values);
      trackEvent("admin_user_create", { role: values.role });
      toast.success("Admin created");
      reset({ email: "", password: "", role: "admin" });
      load();
    } catch (e) {
      toast.error(e.response?.data?.error || "Failed to create admin");
    } finally {
      setSaving(false);
    }
  });

  const remove = async (uid) => {
    if (!confirm("Delete this admin user?")) return;
    try {
      await api.delete(`/api/admins/${uid}`);
      trackEvent("admin_user_delete", { uid });
      toast.success("Admin removed");
      load();
    } catch (e) {
      toast.error(e.response?.data?.error || "Failed to remove admin");
    }
  };

  return (
    <div className="w-full min-w-0 max-w-full">
      <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Admins</h1>
      <p className="text-slate-600">Super-admin area for admin user management.</p>

      <form
        onSubmit={onSubmit}
        className="mt-6 grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <input
          type="email"
          placeholder="Email"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          {...register("email", { required: true })}
        />
        <input
          type="password"
          placeholder="Password (min 6)"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          {...register("password", { required: true, minLength: 6 })}
        />
        <select
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          {...register("role")}
        >
          <option value="admin">admin</option>
          <option value="super_admin">super_admin</option>
        </select>
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {saving ? "Creating..." : "Create Admin"}
        </button>
      </form>

      <div className="mt-6 overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 bg-white shadow-sm [-webkit-overflow-scrolling:touch]">
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner className="h-10 w-10" />
          </div>
        ) : (
          <table className="w-full min-w-[520px] text-left text-xs sm:min-w-[640px] sm:text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-3 py-2.5 font-medium sm:px-4 sm:py-3">Email</th>
                <th className="px-3 py-2.5 font-medium sm:px-4 sm:py-3">Role</th>
                <th className="px-3 py-2.5 font-medium sm:px-4 sm:py-3">UID</th>
                <th className="px-3 py-2.5 font-medium sm:px-4 sm:py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((a) => (
                <tr key={a.uid} className="border-b border-slate-100">
                  <td className="max-w-[10rem] break-all px-3 py-2.5 font-medium sm:max-w-none sm:px-4 sm:py-3">
                    {a.email || "—"}
                  </td>
                  <td className="px-3 py-2.5 sm:px-4 sm:py-3">{a.role}</td>
                  <td className="max-w-[8rem] break-all px-3 py-2.5 text-[11px] text-slate-500 sm:max-w-none sm:px-4 sm:py-3 sm:text-xs">
                    {a.uid}
                  </td>
                  <td className="px-3 py-2.5 sm:px-4 sm:py-3">
                    <button
                      type="button"
                      onClick={() => remove(a.uid)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

