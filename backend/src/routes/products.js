import { Router } from "express";
import {
  listProducts,
  createProduct,
  updateProduct,
  softDeleteProduct,
} from "../controllers/productController.js";
import { adminAuth } from "../middleware/adminAuth.js";

const r = Router();
r.use(adminAuth);

r.get("/", listProducts);
r.post("/", createProduct);
r.put("/:id", updateProduct);
r.delete("/:id", softDeleteProduct);

export default r;
