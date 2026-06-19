import { Request, Response } from "express";
import { getProductsOfRestaurant, updateRequiredProductDefaultQuantity, updateRequiredProductStatus } from "../services/product.services";
import { RequiredProductSchema, RequiredProductsSchema, UpdateRequiredProductDefaultsSchema, UpdateRequiredProductStatusSchema } from "../../../shared/product.schemas";
import z from "zod";
import { Prisma } from "../generated/prisma/client";

export async function getActiveProducts(req: Request, res: Response) {
    try {
        const includeInactive = req.query.includeInactive === "true";
        const products = await getProductsOfRestaurant(includeInactive);
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

export async function updateProductStatus(req: Request, res: Response) {
    try {
        const { isActive } = UpdateRequiredProductStatusSchema.parse(req.body);
        const requiredProductId = z.string().parse(req.params.id);
        const product = await updateRequiredProductStatus(requiredProductId, isActive);
        const validatedProduct = RequiredProductSchema.parse(product);
        return res.status(200).json(validatedProduct);
    } catch (error) {
        if (error instanceof Prisma.PrismaClientValidationError ) {
           return res.status(500).json({ msg: "err_Prisma_validation" });
        }
        if (error instanceof z.ZodError) {
           return res.status(400).json({ msg: "err_Zod_validation" });
        }
        return res.status(500).json({msg: "err_updateProductStatus"})
    }
}

export async function updateProductDefaultQuantity(req: Request, res: Response) {
    try {
        const { defaultQuantity, defaultUnit } = UpdateRequiredProductDefaultsSchema.parse(req.body);
        const requiredProductId = z.string().parse(req.params.id);
        const product = await updateRequiredProductDefaultQuantity(requiredProductId, defaultQuantity, defaultUnit);
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
