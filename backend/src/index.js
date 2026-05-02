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

app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") || true,
    credentials: true,
  })
);
app.use(express.json({ limit: "2mb" }));

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/crops-pests", cropsPestsRoutes);
app.use("/api/learning-articles", learningArticlesRoutes);
app.use("/api", cultivationRoutes);
app.use("/api/admins", adminsRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`PakFasal Admin API listening on port ${PORT}`);
});
