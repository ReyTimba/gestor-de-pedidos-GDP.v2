import { Router } from "express";
import { healthRouter } from "./health.routes";
import { orderRouter } from "./orders.routes";
import { productRouter } from "./products.routes";
import { supplierRouter } from "./suppliers.routes";

export const router = Router();

router.use("/health", healthRouter);
router.use("/orders", orderRouter)
router.use("/products", productRouter)
router.use("/suppliers", supplierRouter)
