import "dotenv/config";
import express from "express";
import cors from "cors";
import "./firebaseAdmin.js";

import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import uploadRoutes from "./routes/upload.js";
import cropsPestsRoutes from "./routes/cropsPests.js";
import learningArticlesRoutes from "./routes/learningArticles.js";
import cultivationRoutes from "./routes/cultivation.js";
import adminsRoutes from "./routes/admins.js";

const app = express();
const PORT = process.env.PORT || 4000;

/**
 * ✅ CORS FIX (VERY IMPORTANT)
 * Allows your frontend (Vercel) to talk to backend (Render)
 */
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://pakfasal-admin.vercel.app",
      "https://pakfasal-admin-gbzcbdqee-abdul-samis-projects-c481c0a1.vercel.app"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

/**
 * Body parser
 */
app.use(express.json({ limit: "2mb" }));

/**
 * Health check
 */
app.get("/", (req, res) => {
  res.send("PakFasal Backend is running 🚀");
});

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

/**
 * Routes
 */
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/crops-pests", cropsPestsRoutes);
app.use("/api/learning-articles", learningArticlesRoutes);
app.use("/api", cultivationRoutes);
app.use("/api/admins", adminsRoutes);

/**
 * Error handler
 */
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

/**
 * Start server
 */
app.listen(PORT, () => {
  console.log(`PakFasal Admin API running on port ${PORT}`);
});