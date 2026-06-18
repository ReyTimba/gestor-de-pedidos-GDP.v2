import { useEffect, useMemo, useState } from "react";
import { CreateOrderLineType } from "../../../shared/order.schemas";
import { RoundDecisionActionType, UpsertRoundDecisionType } from "../../../shared/round.schemas";
import { RequiredProductType } from "../../../shared/product.schemas";
import { getCurrentRound, saveCurrentRoundDecision } from "../services/rounds.services";

const STORAGE_KEY = "gdp.currentOrderDraft.v1";

type SyncStatus = "synced" | "pending" | "failed";

type DecisionSyncState = {
    status: SyncStatus;
    action: RoundDecisionActionType;
    quantityOrdered?: number;
};

type OrderDraft = {
    orderLines: CreateOrderLineType[];
    skippedProductIds: string[];
    postponedProductIds: string[];
    decisionSync: Record<string, DecisionSyncState>;
};

const emptyDraft: OrderDraft = {
    orderLines: [],
    skippedProductIds: [],
    postponedProductIds: [],
    decisionSync: {},
};

function hasLocalRoundWork(draft: OrderDraft) {
    return (
        draft.orderLines.length > 0
        || draft.skippedProductIds.length > 0
        || draft.postponedProductIds.length > 0
    );
}

function decisionMatches(
    currentDecision: DecisionSyncState | undefined,
    decision: UpsertRoundDecisionType
) {
    return (
        currentDecision?.action === decision.action
        && currentDecision.quantityOrdered === decision.quantityOrdered
    );
}

function readDraft(): OrderDraft {
    try {
        const savedDraft = window.localStorage.getItem(STORAGE_KEY);
        if (!savedDraft) return emptyDraft;

        const parsedDraft = JSON.parse(savedDraft) as Partial<OrderDraft>;
        return {
            orderLines: Array.isArray(parsedDraft.orderLines) ? parsedDraft.orderLines : [],
            skippedProductIds: Array.isArray(parsedDraft.skippedProductIds) ? parsedDraft.skippedProductIds : [],
            postponedProductIds: Array.isArray(parsedDraft.postponedProductIds) ? parsedDraft.postponedProductIds : [],
            decisionSync: parsedDraft.decisionSync && typeof parsedDraft.decisionSync === "object"
                ? parsedDraft.decisionSync as Record<string, DecisionSyncState>
                : {},
        };
    } catch {
        return emptyDraft;
    }
}

export function useOrderDraft(requiredProducts: RequiredProductType[], allRequiredProducts = requiredProducts) {
    const [draft, setDraft] = useState<OrderDraft>(readDraft);

    useEffect(() => {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    }, [draft]);

    useEffect(() => {
        let cancelled = false;

        async function hydrateCurrentRound() {
            try {
                const round = await getCurrentRound();
                if (cancelled) return;

                setDraft((currentDraft) => {
                    if (hasLocalRoundWork(currentDraft)) return currentDraft;

                    const skippedProductIds = round.decisions
                        .filter((decision) => decision.action === "SKIPPED")
                        .map((decision) => decision.requiredProductId);
                    const postponedProductIds = round.decisions
                        .filter((decision) => decision.action === "POSTPONED")
                        .map((decision) => decision.requiredProductId);
                    const decisionSync = Object.fromEntries(
                        round.decisions.map((decision) => [
                            decision.requiredProductId,
                            {
                                status: "synced" as const,
                                action: decision.action,
                                quantityOrdered: decision.quantityOrdered ?? undefined,
                            },
                        ])
                    );

                    return {
                        orderLines: round.orderLines.map((line) => ({
                            requiredProductId: line.requiredProductId,
                            quantityOrdered: line.quantityOrdered,
                        })),
                        skippedProductIds,
                        postponedProductIds,
                        decisionSync,
                    };
                });
            } catch {
                // The local draft remains usable when the server cannot hydrate the round.
            }
        }

        hydrateCurrentRound();

        return () => {
            cancelled = true;
        };
    }, []);

    const productById = useMemo(
        () => new Map(allRequiredProducts.map((product) => [product.id, product])),
        [allRequiredProducts]
    );

    const orderedProductIds = useMemo(
        () => new Set(draft.orderLines.map((line) => line.requiredProductId)),
        [draft.orderLines]
    );

    const skippedProductIds = useMemo(
        () => new Set(draft.skippedProductIds),
        [draft.skippedProductIds]
    );

    const postponedProductIds = useMemo(
        () => new Set(draft.postponedProductIds),
        [draft.postponedProductIds]
    );

    const pendingProducts = useMemo(
        () => requiredProducts.filter((product) => !orderedProductIds.has(product.id) && !skippedProductIds.has(product.id)),
        [orderedProductIds, requiredProducts, skippedProductIds]
    );

    const currentProduct = useMemo(() => {
        const nextProduct = pendingProducts.find((product) => !postponedProductIds.has(product.id));
        return nextProduct ?? pendingProducts[0] ?? null;
    }, [pendingProducts, postponedProductIds]);

    const skippedProducts = useMemo(
        () => draft.skippedProductIds
            .map((productId) => productById.get(productId))
            .filter((product): product is RequiredProductType => Boolean(product)),
        [draft.skippedProductIds, productById]
    );

    const orderProducts = useMemo(
        () => draft.orderLines
            .map((line) => ({
                line,
                product: productById.get(line.requiredProductId),
            }))
            .filter((item): item is { line: CreateOrderLineType; product: RequiredProductType } => Boolean(item.product)),
        [draft.orderLines, productById]
    );

    const providersCount = useMemo(
        () => new Set(orderProducts.map((item) => item.product.supplier.id)).size,
        [orderProducts]
    );

    const syncSummary = useMemo(() => {
        const states = Object.values(draft.decisionSync);
        return {
            pendingCount: states.filter((state) => state.status === "pending").length,
            failedCount: states.filter((state) => state.status === "failed").length,
        };
    }, [draft.decisionSync]);

    function markDecisionSyncStatus(
        requiredProductId: string,
        decision: UpsertRoundDecisionType,
        status: SyncStatus
    ) {
        setDraft((currentDraft) => {
            const currentDecision = currentDraft.decisionSync[requiredProductId];
            if (!decisionMatches(currentDecision, decision)) return currentDraft;

            if (status === "synced" && decision.action === "PENDING") {
                const { [requiredProductId]: _removedDecision, ...remainingDecisions } = currentDraft.decisionSync;

                return {
                    ...currentDraft,
                    decisionSync: remainingDecisions,
                };
            }

            return {
                ...currentDraft,
                decisionSync: {
                    ...currentDraft.decisionSync,
                    [requiredProductId]: {
                        ...currentDecision,
                        status,
                    },
                },
            };
        });
    }

    function syncDecision(decision: UpsertRoundDecisionType) {
        void saveCurrentRoundDecision(decision)
            .then(() => markDecisionSyncStatus(decision.requiredProductId, decision, "synced"))
            .catch(() => markDecisionSyncStatus(decision.requiredProductId, decision, "failed"));
    }

    function setPendingDecision(decision: UpsertRoundDecisionType) {
        setDraft((currentDraft) => ({
            ...currentDraft,
            decisionSync: {
                ...currentDraft.decisionSync,
                [decision.requiredProductId]: {
                    status: "pending",
                    action: decision.action,
                    quantityOrdered: decision.quantityOrdered,
                },
            },
        }));
        syncDecision(decision);
    }

    function addOrderLine(product: RequiredProductType, quantityOrdered: number) {
        setDraft((currentDraft) => ({
            ...currentDraft,
            orderLines: [
                ...currentDraft.orderLines.filter((line) => line.requiredProductId !== product.id),
                {
                    requiredProductId: product.id,
                    quantityOrdered,
                },
            ],
            skippedProductIds: currentDraft.skippedProductIds.filter((productId) => productId !== product.id),
            postponedProductIds: currentDraft.postponedProductIds.filter((productId) => productId !== product.id),
        }));
        setPendingDecision({
            requiredProductId: product.id,
            action: "ORDERED",
            quantityOrdered,
        });
    }

    function skipProduct(product: RequiredProductType) {
        setDraft((currentDraft) => ({
            ...currentDraft,
            skippedProductIds: currentDraft.skippedProductIds.includes(product.id)
                ? currentDraft.skippedProductIds
                : [...currentDraft.skippedProductIds, product.id],
            postponedProductIds: currentDraft.postponedProductIds.filter((productId) => productId !== product.id),
            orderLines: currentDraft.orderLines.filter((line) => line.requiredProductId !== product.id),
        }));
        setPendingDecision({
            requiredProductId: product.id,
            action: "SKIPPED",
        });
    }

    function postponeProduct(product: RequiredProductType) {
        setDraft((currentDraft) => ({
            ...currentDraft,
            postponedProductIds: currentDraft.postponedProductIds.includes(product.id)
                ? currentDraft.postponedProductIds
                : [...currentDraft.postponedProductIds, product.id],
        }));
        setPendingDecision({
            requiredProductId: product.id,
            action: "POSTPONED",
        });
    }

    function updateOrderLineQuantity(requiredProductId: string, quantityOrdered: number) {
        if (!Number.isFinite(quantityOrdered) || quantityOrdered <= 0) return;

        setDraft((currentDraft) => ({
            ...currentDraft,
            orderLines: currentDraft.orderLines.map((line) => (
                line.requiredProductId === requiredProductId
                    ? { ...line, quantityOrdered }
                    : line
            )),
        }));
        setPendingDecision({
            requiredProductId,
            action: "ORDERED",
            quantityOrdered,
        });
    }

    function removeOrderLine(requiredProductId: string) {
        setDraft((currentDraft) => ({
            ...currentDraft,
            orderLines: currentDraft.orderLines.filter((line) => line.requiredProductId !== requiredProductId),
        }));
        setPendingDecision({
            requiredProductId,
            action: "PENDING",
        });
    }

    function restoreSkippedProduct(requiredProductId: string) {
        setDraft((currentDraft) => ({
            ...currentDraft,
            skippedProductIds: currentDraft.skippedProductIds.filter((productId) => productId !== requiredProductId),
        }));
    }

    function clearDraft() {
        setDraft(emptyDraft);
    }

    return {
        orderLines: draft.orderLines,
        currentProduct,
        pendingProducts,
        skippedProducts,
        orderProducts,
        providersCount,
        syncSummary,
        addOrderLine,
        skipProduct,
        postponeProduct,
        updateOrderLineQuantity,
        removeOrderLine,
        restoreSkippedProduct,
        clearDraft,
    };
}
