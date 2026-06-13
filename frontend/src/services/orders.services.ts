import { CreateOrderType } from "../../../shared/order.schemas";
import { apiUrl } from "./api";

export async function createOrder(order: CreateOrderType) {
    const response = await fetch(apiUrl("/api/orders"), {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(order),
    });

    if (!response.ok) {
        throw new Error("err_create_order");
    }

    return response.json();
}
