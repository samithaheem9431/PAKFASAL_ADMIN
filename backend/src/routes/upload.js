import { Router } from "express";
import multer from "multer";
import { uploadImage } from "../controllers/uploadController.js";
import { adminAuth } from "../middleware/adminAuth.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
});

const r = Router();
r.use(adminAuth);
r.post("/", upload.single("file"), uploadImage);

export default r;
