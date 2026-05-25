/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { Spin } from "antd";
import { FiMonitor, FiArrowRight, FiShield } from "react-icons/fi";
import CheckoutForm from "@/components/ecommerce/CheckoutForm";

// Initialize Stripe (Replace with your actual public key in the tutorial)
// Make sure to emphasize to learners: NEVER put the Secret Key here!
const stripePromise = loadStripe(
	process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "pk_test_placeholder"
);

export default function EcommerceModule() {
	const [clientSecret, setClientSecret] = useState("");
	const [isCreatingIntent, setIsCreatingIntent] = useState(false);

	const product = {
		name: "System Design HLD Master Course",
		price: 99.0,
		description:
			"Complete lifetime access to the university-standard architecture curriculum.",
	};

	const handleInitializePayment = () => {
		setIsCreatingIntent(true);

		// TODO for the tutorial: Replace this setTimeout with a real fetch() call to the Node.js backend
		// e.g., fetch('/api/create-payment-intent', { method: 'POST', body: JSON.stringify({ items: [...] }) })
		setTimeout(() => {
			// Mocking the client_secret returned from Node.js
			setClientSecret("pi_mock_secret_12345_secret_67890");
			setIsCreatingIntent(false);
		}, 1500);
	};

	return (
		<div className="flex flex-col gap-8 text-slate-700 max-w-5xl mx-auto">
			{/* Header */}
			<div className="flex flex-col">
				<h1 className="text-3xl font-bold text-slate-800 m-0">
					Module 1: One-Time Payments
				</h1>
				<p className="text-slate-500 mt-2 text-lg">
					Implementing the PaymentIntent API for direct transactional sales.
				</p>
			</div>

			<div className="flex flex-col md:flex-row gap-8">
				{/* Left Side: Product Selection */}
				<div className="flex flex-col flex-1 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm h-fit">
					<div className="bg-blue-50 w-16 h-16 rounded-xl flex items-center justify-center text-blue-600 mb-6">
						<FiMonitor size={32} />
					</div>

					<h2 className="text-2xl font-bold text-slate-800 mb-2">
						{product.name}
					</h2>
					<p className="text-slate-500 mb-6">{product.description}</p>
					<div className="text-4xl font-light text-blue-600 mb-8">
						${product.price.toFixed(2)}
					</div>

					{!clientSecret && (
						<button
							onClick={handleInitializePayment}
							disabled={isCreatingIntent}
							className="flex items-center justify-center gap-2 w-full bg-slate-800 text-white py-4 rounded-xl font-bold text-lg hover:bg-slate-900 transition-colors disabled:opacity-70 cursor-pointer"
						>
							{isCreatingIntent ? (
								<Spin size="small" />
							) : (
								<>
									Generate Payment Intent <FiArrowRight />
								</>
							)}
						</button>
					)}

					{clientSecret && (
						<div className="bg-emerald-50 text-emerald-700 p-4 rounded-lg border border-emerald-100 flex flex-col gap-1">
							<span className="font-bold">✅ PaymentIntent Created!</span>
							<span className="text-sm font-mono opacity-80 break-all">
								{clientSecret}
							</span>
						</div>
					)}
				</div>

				{/* Right Side: Stripe Elements UI */}
				<div className="flex flex-col w-full md:w-[450px]">
					{clientSecret ? (
						<div className="animate-fade-in">
							<Elements
								stripe={stripePromise}
								options={{ clientSecret, appearance: { theme: "stripe" } }}
							>
								{/* <CheckoutForm amount={product.price} /> */}
							</Elements>
						</div>
					) : (
						<div className="flex flex-col items-center justify-center h-full min-h-[300px] bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 p-8 text-center">
							<FiShield size={48} className="mb-4 opacity-50 text-slate-300" />
							<p className="text-lg font-medium text-slate-500 mb-2">
								Waiting for Backend...
							</p>
							<p className="text-sm">
								Click "Generate Payment Intent" to simulate the Node.js response
								and load the Stripe form.
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
