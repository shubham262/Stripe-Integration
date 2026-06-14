import mongoose from "mongoose";

const planSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
		},
		description: {
			type: String,
			required: true,
		},

		stripeProductId: {
			type: String,
			required: true,
			unique: true,
		},
		features: [
			{
				type: String,
			},
		],
		active: {
			type: Boolean,
			default: true,
		},

		pricingOptions: [
			{
				interval: {
					type: String,
					enum: ["month", "year"],
					required: true,
				},
				price: {
					type: Number,
					required: true, // Store in smallest unit (paise/cents)
				},
				currency: {
					type: String,
					default: "inr",
				},

				stripePriceId: {
					type: String,
					required: true,
				},
			},
		],
	},
	{ timestamps: true }
);
const Plan = mongoose.model("Plan", planSchema);
export default Plan;
