import express from "express";
import { seedProductsController } from "../controllers/ecommerceController.js";
const router = express.Router();

router.post("/seed", seedProductsController);

export default router;
