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
