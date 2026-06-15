import express from "express";
import {
	seedProductsController,
	fetchAllProductsController,
	createCheckoutSessionController,
	fetchStripePaymentyStaus,
	seedPlansController,
	fetchAllPlans,
	createSubscriptionSessionController,
} from "../controllers/ecommerceController.js";
import { checkUserAuth } from "../middleware/index.js";

const router = express.Router();

router.post("/seed", seedProductsController);
router.get("/products", fetchAllProductsController);
router.post("/plans", seedPlansController);
router.get("/plans", fetchAllPlans);
router.post("/create-checkout", checkUserAuth, createCheckoutSessionController);
router.post(
	"/create-subscription",
	checkUserAuth,
	createSubscriptionSessionController
);
router.get(
	"/stripe-payment-status/:stripeId",
	checkUserAuth,
	fetchStripePaymentyStaus
);

export default router;
