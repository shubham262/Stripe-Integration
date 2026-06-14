import stripe from "../config/stripe.js";
import { seedProducts } from "../constants/index.js";
import db from "../models/index.js";
const { Product, Order, Plan, Subscription } = db;

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
export const fetchAllProductsController = async (req, res) => {
	try {
		const products = await Product.find();
		return res.status(201).json({
			success: true,
			message: "Fetch all products successfully",
			products,
		});
	} catch (error) {
		console.error("[fetchAllProductsController] Critical Error:", error);

		return res.status(500).json({
			success: false,
			error: "Failed to fetch products",
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
			allow_promotion_codes: true,
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
	const sig = req.headers["stripe-signature"];
	const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
	let event;

	try {
		// We use req.body (raw buffer) to construct the secure event
		event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
	} catch (err) {
		console.error(
			`[Webhook Security Error]: Signature verification failed.`,
			err.message
		);
		return res.status(400).send(`Webhook Error: ${err.message}`);
	}

	try {
		switch (event.type) {
			// ==========================================
			// 1. THE CHECKOUT COMPLETED EVENT
			// Fires once when the user finishes entering their card on the hosted page
			// ==========================================
			case "checkout.session.completed": {
				const session = event.data.object;

				// BRANCH A: ONE-TIME E-COMMERCE PAYMENT
				if (session.mode === "payment") {
					const updatedOrder = await Order.findOneAndUpdate(
						{ stripePaymentIntentId: session.id },
						{
							$set: {
								status: "paid",
								stripePaymentIntentStatus: session.payment_status,
								paidAt: new Date(),
							},
						},
						{ new: true }
					);

					if (updatedOrder) {
						console.log(
							`✅ SUCCESS: E-commerce Order ${updatedOrder._id} marked as PAID.`
						);
					} else {
						console.error(
							`⚠️ CRITICAL: Order not found for session ID: ${session.id}`
						);
					}
				}

				// BRANCH B: RECURRING SUBSCRIPTION CREATION
				else if (session.mode === "subscription") {
					// Extract the IDs we passed in the controller earlier
					const userId = session.metadata.userId;
					const planId = session.metadata.planId;

					const stripeCustomerId = session.customer;
					const stripeSubscriptionId = session.subscription;

					// Create the initial subscription record in MongoDB
					await Subscription.create({
						userId: userId,
						planId: planId,
						stripeCustomerId: stripeCustomerId,
						stripeSubscriptionId: stripeSubscriptionId,
						status: "active",
						// Give them 30 days initial access. The exact timestamp will be
						// updated by the 'invoice.payment_succeeded' event that fires immediately after this.
						currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
					});

					console.log(
						`✅ SUCCESS: Subscription ${stripeSubscriptionId} created for User ${userId}.`
					);
				}
				break;
			}

			// ==========================================
			// 2. SUBSCRIPTION RENEWAL (OR INITIAL PAYMENT)
			// Fires every time an invoice is successfully paid
			// ==========================================
			case "invoice.payment_succeeded": {
				const invoice = event.data.object;

				// Ensure this invoice is for a subscription (not a random one-off invoice)
				if (invoice.subscription) {
					const stripeSubscriptionId = invoice.subscription;

					// Stripe's invoice line items contain the exact unix timestamp for when this new paid period ends
					const periodEndUnix = invoice.lines.data[0].period.end;

					await Subscription.findOneAndUpdate(
						{ stripeSubscriptionId: stripeSubscriptionId },
						{
							$set: {
								status: "active",
								currentPeriodEnd: new Date(periodEndUnix * 1000), // Convert Unix to JS Date
							},
						}
					);
					console.log(
						`🔄 RENEWAL: Subscription ${stripeSubscriptionId} extended to ${new Date(
							periodEndUnix * 1000
						).toLocaleDateString()}.`
					);
				}
				break;
			}

			// ==========================================
			// 3. PAYMENT FAILED (CARD EXPIRED, INSUFFICIENT FUNDS)
			// ==========================================
			case "invoice.payment_failed": {
				const invoice = event.data.object;
				if (invoice.subscription) {
					await Subscription.findOneAndUpdate(
						{ stripeSubscriptionId: invoice.subscription },
						{ $set: { status: "past_due" } }
					);
					console.warn(
						`⚠️ FAILED: Payment failed for subscription ${invoice.subscription}. Marked as past_due.`
					);
				}
				break;
			}

			// ==========================================
			// 4. SUBSCRIPTION CANCELED
			// Fires if the user cancels via Customer Portal, or if all retries fail
			// ==========================================
			case "customer.subscription.deleted": {
				const subscription = event.data.object;

				await Subscription.findOneAndUpdate(
					{ stripeSubscriptionId: subscription.id },
					{ $set: { status: "canceled" } }
				);
				console.log(
					`❌ CANCELED: Subscription ${subscription.id} has been fully terminated.`
				);
				break;
			}

			// E-commerce session expired logic
			case "checkout.session.expired": {
				const session = event.data.object;
				await Order.findOneAndUpdate(
					{ stripePaymentIntentId: session.id },
					{ $set: { status: "canceled" } }
				);
				console.log(`⏱️ E-commerce session expired for ID: ${session.id}.`);
				break;
			}

			default:
				console.log(`ℹ️ Unhandled event type: ${event.type}`);
		}

		// Always return 200 quickly so Stripe stops retrying
		res.status(200).send();
	} catch (error) {
		console.error("[Webhook Database Error]:", error);
		res.status(500).send("Internal Server Error during fulfillment.");
	}
};
export const fetchAllPlansController = async (req, res) => {
	try {
		const plans = await Plan.find({ active: true }).sort({ createdAt: 1 });

		return res.status(200).json({
			success: true,
			message: "Successfully fetched active plans",
			count: plans.length,
			data: plans,
		});
	} catch (error) {
		console.error("[fetchAllPlansController] Critical Error:", error);

		return res.status(500).json({
			success: false,
			error: "Failed to fetch all plans",
			details: error.message,
		});
	}
};

export const createPlanController = async (req, res) => {
	try {
		const {
			name,
			description,
			stripeProductId,
			features,
			pricingOptions,
			active,
		} = req.body;

		if (
			!name ||
			!description ||
			!stripeProductId ||
			!pricingOptions ||
			!Array.isArray(pricingOptions)
		) {
			return res.status(400).json({
				success: false,
				error:
					"Missing or invalid fields. 'name', 'description', 'stripeProductId', and 'pricingOptions' (array) are required.",
			});
		}

		const existingPlan = await Plan.findOne({ stripeProductId });
		if (existingPlan) {
			return res.status(409).json({
				// 409 Conflict
				success: false,
				error: `A plan linked to Stripe Product ID ${stripeProductId} already exists.`,
			});
		}

		const newPlan = await Plan.create({
			name,
			description,
			stripeProductId,
			features: features || [],
			pricingOptions,
			active: active !== undefined ? active : true,
		});

		return res.status(201).json({
			success: true,
			message: "Plan successfully created",
			data: newPlan,
		});
	} catch (error) {
		console.error("[createPlanController] Critical Error:", error);

		return res.status(500).json({
			success: false,
			error: "Failed to create plan",
			details: error.message,
		});
	}
};

export const createSubscriptionSessionController = async (req, res) => {
	try {
		const userId = req.user.id;

		const { planId, interval } = req.body;

		if (!planId || !interval) {
			return res.status(400).json({
				success: false,
				error: "Plan ID and interval (month/year) are required.",
			});
		}

		const plan = await Plan.findById(planId);

		if (!plan || !plan.active) {
			return res.status(404).json({
				success: false,
				error: "Selected plan is unavailable or no longer exists.",
			});
		}

		const pricingOption = plan.pricingOptions.find(
			(option) => option.interval === interval
		);

		if (!pricingOption || !pricingOption.stripePriceId) {
			return res.status(400).json({
				success: false,
				error: `Pricing for the ${interval} interval is not configured for this plan.`,
			});
		}

		const session = await stripe.checkout.sessions.create({
			payment_method_types: ["card"],
			mode: "subscription",

			line_items: [
				{
					price: pricingOption.stripePriceId,
					quantity: 1,
				},
			],
			allow_promotion_codes: true,
			success_url: `http://localhost:3000/dashboard/success?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `http://localhost:3000/dashboard/pricing`, // Redirect back to pricing page if they back out

			client_reference_id: userId.toString(),

			metadata: {
				userId: userId.toString(),
				planId: planId.toString(),
				interval: interval,
			},
		});

		return res.status(200).json({
			success: true,
			url: session.url,
		});
	} catch (error) {
		console.error(
			"[createSubscriptionSessionController] Critical Error:",
			error
		);
		return res.status(500).json({
			success: false,
			error: "Failed to initialize subscription checkout",
			details: error.message,
		});
	}
};
