import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},
		planId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Plan",
			required: true,
		},
		stripeCustomerId: {
			type: String,
			required: true,
			index: true,
		},
		stripeSubscriptionId: {
			type: String,
			required: true,
			unique: true,
		},
		status: {
			type: String,
			enum: [
				"incomplete",
				"incomplete_expired",
				"trialing",
				"active",
				"past_due",
				"canceled",
				"unpaid",
			],
			required: true,
			default: "incomplete",
		},
		currentPeriodEnd: {
			type: Date,
			required: true,
		},
		cancelAtPeriodEnd: {
			type: Boolean,
			default: false,
		},
	},
	{ timestamps: true }
);

// Helper method to easily check active status in your middleware
subscriptionSchema.methods.isValid = function () {
	return (
		this.status === "active" && new Date(this.currentPeriodEnd) > new Date()
	);
};
const Subscription = mongoose.model("Subscription", subscriptionSchema);
export default Subscription;
