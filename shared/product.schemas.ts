import z from "zod";
import { SupplierSchema } from "./supplier.schemas";

export const RequiredProductSchema = z.object({
    id: z.string(),
    name: z.string(),
    defaultQuantity: z.number(),
    defaultUnit: z.string(),
    isActive: z.boolean(),
    supplier: SupplierSchema
});

export const RequiredProductsSchema = z.array(RequiredProductSchema);
export type RequiredProductType = z.infer<typeof RequiredProductSchema>;

export const UpdateRequiredProductDefaultQuantitySchema = z.object({
    defaultQuantity: z.number().min(0),
});
export type UpdateRequiredProductDefaultQuantityType = z.infer<typeof UpdateRequiredProductDefaultQuantitySchema>;
