/* eslint-disable react-hooks/immutability */
"use client";
import { fetchProducts } from "@/service/stripeService";
import { message } from "antd";
import React, { useCallback, useEffect, useState } from "react";

const Ecommerce = () => {
	const [info, setInfo] = useState({
		products: [],
	});
	useEffect(() => {
		getAllProducts();
	}, []);

	const getAllProducts = useCallback(async () => {
		try {
			const { products } = await fetchProducts();
			setInfo((prev) => ({ ...prev, products }));
		} catch (error) {
			console.log("Something went wrong,==>getAllProducts", error);
			message.error(error?.message || "Error fetch products");
		}
	}, []);
	return <div></div>;
};

export default Ecommerce;
