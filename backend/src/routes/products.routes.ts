import { Router } from "express";
import { getActiveProducts, updateProductDefaultQuantity } from "../controllers/product.controllers";

export const productRouter = Router();

productRouter.get("/", getActiveProducts);
productRouter.patch("/:id/default-quantity", updateProductDefaultQuantity);
