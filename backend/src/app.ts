import cors from "cors";
import express from "express";
import { env } from "./config/env";
import { router } from "./routes";
export { TEMP_RESTAURANT_ID } from "./config/tempIds";

export const app = express();

app.use(cors({ origin: env.CLIENT_URL }));
app.use(express.json());
app.use("/api", router);
