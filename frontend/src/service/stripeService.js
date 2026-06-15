import api from ".";

export const fetchProducts = async () => {
	try {
		const { data } = await api.get(`/api/ecommerce/products`);
		return data;
	} catch (error) {
		throw error;
	}
};

export const fetchPlans = async () => {
	try {
		const { data } = await api.get(`/api/ecommerce/plans`);
		return data;
	} catch (error) {
		throw error;
	}
};

export const fetchStripePayementStatus = async (stripeId) => {
	try {
		const { data } = await api.get(
			`/api/ecommerce/stripe-payment-status/${stripeId}`
		);
		return data;
	} catch (error) {
		throw error;
	}
};

export const checkout = async (payload) => {
	try {
		const { data } = await api.post(`/api/ecommerce/create-checkout`, payload);
		return data;
	} catch (error) {
		throw error;
	}
};

export const subscribe = async (payload) => {
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
