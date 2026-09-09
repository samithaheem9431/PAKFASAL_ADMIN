import { Router } from "express";
import {
  listLearningCrops,
  createLearningCrop,
  updateLearningCrop,
  updateLearningCropImage,
  deleteLearningCrop,
} from "../controllers/learningCropController.js";
import { adminAuth } from "../middleware/adminAuth.js";

const r = Router();
r.use(adminAuth);

r.get("/", listLearningCrops);
r.post("/", createLearningCrop);
r.put("/:id/image", updateLearningCropImage);
r.put("/:id", updateLearningCrop);
r.delete("/:id", deleteLearningCrop);

export default r;
