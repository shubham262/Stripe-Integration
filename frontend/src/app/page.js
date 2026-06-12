"use client";

import React, { useState } from "react";
import { Divider, notification, Spin } from "antd";
import {
	FiShoppingCart,
	FiTrash2,
	FiPlus,
	FiMinus,
	FiCreditCard,
} from "react-icons/fi";

const MOCK_PRODUCTS = [
	{ id: "price_1", name: "System Design Course", price: 99.0, image: "📘" },
	{ id: "price_2", name: "Agentic AI Masterclass", price: 149.0, image: "🤖" },
	{ id: "price_3", name: "1-on-1 Mentorship Hour", price: 199.0, image: "👨‍🏫" },
];

export default function CheckoutPage() {
	const [cart, setCart] = useState([]);
	const [isProcessing, setIsProcessing] = useState(false);

	const addToCart = (product) => {
		setCart((prev) => {
			const existing = prev.find((item) => item.id === product.id);
			if (existing) {
				return prev.map((item) =>
					item.id === product.id
						? { ...item, quantity: item.quantity + 1 }
						: item
				);
			}
			return [...prev, { ...product, quantity: 1 }];
		});

		notification.success({
			message: "Added to Cart",
			description: `${product.name} is ready for checkout.`,
			placement: "bottomRight",
			style: { backgroundColor: "#f0f9ff", color: "#0369a1" },
		});
	};

	const updateQuantity = (id, delta) => {
		setCart((prev) =>
			prev.map((item) => {
				if (item.id === id) {
					const newQuantity = Math.max(1, item.quantity + delta);
					return { ...item, quantity: newQuantity };
				}
				return item;
			})
		);
	};

	const removeFromCart = (id) => {
		setCart((prev) => prev.filter((item) => item.id !== id));
	};

	const cartTotal = cart.reduce(
		(sum, item) => sum + item.price * item.quantity,
		0
	);

	const handleCheckout = async () => {
		setIsProcessing(true);

		setTimeout(() => {
			setIsProcessing(false);
			notification.info({
				message: "Stripe Integration Pending",
				description: "This is where we will call our Node.js backend!",
				style: { backgroundColor: "#eef2ff", color: "#4338ca" },
			});
		}, 1500);
	};

	return (
		<div className="min-h-screen bg-slate-50 text-slate-700 font-sans flex flex-col md:flex-row justify-center p-4 md:p-10 gap-8">
			<div className="flex flex-col w-full md:w-3/5 gap-6">
				<div className="flex flex-col mb-4">
					<h1 className="text-3xl font-bold text-slate-800 m-0">
						University Standard Resources
					</h1>
					<p className="text-slate-500 mt-2 text-lg">
						Select your materials to proceed to secure checkout.
					</p>
				</div>

				{/* Product List using Flex Wrap instead of Grid */}
				<div className="flex flex-wrap gap-4">
					{MOCK_PRODUCTS.map((product) => (
						<div
							key={product.id}
							className="flex flex-col w-full sm:w-[calc(50%-0.5rem)] bg-white p-6 rounded-xl shadow-sm border border-slate-200 transition-all hover:shadow-md hover:border-blue-200"
						>
							<div className="text-5xl mb-4">{product.image}</div>
							<h3 className="text-xl font-semibold text-slate-800 m-0">
								{product.name}
							</h3>
							<p className="text-2xl font-light text-blue-600 mt-2 mb-6">
								${product.price.toFixed(2)}
							</p>

							<div className="mt-auto flex justify-end">
								<button
									onClick={() => addToCart(product)}
									className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors border border-blue-200 cursor-pointer"
								>
									<FiPlus /> Add to Cart
								</button>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* RIGHT COLUMN: Cart & Checkout (Stripe Placeholder) */}
			<div className="flex flex-col w-full md:w-2/5 bg-white p-8 rounded-2xl shadow-sm border border-slate-200 h-fit sticky top-10">
				<div className="flex items-center gap-3 mb-6">
					<div className="bg-blue-100 p-3 rounded-full text-blue-600">
						<FiShoppingCart size={24} />
					</div>
					<h2 className="text-2xl font-bold text-slate-800 m-0">
						Order Summary
					</h2>
				</div>

				{cart.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-10 text-slate-400">
						<FiShoppingCart size={48} className="mb-4 opacity-50" />
						<p className="text-lg">Your cart is empty.</p>
					</div>
				) : (
					<div className="flex flex-col gap-4">
						{cart.map((item) => (
							<div
								key={item.id}
								className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100"
							>
								<div className="flex flex-col">
									<span className="font-semibold text-slate-700">
										{item.name}
									</span>
									<span className="text-blue-600 font-medium">
										${item.price.toFixed(2)}
									</span>
								</div>

								<div className="flex items-center gap-3">
									<div className="flex items-center bg-white border border-slate-200 rounded-md">
										<button
											onClick={() => updateQuantity(item.id, -1)}
											className="p-2 text-slate-400 hover:text-blue-600 cursor-pointer"
										>
											<FiMinus />
										</button>
										<span className="px-2 font-medium text-slate-700">
											{item.quantity}
										</span>
										<button
											onClick={() => updateQuantity(item.id, 1)}
											className="p-2 text-slate-400 hover:text-blue-600 cursor-pointer"
										>
											<FiPlus />
										</button>
									</div>
									<button
										onClick={() => removeFromCart(item.id)}
										className="p-2 text-red-400 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
									>
										<FiTrash2 size={18} />
									</button>
								</div>
							</div>
						))}

						<Divider style={{ borderColor: "#e2e8f0", margin: "16px 0" }} />

						<div className="flex justify-between items-end mb-6">
							<span className="text-lg text-slate-500">Total Due</span>
							<span className="text-3xl font-bold text-slate-800">
								${cartTotal.toFixed(2)}
							</span>
						</div>

						<button
							onClick={handleCheckout}
							disabled={isProcessing}
							className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-blue-200"
						>
							{isProcessing ? (
								<Spin size="small" />
							) : (
								<FiCreditCard size={20} />
							)}
							{isProcessing
								? "Connecting to Stripe..."
								: "Proceed to Secure Checkout"}
						</button>
						<p className="text-center text-sm text-slate-400 mt-4 flex items-center justify-center gap-1">
							Powered securely by Stripe
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
