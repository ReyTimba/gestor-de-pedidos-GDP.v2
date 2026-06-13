import { Request, Response } from "express";
import z from "zod";
import { CreateOrderSchema } from "../../../shared/order.schemas";
import { Prisma } from "../generated/prisma/client";
import { createOrderOfRestaurant } from "../services/order.services";

export async function createOrder(req: Request, res: Response) {
    try {
        const order = CreateOrderSchema.parse(req.body);
        const createdOrder = await createOrderOfRestaurant(order);
        return res.status(201).json(createdOrder);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ msg: "err_Zod_validation" });
        }

        if (error instanceof Prisma.PrismaClientValidationError) {
            return res.status(500).json({ msg: "err_Prisma_validation" });
        }

        return res.status(500).json({ msg: "err_createOrder" });
    }
}
