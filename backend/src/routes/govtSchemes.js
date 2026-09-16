import { Router } from "express";
import {
  listGovtSchemes,
  createGovtScheme,
  updateGovtScheme,
  deleteGovtScheme,
} from "../controllers/govtSchemeController.js";
import { adminAuth } from "../middleware/adminAuth.js";

const r = Router();
r.use(adminAuth);

r.get("/", listGovtSchemes);
r.post("/", createGovtScheme);
r.put("/:id", updateGovtScheme);
r.delete("/:id", deleteGovtScheme);

export default r;
