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
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Admins</h1>
      <p className="text-slate-600">Super-admin area for admin user management.</p>

      <form
        onSubmit={onSubmit}
        className="mt-6 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-4"
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

      <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner className="h-10 w-10" />
          </div>
        ) : (
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">UID</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((a) => (
                <tr key={a.uid} className="border-b border-slate-100">
                  <td className="px-4 py-3 font-medium">{a.email || "—"}</td>
                  <td className="px-4 py-3">{a.role}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{a.uid}</td>
                  <td className="px-4 py-3">
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

