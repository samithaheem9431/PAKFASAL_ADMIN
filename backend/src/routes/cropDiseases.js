import { Router } from "express";
import {
  listCropDiseases,
  createCropDisease,
  updateCropDisease,
  deleteCropDisease,
} from "../controllers/cropDiseaseController.js";
import { adminAuth } from "../middleware/adminAuth.js";

const r = Router();
r.use(adminAuth);

r.get("/", listCropDiseases);
r.post("/", createCropDisease);
r.put("/:id", updateCropDisease);
r.delete("/:id", deleteCropDisease);

export default r;
