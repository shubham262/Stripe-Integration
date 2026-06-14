import api from ".";

export const fetchProducts = async () => {
	try {
		const { data } = await api.get(`/api/ecommerce/products`);
		return data;
	} catch (error) {
		throw error;
	}
};
export const createCheckout = async (payload) => {
	try {
		const { data } = await api.post(`/api/ecommerce/checkout`, payload);
		return data;
	} catch (error) {
		throw error;
	}
};

export const fetchAllPlans = async () => {
	try {
		const { data } = await api.get(`/api/ecommerce/plans`);
		return data;
	} catch (error) {
		throw error;
	}
};

export const createSubscription = async (payload) => {
	try {
		const { data } = await api.post(
			`/api/ecommerce/create-subscription`,
			payload
		);
		return data;
	} catch (error) {
		throw error;
	}
};
