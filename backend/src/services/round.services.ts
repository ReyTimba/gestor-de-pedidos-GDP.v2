import { UpsertRoundDecisionType } from "../../../shared/round.schemas";
import { TEMP_RESTAURANT_ID } from "../app";
import { prisma } from "../db/prisma";

const currentRoundInclude = {
    decisions: {
        orderBy: {
            updatedAt: "asc" as const,
        },
    },
    order: {
        include: {
            orderLines: {
                orderBy: {
                    nameSnapshot: "asc" as const,
                },
            },
        },
    },
};

type CurrentRoundWithRelations = Awaited<ReturnType<typeof findCurrentRound>>;

async function getRestaurantUser() {
    const user = await prisma.user.findFirst({
        where: {
            restaurantId: TEMP_RESTAURANT_ID,
        },
    });

    if (!user) {
        throw new Error("err_user_not_found");
    }

    return user;
}

function serializeCurrentRound(round: NonNullable<CurrentRoundWithRelations>) {
    return {
        id: round.id,
        status: round.status,
        startedAt: round.startedAt.toISOString(),
        closedAt: round.closedAt?.toISOString() ?? null,
        decisions: round.decisions.map((decision) => ({
            id: decision.id,
            requiredProductId: decision.requiredProductId,
            action: decision.action,
            quantityOrdered: decision.quantityOrdered?.toNumber() ?? null,
            createdAt: decision.createdAt.toISOString(),
            updatedAt: decision.updatedAt.toISOString(),
        })),
        orderLines: round.order?.orderLines.map((line) => ({
            id: line.id,
            requiredProductId: line.requiredProductId,
            nameSnapshot: line.nameSnapshot,
            quantityOrdered: line.quantityOrdered.toNumber(),
            unitSnapshot: line.unitSnapshot,
            supplierSnapshot: line.supplierSnapshot,
            isDelivered: line.isDelivered,
        })) ?? [],
    };
}

async function findCurrentRound() {
    return prisma.orderRound.findFirst({
        where: {
            restaurantId: TEMP_RESTAURANT_ID,
            status: "OPEN",
        },
        orderBy: {
            startedAt: "desc",
        },
        include: currentRoundInclude,
    });
}

async function getOrCreateCurrentRound() {
    const currentRound = await findCurrentRound();

    if (currentRound) {
        return currentRound;
    }

    const user = await getRestaurantUser();

    return prisma.orderRound.create({
        data: {
            restaurantId: TEMP_RESTAURANT_ID,
            userId: user.id,
        },
        include: currentRoundInclude,
    });
}

async function getOrCreateRoundOrder(roundId: string) {
    const existingOrder = await prisma.order.findUnique({
        where: {
            orderRoundId: roundId,
        },
    });

    if (existingOrder) {
        return existingOrder;
    }

    const user = await getRestaurantUser();

    return prisma.order.create({
        data: {
            restaurantId: TEMP_RESTAURANT_ID,
            userId: user.id,
            orderStatus: "UNDER_REVIEW",
            orderRoundId: roundId,
        },
    });
}

export async function getCurrentRoundOfRestaurant() {
    const round = await getOrCreateCurrentRound();
    return serializeCurrentRound(round);
}

export async function getRoundHistoryOfRestaurant() {
    const rounds = await prisma.orderRound.findMany({
        where: {
            restaurantId: TEMP_RESTAURANT_ID,
            status: "CLOSED",
        },
        orderBy: {
            closedAt: "desc",
        },
        include: currentRoundInclude,
    });

    return rounds.map(serializeCurrentRound);
}

export async function upsertCurrentRoundDecision(decision: UpsertRoundDecisionType) {
    const round = await getOrCreateCurrentRound();
    const requiredProduct = await prisma.requiredProduct.findFirst({
        where: {
            id: decision.requiredProductId,
            restaurantId: TEMP_RESTAURANT_ID,
            isActive: true,
        },
        include: {
            supplier: true,
        },
    });

    if (!requiredProduct) {
        throw new Error("err_required_product_not_found");
    }

    if (decision.action === "PENDING") {
        await prisma.roundDecision.deleteMany({
            where: {
                orderRoundId: round.id,
                requiredProductId: requiredProduct.id,
            },
        });

        if (round.order) {
            await prisma.orderLine.deleteMany({
                where: {
                    orderId: round.order.id,
                    requiredProductId: requiredProduct.id,
                },
            });
        }

        const updatedRound = await prisma.orderRound.findUniqueOrThrow({
            where: {
                id: round.id,
            },
            include: currentRoundInclude,
        });

        return serializeCurrentRound(updatedRound);
    }

    await prisma.roundDecision.upsert({
        where: {
            orderRoundId_requiredProductId: {
                orderRoundId: round.id,
                requiredProductId: requiredProduct.id,
            },
        },
        update: {
            action: decision.action,
            quantityOrdered: decision.action === "ORDERED" ? decision.quantityOrdered : null,
        },
        create: {
            orderRoundId: round.id,
            requiredProductId: requiredProduct.id,
            action: decision.action,
            quantityOrdered: decision.action === "ORDERED" ? decision.quantityOrdered : null,
        },
    });

    if (decision.action === "ORDERED") {
        if (decision.quantityOrdered === undefined) {
            throw new Error("err_quantity_required");
        }

        const quantityOrdered = decision.quantityOrdered;
        const order = await getOrCreateRoundOrder(round.id);

        await prisma.orderLine.upsert({
            where: {
                orderId_requiredProductId: {
                    orderId: order.id,
                    requiredProductId: requiredProduct.id,
                },
            },
            update: {
                quantityOrdered,
                unitSnapshot: requiredProduct.defaultUnit,
                supplierSnapshot: requiredProduct.supplier.name,
                nameSnapshot: requiredProduct.name,
            },
            create: {
                orderId: order.id,
                requiredProductId: requiredProduct.id,
                quantityOrdered,
                unitSnapshot: requiredProduct.defaultUnit,
                supplierSnapshot: requiredProduct.supplier.name,
                nameSnapshot: requiredProduct.name,
            },
        });
    } else if (round.order) {
        await prisma.orderLine.deleteMany({
            where: {
                orderId: round.order.id,
                requiredProductId: requiredProduct.id,
            },
        });
    }

    const updatedRound = await prisma.orderRound.findUniqueOrThrow({
        where: {
            id: round.id,
        },
        include: currentRoundInclude,
    });

    return serializeCurrentRound(updatedRound);
}

export async function closeCurrentRoundOfRestaurant() {
    const round = await getOrCreateCurrentRound();

    if (!round.order || round.order.orderLines.length === 0) {
        throw new Error("err_empty_order_round");
    }

    const closedRound = await prisma.orderRound.update({
        where: {
            id: round.id,
        },
        data: {
            status: "CLOSED",
            closedAt: new Date(),
            order: {
                update: {
                    orderStatus: "UNDER_REVIEW",
                },
            },
        },
        include: currentRoundInclude,
    });

    return serializeCurrentRound(closedRound);
}
