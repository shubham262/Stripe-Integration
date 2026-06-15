export const seedProducts = [
	{
		name: "System Design Course",
		slug: "system-design-course",
		description:
			"Learn scalable architecture, tradeoffs, and interview-ready design patterns.",
		price: 990000,
		currency: "inr",
		active: true,
	},
	{
		name: "Full Stack Course",
		slug: "full-stack-course",
		description:
			"Build complete web apps with frontend, backend, database, and deployment.",
		price: 890000,
		currency: "inr",
		active: true,
	},
	{
		name: "Frontend Development Course",
		slug: "frontend-development-course",
		description:
			"Master modern UI engineering, React patterns, and responsive interfaces.",
		price: 790000,
		currency: "inr",
		active: true,
	},
];

export const seedPlans = [
	{
		name: "PW Pro",
		description: "Access to advance features",

		stripeProductId: "prod_Uhmf4UPBp8ZfX7",
		features: [],

		pricingOptions: [
			{
				interval: "month",
				price: 50000,
				currency: "inr",
				stripePriceId: "price_1TiN6TEk8mXXs8wbpvMTasyg",
			},
			{
				interval: "year",
				price: 5000000,
				currency: "inr",
				stripePriceId: "price_1TiN6xEk8mXXs8wbaSj9VzbH",
			},
		],
	},
	{
		name: "PW Basic",
		description: "Basic Plan",

		stripeProductId: "prod_UhmhKlaVojoY4m",
		features: [],

		pricingOptions: [
			{
				interval: "month",
				price: 20000,
				currency: "inr",
				stripePriceId: "price_1TiN8TEk8mXXs8wbzECIZPLP",
			},
			{
				interval: "year",
				price: 2000000,
				currency: "inr",
				stripePriceId: "price_1TiN8nEk8mXXs8wbcXnX1dLt",
			},
		],
	},
];
