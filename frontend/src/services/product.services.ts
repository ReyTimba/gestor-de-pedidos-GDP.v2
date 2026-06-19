import { RequiredProductSchema, RequiredProductsSchema } from "../../../shared/product.schemas";
import { apiUrl } from "./api";

export async function getActiveRequiredProduct(includeInactive = false) {
    const response = await fetch(apiUrl(`/api/products${includeInactive ? "?includeInactive=true" : ""}`));
    if (!response.ok) {
        throw new Error("err_invalid_response");
    }
    const data = await response.json();
    const validatedData = RequiredProductsSchema.parse(data);
    return validatedData;
}

export async function updateRequiredProductDefaults(
    requiredProductId: string,
    defaultQuantity: number,
    defaultUnit: string
) {
    const response = await fetch(apiUrl(`/api/products/${requiredProductId}/default-quantity`), {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ defaultQuantity, defaultUnit }),
    });

    if (!response.ok) {
        throw new Error("err_update_required_product_default_quantity");
    }

    const data = await response.json();
    return RequiredProductSchema.parse(data);
}

export async function updateRequiredProductStatus(requiredProductId: string, isActive: boolean) {
    const response = await fetch(apiUrl(`/api/products/${requiredProductId}/status`), {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive }),
    });

    if (!response.ok) {
        throw new Error("err_update_required_product_status");
    }

    const data = await response.json();
    return RequiredProductSchema.parse(data);
}
