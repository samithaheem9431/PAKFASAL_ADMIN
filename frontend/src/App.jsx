import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ProtectedRoute } from "./routes/ProtectedRoute.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import { Layout } from "./components/Layout.jsx";
import { Login } from "./pages/Login.jsx";
import { Dashboard } from "./pages/Dashboard.jsx";
import { Products } from "./pages/Products.jsx";
import { ProductForm } from "./pages/ProductForm.jsx";
import { LearningHome } from "./pages/LearningHome.jsx";
import { Articles } from "./pages/Articles.jsx";
import { ArticleForm } from "./pages/ArticleForm.jsx";
import { Cultivation } from "./pages/Cultivation.jsx";
import { CropsDiseases } from "./pages/CropsDiseases.jsx";
import { CropsPestForm } from "./pages/CropsPestForm.jsx";
import { Admins } from "./pages/Admins.jsx";
import { SuperAdminRoute } from "./routes/SuperAdminRoute.jsx";
import { trackEvent } from "./services/analytics.js";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-center" />
        <RouteTracker />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="products/new" element={<ProductForm />} />
            <Route path="products/:id/edit" element={<ProductForm />} />
            <Route path="learning" element={<LearningHome />} />
            <Route path="learning/articles" element={<Articles />} />
            <Route path="learning/articles/new" element={<ArticleForm />} />
            <Route path="learning/articles/:id/edit" element={<ArticleForm />} />
            <Route path="learning/cultivation" element={<Cultivation />} />
            <Route path="crops-diseases" element={<CropsDiseases />} />
            <Route path="crops-diseases/new" element={<CropsPestForm />} />
            <Route path="crops-diseases/:id/edit" element={<CropsPestForm />} />
            <Route
              path="admins"
              element={
                <SuperAdminRoute>
                  <Admins />
                </SuperAdminRoute>
              }
            />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

function RouteTracker() {
  const { pathname } = useLocation();
  const { adminOk } = useAuth();

  useEffect(() => {
    trackEvent("admin_page_view", {
      page_path: pathname,
      area: pathname.split("/")[1] || "dashboard",
      is_admin_session: adminOk ? "true" : "false",
    });
  }, [pathname, adminOk]);

  return null;
}
