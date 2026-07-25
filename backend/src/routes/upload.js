import { Router } from "express";
import multer from "multer";
import { mkdirSync } from "fs";
import { join, dirname, extname } from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";
import { uploadImage } from "../controllers/uploadController.js";
import { adminAuth } from "../middleware/adminAuth.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
export const uploadsDir = join(__dirname, "../../uploads");
mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = extname(file.originalname || "") || ".jpg";
    const safeExt = ext.match(/^\.[a-z0-9]+$/i) ? ext.toLowerCase() : ".jpg";
    cb(null, `${randomUUID()}${safeExt}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (/^image\/(jpeg|png|gif|webp)$/i.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG, GIF, WebP allowed"));
    }
  },
});

const r = Router();
r.use(adminAuth);
r.post("/", upload.single("file"), uploadImage);

export default r;
