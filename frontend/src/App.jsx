import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ProtectedRoute } from "./routes/ProtectedRoute.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import { Layout } from "./components/Layout.jsx";
import { SuperAdminRoute } from "./routes/SuperAdminRoute.jsx";
import { Spinner } from "./components/Spinner.jsx";
import { trackEvent } from "./services/analytics.js";

const Login = lazy(() =>
  import("./pages/Login.jsx").then((m) => ({ default: m.Login }))
);

const Dashboard = lazy(() =>
  import("./pages/Dashboard.jsx").then((m) => ({ default: m.Dashboard }))
);
const Products = lazy(() =>
  import("./pages/Products.jsx").then((m) => ({ default: m.Products }))
);
const ProductForm = lazy(() =>
  import("./pages/ProductForm.jsx").then((m) => ({ default: m.ProductForm }))
);
const LearningHome = lazy(() =>
  import("./pages/LearningHome.jsx").then((m) => ({ default: m.LearningHome }))
);
const Articles = lazy(() =>
  import("./pages/Articles.jsx").then((m) => ({ default: m.Articles }))
);
const ArticleForm = lazy(() =>
  import("./pages/ArticleForm.jsx").then((m) => ({ default: m.ArticleForm }))
);
const Cultivation = lazy(() =>
  import("./pages/Cultivation.jsx").then((m) => ({ default: m.Cultivation }))
);
const CropsDiseases = lazy(() =>
  import("./pages/CropsDiseases.jsx").then((m) => ({ default: m.CropsDiseases }))
);
const CropsPestForm = lazy(() =>
  import("./pages/CropsPestForm.jsx").then((m) => ({ default: m.CropsPestForm }))
);
const Admins = lazy(() =>
  import("./pages/Admins.jsx").then((m) => ({ default: m.Admins }))
);

function LoginRouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-auth-hero">
      <Spinner className="h-10 w-10 text-brand-600" />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-center" />
        <RouteTracker />
        <Routes>
          <Route
            path="/login"
            element={
              <Suspense fallback={<LoginRouteFallback />}>
                <Login />
              </Suspense>
            }
          />
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
