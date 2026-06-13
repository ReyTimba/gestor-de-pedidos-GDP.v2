import { RequiredProductSchema, RequiredProductsSchema } from "../../../shared/product.schemas";

export async function getActiveRequiredProduct() {
    const response = await fetch("/api/products");
    if (!response.ok) {
        throw new Error("err_invalid_response");
    }
    const data = await response.json();
    const validatedData = RequiredProductsSchema.parse(data);
    return validatedData;
}

export async function updateRequiredProductDefaultQuantity(requiredProductId: string, defaultQuantity: number) {
    const response = await fetch(`/api/products/${requiredProductId}/default-quantity`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ defaultQuantity }),
    });

    if (!response.ok) {
        throw new Error("err_update_required_product_default_quantity");
    }

    const data = await response.json();
    return RequiredProductSchema.parse(data);
}
