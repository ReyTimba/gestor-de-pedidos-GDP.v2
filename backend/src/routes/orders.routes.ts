import { Router } from "express";
import { createOrder } from "../controllers/orders.controller";

export const orderRouter = Router();

orderRouter.post("/", createOrder);
