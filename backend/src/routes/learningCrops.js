import { Router } from "express";
import multer from "multer";
import {
  listLearningCrops,
  createLearningCrop,
  updateLearningCrop,
  deleteLearningCrop,
} from "../controllers/learningCropController.js";
import { adminAuth } from "../middleware/adminAuth.js";

const upload = multer({
  storage: multer.memoryStorage(),
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

r.get("/", listLearningCrops);
r.post("/", upload.single("file"), createLearningCrop);
r.put("/:id", upload.single("file"), updateLearningCrop);
r.delete("/:id", deleteLearningCrop);

export default r;
