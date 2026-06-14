import express from "express";
import {
	seedProductsController,
	fetchAllProductsController,
	createCheckoutSessionController,
} from "../controllers/ecommerceController.js";
import { checkUserAuth } from "../middleware/index.js";
const router = express.Router();

router.post("/seed", seedProductsController);
router.get("/products", fetchAllProductsController);
router.post("/checkout", checkUserAuth, createCheckoutSessionController);

export default router;
