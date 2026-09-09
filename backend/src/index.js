import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import "./firebaseAdmin.js";
import { createSessionMiddleware } from "./config/session.js";
import { isCloudinaryConfigured } from "./utils/cloudinaryUpload.js";

import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import uploadRoutes from "./routes/upload.js";
import adminsRoutes from "./routes/admins.js";
import learningCropsRoutes from "./routes/learningCrops.js";
import cropDiseasesRoutes from "./routes/cropDiseases.js";
import learningArticlesRoutes from "./routes/learningArticles.js";
import articleSectionsRoutes from "./routes/articleSections.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.set("trust proxy", 1);

/**
 * ✅ CORS FIX (VERY IMPORTANT)
 * Allows your frontend (Vercel) to talk to backend (Render)
 */
const allowedOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (
        origin.includes("vercel.app") ||
        origin.includes("localhost") ||
        allowedOrigins.includes(origin)
      ) {
        return callback(null, true);
      }

      return callback(new Error("CORS not allowed"), false);
    },
    credentials: true,
  })
);

app.use(createSessionMiddleware());

/**
 * Body parser
 */
app.use(express.json({ limit: "2mb" }));

/** Legacy local uploads folder (optional; new uploads go to Cloudinary) */
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

/**
 * Health check
 */
app.get("/", (req, res) => {
  res.send("PakFasal Backend is running 🚀");
});

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    cloudinary: isCloudinaryConfigured(),
    version: "crop-form-v6",
  });
});

/**
 * Routes
 */
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/admins", adminsRoutes);
app.use("/api/learning-crops", learningCropsRoutes);
app.use("/api/crop-diseases", cropDiseasesRoutes);
app.use("/api/learning-articles", learningArticlesRoutes);
app.use("/api/article-sections", articleSectionsRoutes);

/**
 * Error handler
 */
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err?.message || "Internal server error" });
});

/**
 * Start server
 */
app.listen(PORT, () => {
  console.log(`PakFasal Admin API running on port ${PORT}`);
  console.log(`Cloudinary configured: ${isCloudinaryConfigured()}`);
});
