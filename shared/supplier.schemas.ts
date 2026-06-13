import z from "zod";

export const SupplierSchema = z.object({
    id: z.string(),
    name: z.string(),
    phone: z.string().nullable(),
    isActive: z.boolean(),
});
export const SuppliersSchema = z.array(SupplierSchema);
export type SupplierType = z.infer<typeof SupplierSchema>;
