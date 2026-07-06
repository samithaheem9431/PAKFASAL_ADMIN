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
const LearningCrops = lazy(() =>
  import("./pages/LearningCrops.jsx").then((m) => ({ default: m.LearningCrops }))
);
const LearningCropForm = lazy(() =>
  import("./pages/LearningCropForm.jsx").then((m) => ({ default: m.LearningCropForm }))
);
const CropDiseases = lazy(() =>
  import("./pages/CropDiseases.jsx").then((m) => ({ default: m.CropDiseases }))
);
const CropDiseaseForm = lazy(() =>
  import("./pages/CropDiseaseForm.jsx").then((m) => ({ default: m.CropDiseaseForm }))
);
const LearningArticles = lazy(() =>
  import("./pages/LearningArticles.jsx").then((m) => ({ default: m.LearningArticles }))
);
const LearningArticleForm = lazy(() =>
  import("./pages/LearningArticleForm.jsx").then((m) => ({
    default: m.LearningArticleForm,
  }))
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
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            className:
              "!text-sm !max-w-[min(calc(100vw-1.5rem),24rem)] sm:!text-base",
            style: {
              wordBreak: "break-word",
            },
          }}
        />
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
            <Route path="learning/crops" element={<LearningCrops />} />
            <Route path="learning/crops/new" element={<LearningCropForm />} />
            <Route path="learning/crops/:id/edit" element={<LearningCropForm />} />
            <Route path="learning/diseases" element={<CropDiseases />} />
            <Route path="learning/diseases/new" element={<CropDiseaseForm />} />
            <Route path="learning/diseases/:id/edit" element={<CropDiseaseForm />} />
            <Route path="learning/articles" element={<LearningArticles />} />
            <Route path="learning/articles/new" element={<LearningArticleForm />} />
            <Route path="learning/articles/:id/edit" element={<LearningArticleForm />} />
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
