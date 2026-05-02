import { Router } from "express";
import {
  listCropsPests,
  createCropsPests,
  updateCropsPests,
  deleteCropsPests,
} from "../controllers/cropsPestsController.js";
import { adminAuth } from "../middleware/adminAuth.js";

const r = Router();
r.use(adminAuth);

r.get("/", listCropsPests);
r.post("/", createCropsPests);
r.put("/:id", updateCropsPests);
r.delete("/:id", deleteCropsPests);

export default r;
