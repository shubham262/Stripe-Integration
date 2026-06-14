import express from "express";
import {
	seedProductsController,
	fetchAllProductsController,
	createCheckoutSessionController,
	createPlanController,
	fetchAllPlansController,
	createSubscriptionSessionController,
} from "../controllers/ecommerceController.js";
import { checkUserAuth } from "../middleware/index.js";
const router = express.Router();

router.post("/seed", seedProductsController);
router.get("/products", fetchAllProductsController);
router.post("/checkout", checkUserAuth, createCheckoutSessionController);
router.post("/plans", createPlanController);
router.get("/plans", fetchAllPlansController);
router.post(
	"/create-subscription",
	checkUserAuth,
	createSubscriptionSessionController
);

export default router;
