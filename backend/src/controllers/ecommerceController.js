export const seedProductsController = async (req, res) => {
	try {
	} catch (error) {
		console.error("Error seedProducts:", error);
		return res.status(500).json({
			success: false,
			error: "Failed to seed products",
		});
	}
};
