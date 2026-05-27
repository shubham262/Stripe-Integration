import express from "express";
import cors from "cors";
import { handleBetterAuth } from "./src/config/auth.js";
import { toNodeHandler } from "better-auth/node";
const app = express();
const PORT = process.env.PORT || 3001;
const auth = await handleBetterAuth();
app.use(
	cors({
		origin: ["http://localhost:3000"],
		credentials: true,
	})
);
app.use(express.json());
app.use("/api/auth", toNodeHandler(auth));
app.listen(PORT, () => {
	console.log(`Server started at port ${PORT}`);
});
