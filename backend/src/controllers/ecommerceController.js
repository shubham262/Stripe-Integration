import stripe from "../config/stripe.js";
import { seedProducts } from "../constants/index.js";
import db from "../models/index.js";
const { Product, Order } = db;

export const seedProductsController = async (req, res) => {
	try {
		await Product.deleteMany({});

		const seededProducts = await Product.insertMany(seedProducts);

		return res.status(201).json({
			success: true,
			message: "Database successfully seeded with FullStackLife curriculum.",
			count: seededProducts.length,
			data: seededProducts,
		});
	} catch (error) {
		console.error("[seedProductsController] Critical Error:", error);

		return res.status(500).json({
			success: false,
			error: "Failed to seed products",
			details: error.message,
		});
	}
};

export const createCheckoutSessionController = async (req, res) => {
	try {
		const userId = req.user.id;
		const { items } = req.body;

		if (!items || !Array.isArray(items) || items.length === 0) {
			return res.status(400).json({
				success: false,
				error: "Cannot create a checkout session with an empty cart.",
			});
		}

		const lineItems = [];
		let totalAmountInCents = 0;
		const orderSnapshotItems = [];
		// Validate each item
		for (const item of items) {
			if (!item?._id) {
				return res.status(400).json({
					success: false,
					error: "One or more items are missing a valid product ID.",
				});
			}

			if (
				!item.quantity ||
				!Number.isInteger(item.quantity) ||
				item.quantity < 1
			) {
				return res.status(400).json({
					success: false,
					error: `Invalid quantity provided for product ID: ${item._id}.`,
				});
			}

			const product = await Product.findById(item._id);

			if (!product || !product.active) {
				return res.status(404).json({
					success: false,
					error: `Product with ID ${item._id} is unavailable or no longer exists.`,
				});
			}

			lineItems.push({
				price_data: {
					currency: "inr",
					product_data: {
						name: product.name,
						description: product.description,
					},
					unit_amount: product.price,
				},
				quantity: item.quantity,
			});
			const lineTotal = product.price * item.quantity;
			totalAmountInCents += lineTotal;

			orderSnapshotItems.push({
				productId: product._id,
				name: product.name,
				slug: product.slug,
				quantity: item.quantity,
				unitAmount: product.price,
				lineTotal: lineTotal,
				currency: product.currency,
			});
		}

		const session = await stripe.checkout.sessions.create({
			payment_method_types: ["card", "upi"], // Stripe can also add Apple Pay, iDEAL, etc.
			line_items: lineItems,
			mode: "payment", // "payment" for one-time, "subscription" for SaaS

			// These URLs are where Stripe will redirect the user after the attempt
			success_url: `http://localhost:3000/dashboard/success?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `http://localhost:3000/dashboard/ecommerce`,

			metadata: {
				userId: userId.toString(),
			},
		});

		await Order.create({
			userId: userId,
			items: orderSnapshotItems,
			subtotalAmount: totalAmountInCents,
			totalAmount: totalAmountInCents,
			currency: "usd",
			status: "pending",
			stripePaymentIntentId: session.id, // Store the Session ID for the webhook
		});

		// 4. Return the secure Stripe URL to the Next.js frontend
		return res.status(200).json({
			success: true,
			url: session.url, // e.g., https://checkout.stripe.com/c/pay/...
		});
	} catch (error) {
		console.error("[seedProductsController] Critical Error:", error);
	}
};

export const stripeWebhookController = async (req, res) => {
	// Extract the cryptographic signature provided by Stripe
	const sig = req.headers["stripe-signature"];
	const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
	let event;

	try {
		// 1. Verify the Signature
		// 🚨 CRITICAL: req.body MUST be a raw Buffer here, not a parsed JSON object.
		event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
	} catch (err) {
		console.error(
			`[Webhook Security Error]: Signature verification failed.`,
			err.message
		);
		// Immediately reject malicious or malformed requests
		return res.status(400).send(`Webhook Error: ${err.message}`);
	}

	// 2. The State Machine Router
	try {
		switch (event.type) {
			case "checkout.session.completed": {
				const session = event.data.object;

				// 3. Fulfill the Order
				// We saved the session.id as the stripePaymentIntentId when creating the order
				const updatedOrder = await Order.findOneAndUpdate(
					{ stripePaymentIntentId: session.id },
					{
						$set: {
							status: "paid",
							stripePaymentIntentStatus: session.payment_status,
							paidAt: new Date(),
						},
					},
					{ new: true } // Return the updated document
				);

				if (updatedOrder) {
					console.log(
						`✅ SUCCESS: Order ${updatedOrder._id} has been marked as PAID.`
					);
					// TODO: Here you would trigger course access, email receipts, etc.
				} else {
					console.error(
						`⚠️ CRITICAL: Payment succeeded, but Order was not found for session ID: ${session.id}`
					);
				}
				break;
			}

			case "checkout.session.expired": {
				const session = event.data.object;
				await Order.findOneAndUpdate(
					{ stripePaymentIntentId: session.id },
					{ $set: { status: "canceled" } }
				);
				console.log(
					`⏱️ Session expired for ID: ${session.id}. Order canceled.`
				);
				break;
			}

			default:
				// It's normal to receive events you don't explicitly handle.
				console.log(`ℹ️ Unhandled event type: ${event.type}`);
		}

		// 4. Acknowledge Receipt
		// You MUST return a 200 quickly so Stripe knows you received it and stops retrying.
		res.status(200).send();
	} catch (error) {
		console.error("[Webhook Database Error]:", error);
		res.status(500).send("Internal Server Error during fulfillment.");
	}
};
