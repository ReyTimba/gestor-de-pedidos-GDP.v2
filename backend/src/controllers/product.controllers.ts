import { Request, Response } from "express";
import { getActiveProductsOfRestaurant, updateRequiredProductDefaultQuantity } from "../services/product.services";
import { RequiredProductSchema, RequiredProductsSchema, UpdateRequiredProductDefaultQuantitySchema } from "../../../shared/product.schemas";
import z from "zod";
import { Prisma } from "../generated/prisma/client";

export async function getActiveProducts(_req: Request, res: Response) {
    try {
        const products = await getActiveProductsOfRestaurant();
        const validateProducts = RequiredProductsSchema.parse(products)
        return res.status(200).json(validateProducts);
    } catch (error) {
        if (error instanceof Prisma.PrismaClientValidationError ) {
           return res.status(500).json({ msg: "err_Prisma_validation" });
        }
        if (error instanceof z.ZodError) {
           return res.status(500).json({ msg: "err_Zod_validation" });
        }
        return res.status(500).json({msg: "err_getActiveProducts"})
    }
}

export async function updateProductDefaultQuantity(req: Request, res: Response) {
    try {
        const { defaultQuantity } = UpdateRequiredProductDefaultQuantitySchema.parse(req.body);
        const requiredProductId = z.string().parse(req.params.id);
        const product = await updateRequiredProductDefaultQuantity(requiredProductId, defaultQuantity);
        const validatedProduct = RequiredProductSchema.parse(product);
        return res.status(200).json(validatedProduct);
    } catch (error) {
        if (error instanceof Prisma.PrismaClientValidationError ) {
           return res.status(500).json({ msg: "err_Prisma_validation" });
        }
        if (error instanceof z.ZodError) {
           return res.status(400).json({ msg: "err_Zod_validation" });
        }
        return res.status(500).json({msg: "err_updateProductDefaultQuantity"})
    }
}
