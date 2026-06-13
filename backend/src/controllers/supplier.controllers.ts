import { Request, Response } from "express";
import { getActivesSuppliersOfRestaurant } from "../services/supplier.services";
import { Prisma } from "../generated/prisma/client";
import z from "zod";


export async function getActivesSuppliers(_req: Request, res: Response) {

    try {
        const suppliers = await getActivesSuppliersOfRestaurant()
        res.status(200).json(suppliers);
    } catch (error) {
        if (error instanceof Prisma.PrismaClientValidationError) {
            res.status(404).json({ msg: "err_prisma_validation" })
        }
        if (error instanceof z.ZodError) {
            return res.status(500).json({ msg: "err_Zod_validation" });
        }
        return res.status(500).json({ msg: "err_getActivesSuppliers" })
    }


}