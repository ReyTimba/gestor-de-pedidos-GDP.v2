import { TEMP_RESTAURANT_ID } from "../app";
import { prisma } from "../db/prisma";

export async function getActivesSuppliersOfRestaurant() {
    const data = await prisma.supplier.findMany({
        where: {
            restaurantId: TEMP_RESTAURANT_ID,
            isActive: true
        }
    })
    return data;
}