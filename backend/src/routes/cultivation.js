import { Router } from "express";
import {
  listCultivationStages,
  createCultivationStage,
  updateCultivationStage,
  deleteCultivationStage,
  listCropDocs,
  ensureCropDoc,
} from "../controllers/cultivationController.js";
import { adminAuth } from "../middleware/adminAuth.js";

const r = Router();
r.use(adminAuth);

r.get("/crops", listCropDocs);
r.post("/crops", ensureCropDoc);
r.get("/crops/:cropId/stages", listCultivationStages);
r.post("/crops/:cropId/stages", createCultivationStage);
r.put("/crops/:cropId/stages/:stageId", updateCultivationStage);
r.delete("/crops/:cropId/stages/:stageId", deleteCultivationStage);

export default r;
