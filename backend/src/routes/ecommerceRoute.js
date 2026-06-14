import express from "express";
import {
	seedProductsController,
	fetchAllProductsController,
	createCheckoutSessionController,
	fetchStripePaymentyStaus,
} from "../controllers/ecommerceController.js";
import { checkUserAuth } from "../middleware/index.js";

const router = express.Router();

router.post("/seed", seedProductsController);
router.get("/products", fetchAllProductsController);
router.post("/create-checkout", checkUserAuth, createCheckoutSessionController);
router.get(
	"/stripe-payment-status/:stripeId",
	checkUserAuth,
	fetchStripePaymentyStaus
);

export default router;
