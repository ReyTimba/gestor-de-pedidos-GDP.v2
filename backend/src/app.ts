import cors from "cors";
import express from "express";
import { env } from "./config/env";
import { router } from "./routes";
export { TEMP_RESTAURANT_ID } from "./config/tempIds";

export const app = express();

const allowedOrigins = new Set(
  env.CLIENT_URL.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin) || origin.endsWith(".vercel.app")) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
  })
);
app.use(express.json());
app.use("/api", router);
