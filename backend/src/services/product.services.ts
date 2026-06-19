import { TEMP_RESTAURANT_ID } from "../app";
import { prisma } from "../db/prisma";
import { Prisma } from "../generated/prisma/client";

type RequiredProductWithSupplier = Prisma.RequiredProductGetPayload<{
    include: { supplier: true };
}>;

function serializeRequiredProduct(product: RequiredProductWithSupplier | null) {
    if (!product) {
        throw new Error("err_required_product_not_found");
    }

    return {
        ...product,
        defaultQuantity: product.defaultQuantity.toNumber(),
    };
}

export async function getProductsOfRestaurant(includeInactive = false) {
    const products = await prisma.requiredProduct.findMany({
        where: {
            restaurantId: TEMP_RESTAURANT_ID,
            ...(includeInactive ? {} : { isActive: true }),
        },
        include: {
            supplier: true
        },
        orderBy: [
            { isActive: "desc" },
            { name: "asc" },
        ],
    })

    return products.map(serializeRequiredProduct);
}

export async function updateRequiredProductDefaultQuantity(
    requiredProductId: string,
    defaultQuantity: number,
    defaultUnit: string
) {
    await prisma.requiredProduct.updateMany({
        where: {
            id: requiredProductId,
            restaurantId: TEMP_RESTAURANT_ID,
        },
        data: {
            defaultQuantity,
            defaultUnit,
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

    return serializeRequiredProduct(product);
}

export async function updateRequiredProductStatus(requiredProductId: string, isActive: boolean) {
    await prisma.requiredProduct.updateMany({
        where: {
            id: requiredProductId,
            restaurantId: TEMP_RESTAURANT_ID,
        },
        data: {
            isActive,
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

    return serializeRequiredProduct(product);
}
