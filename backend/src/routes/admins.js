import { Router } from "express";
import { adminAuth } from "../middleware/adminAuth.js";
import { requireSuperAdmin } from "../middleware/requireSuperAdmin.js";
import {
  listAdmins,
  createAdmin,
  removeAdmin,
} from "../controllers/adminManagementController.js";

const r = Router();
r.use(adminAuth, requireSuperAdmin);

r.get("/", listAdmins);
r.post("/", createAdmin);
r.delete("/:uid", removeAdmin);

export default r;

