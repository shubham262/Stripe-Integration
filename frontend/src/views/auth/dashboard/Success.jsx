"use client";
import React from "react";
import { Result, Button } from "antd";
import { useRouter } from "next/navigation";

const CheckoutSuccess = () => {
	const router = useRouter();

	return (
		<div className="min-h-[80vh] bg-gray-50 flex items-center justify-center p-6">
			<div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 max-w-lg w-full">
				<Result
					status="success"
					title="Payment Successful!"
					subTitle="Thank you for your purchase. We are processing your enrollment now."
					extra={[
						<Button
							type="primary"
							size="large"
							key="dashboard"
							onClick={() => router.push("/dashboard")}
						>
							Go to My Courses
						</Button>,
					]}
				/>
			</div>
		</div>
	);
};

export default CheckoutSuccess;
