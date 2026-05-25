"use client";

import React from "react";
import {
	FiDollarSign,
	FiUsers,
	FiActivity,
	FiTrendingUp,
	FiCheckCircle,
	FiServer,
} from "react-icons/fi";
import { Tag } from "antd";

// Mock Data for the Dashboard
const MOCK_STATS = [
	{
		label: "Total Revenue",
		value: "$24,500.00",
		icon: <FiDollarSign size={20} />,
		color: "text-emerald-600",
		bg: "bg-emerald-50",
	},
	{
		label: "Active Subscribers",
		value: "1,204",
		icon: <FiUsers size={20} />,
		color: "text-blue-600",
		bg: "bg-blue-50",
	},
	{
		label: "API Calls (Metered)",
		value: "845k",
		icon: <FiActivity size={20} />,
		color: "text-indigo-600",
		bg: "bg-indigo-50",
	},
	{
		label: "Platform MRR",
		value: "$4,200.50",
		icon: <FiTrendingUp size={20} />,
		color: "text-violet-600",
		bg: "bg-violet-50",
	},
];

const RECENT_WEBHOOKS = [
	{
		id: "evt_1",
		type: "payment_intent.succeeded",
		status: "200 OK",
		time: "2 mins ago",
	},
	{
		id: "evt_2",
		type: "customer.subscription.created",
		status: "200 OK",
		time: "15 mins ago",
	},
	{
		id: "evt_3",
		type: "invoice.payment_failed",
		status: "400 ERR",
		time: "1 hour ago",
		isError: true,
	},
	{
		id: "evt_4",
		type: "checkout.session.completed",
		status: "200 OK",
		time: "2 hours ago",
	},
];

export default function OverviewPage() {
	return (
		<div className="flex flex-col gap-8 pb-10 text-slate-700">
			{/* Welcome Banner */}
			<div className="flex flex-col bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
				<h1 className="text-3xl font-bold text-slate-800 m-0">
					Welcome to the Stripe Masterclass
				</h1>
				<p className="text-lg text-slate-500 mt-2 max-w-3xl">
					This dashboard represents the end-state of our architecture. Over the
					next few modules, we will build the Node.js infrastructure to power
					everything you see here—from one-time payments to complex usage-based
					billing.
				</p>
			</div>

			{/* KPI Stats Row (Flex Wrap) */}
			<div className="flex flex-wrap gap-4">
				{MOCK_STATS.map((stat, idx) => (
					<div
						key={idx}
						className="flex flex-col flex-1 min-w-[240px] bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
					>
						<div className="flex justify-between items-start mb-4">
							<span className="text-slate-500 font-medium">{stat.label}</span>
							<div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
								{stat.icon}
							</div>
						</div>
						<span className="text-3xl font-bold text-slate-800">
							{stat.value}
						</span>
					</div>
				))}
			</div>

			{/* Main Content Area: Split into two sections using Flex */}
			<div className="flex flex-col lg:flex-row gap-6">
				{/* Left Column: Curriculum Roadmap */}
				<div className="flex flex-col flex-1 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
					<div className="flex items-center gap-3 mb-6">
						<div className="bg-blue-100 p-2 rounded-lg text-blue-600">
							<FiCheckCircle size={24} />
						</div>
						<h2 className="text-2xl font-bold text-slate-800 m-0">
							Integration Roadmap
						</h2>
					</div>

					<div className="flex flex-col gap-6">
						<div className="flex gap-4 border-l-2 border-blue-200 pl-4 pb-2">
							<div className="flex flex-col">
								<span className="text-lg font-bold text-slate-800">
									1. One-Time Payments
								</span>
								<span className="text-slate-500 mt-1">
									PaymentIntents, Stripe Elements, and secure backend
									calculation.
								</span>
							</div>
						</div>
						<div className="flex gap-4 border-l-2 border-slate-100 pl-4 pb-2 opacity-60">
							<div className="flex flex-col">
								<span className="text-lg font-bold text-slate-800">
									2. SaaS Subscriptions
								</span>
								<span className="text-slate-500 mt-1">
									Customer objects, recurring billing, and the Customer Portal.
								</span>
							</div>
						</div>
						<div className="flex gap-4 border-l-2 border-slate-100 pl-4 pb-2 opacity-60">
							<div className="flex flex-col">
								<span className="text-lg font-bold text-slate-800">
									3. Usage-Based Billing
								</span>
								<span className="text-slate-500 mt-1">
									Metered billing for APIs, AI tokens, and platform consumption.
								</span>
							</div>
						</div>
						<div className="flex gap-4 border-l-2 border-slate-100 pl-4 pb-2 opacity-60">
							<div className="flex flex-col">
								<span className="text-lg font-bold text-slate-800">
									4. Stripe Connect
								</span>
								<span className="text-slate-500 mt-1">
									Multi-party marketplace routing and platform fee collection.
								</span>
							</div>
						</div>
					</div>
				</div>

				{/* Right Column: Webhook Simulator */}
				<div className="flex flex-col w-full lg:w-[400px] bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-md text-slate-300">
					<div className="flex items-center justify-between mb-6">
						<div className="flex items-center gap-3">
							<div className="bg-slate-700 p-2 rounded-lg text-emerald-400">
								<FiServer size={24} />
							</div>
							<h2 className="text-xl font-bold text-white m-0">
								Live Webhooks
							</h2>
						</div>
						<div className="flex items-center gap-2">
							<span className="relative flex h-3 w-3">
								<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
								<span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
							</span>
							<span className="text-xs font-mono text-emerald-400">
								Listening
							</span>
						</div>
					</div>

					<div className="flex flex-col gap-3 font-mono text-sm">
						{RECENT_WEBHOOKS.map((hook) => (
							<div
								key={hook.id}
								className="flex flex-col bg-slate-900 p-3 rounded-lg border border-slate-700"
							>
								<div className="flex justify-between items-center mb-2">
									<span
										className={`${
											hook.isError ? "text-red-400" : "text-blue-400"
										}`}
									>
										{hook.type}
									</span>
									<span className="text-slate-500 text-xs">{hook.time}</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-slate-400 text-xs">ID: {hook.id}</span>
									<Tag
										color={hook.isError ? "error" : "success"}
										bordered={false}
									>
										{hook?.status}
									</Tag>
								</div>
							</div>
						))}
					</div>

					<div className="mt-auto pt-6">
						<p className="text-xs text-slate-400 text-center italic">
							Note: The Webhook engine is the absolute source of truth for your
							MongoDB database. We will build this in Module 6.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
