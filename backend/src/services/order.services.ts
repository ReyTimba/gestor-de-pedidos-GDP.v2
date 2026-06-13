import { CreateOrderType } from "../../../shared/order.schemas";
import { TEMP_RESTAURANT_ID } from "../app";
import { prisma } from "../db/prisma";

export async function createOrderOfRestaurant(order: CreateOrderType) {
    const user = await prisma.user.findFirst({
        where: {
            restaurantId: TEMP_RESTAURANT_ID,
        },
    });

    if (!user) {
        throw new Error("err_user_not_found");
    }

    const requiredProductIds = order.orderLines.map((line) => line.requiredProductId);
    const requiredProducts = await prisma.requiredProduct.findMany({
        where: {
            id: {
                in: requiredProductIds,
            },
            restaurantId: TEMP_RESTAURANT_ID,
        },
        include: {
            supplier: true,
        },
    });

    const productById = new Map(requiredProducts.map((product) => [product.id, product]));

    if (productById.size !== requiredProductIds.length) {
        throw new Error("err_required_product_not_found");
    }

    return prisma.order.create({
        data: {
            restaurantId: TEMP_RESTAURANT_ID,
            userId: user.id,
            orderStatus: "UNDER_REVIEW",
            orderLines: {
                create: order.orderLines.map((line) => {
                    const product = productById.get(line.requiredProductId);
                    if (!product) {
                        throw new Error("err_required_product_not_found");
                    }

                    return {
                        requiredProductId: product.id,
                        nameSnapshot: product.name,
                        quantityOrdered: line.quantityOrdered,
                        unitSnapshot: product.defaultUnit,
                        supplierSnapshot: product.supplier.name,
                    };
                }),
            },
        },
        include: {
            orderLines: true,
        },
    });
}
