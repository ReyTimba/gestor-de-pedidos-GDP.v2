import z from "zod";

export const CreateOrderLineSchema = z.object({
    quantityOrdered: z.number(),
    requiredProductId: z.string(),
})
export const CreateOrderLinesSchema = z.array(CreateOrderLineSchema);
export type CreateOrderLineType = z.infer<typeof CreateOrderLineSchema>



export const CreateOrderSchema = z.object({
    orderLines: CreateOrderLinesSchema
})
export type CreateOrderType = z.infer<typeof CreateOrderSchema>