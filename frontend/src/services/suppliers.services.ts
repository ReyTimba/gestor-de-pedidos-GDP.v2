import { SuppliersSchema } from "../../../shared/supplier.schemas";

export async function getActiveSupplier() {
    const response = await fetch("/api/suppliers");
    if(!response.ok) {
        throw new Error("bad_response_suppliers")
    }
    const data = await response.json();
    const suppliers = SuppliersSchema.parse(data)
    return suppliers;
}