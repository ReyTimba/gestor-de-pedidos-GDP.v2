import { TEMP_RESTAURANT_ID } from "../app";
import { prisma } from "../db/prisma";

export async function getActiveProductsOfRestaurant() {
    const products = await prisma.requiredProduct.findMany({
        where: {
            restaurantId: TEMP_RESTAURANT_ID
        },
        include: {
            supplier: true
        }
    })

    return products.map((product) => ({
        ...product,
        defaultQuantity: product.defaultQuantity.toNumber(),
    }));
}

export async function updateRequiredProductDefaultQuantity(requiredProductId: string, defaultQuantity: number) {
    await prisma.requiredProduct.updateMany({
        where: {
            id: requiredProductId,
            restaurantId: TEMP_RESTAURANT_ID,
        },
        data: {
            defaultQuantity,
        },
    });

    const product = await prisma.requiredProduct.findFirst({
        where: {
            id: requiredProductId,
            restaurantId: TEMP_RESTAURANT_ID,
        },
        include: {
            supplier: true,
        },
    });

    if (!product) {
        throw new Error("err_required_product_not_found");
    }

    return {
        ...product,
        defaultQuantity: product.defaultQuantity.toNumber(),
    };
}
