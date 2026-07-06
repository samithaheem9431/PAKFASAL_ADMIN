import "dotenv/config";
import express from "express";
import cors from "cors";
import "./firebaseAdmin.js";
import { createSessionMiddleware } from "./config/session.js";

import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import uploadRoutes from "./routes/upload.js";
import adminsRoutes from "./routes/admins.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.set("trust proxy", 1);

/**
 * ✅ CORS FIX (VERY IMPORTANT)
 * Allows your frontend (Vercel) to talk to backend (Render)
 */
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      // allow all Vercel domains + localhost
      if (
        origin.includes("vercel.app") ||
        origin.includes("localhost")
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
