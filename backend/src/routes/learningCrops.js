import { Router } from "express";
import {
  listLearningCrops,
  createLearningCrop,
  updateLearningCrop,
  deleteLearningCrop,
} from "../controllers/learningCropController.js";
import { adminAuth } from "../middleware/adminAuth.js";

const r = Router();
r.use(adminAuth);

r.get("/", listLearningCrops);
r.post("/", createLearningCrop);
r.put("/:id", updateLearningCrop);
r.delete("/:id", deleteLearningCrop);

export default r;
