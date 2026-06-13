import { useEffect, useMemo, useState } from "react";
import { CreateOrderLineType } from "../../../shared/order.schemas";
import { RequiredProductType } from "../../../shared/product.schemas";

const STORAGE_KEY = "gdp.currentOrderDraft.v1";

type OrderDraft = {
    orderLines: CreateOrderLineType[];
    skippedProductIds: string[];
    postponedProductIds: string[];
};

const emptyDraft: OrderDraft = {
    orderLines: [],
    skippedProductIds: [],
    postponedProductIds: [],
};

function readDraft(): OrderDraft {
    try {
        const savedDraft = window.localStorage.getItem(STORAGE_KEY);
        if (!savedDraft) return emptyDraft;

        const parsedDraft = JSON.parse(savedDraft) as Partial<OrderDraft>;
        return {
            orderLines: Array.isArray(parsedDraft.orderLines) ? parsedDraft.orderLines : [],
            skippedProductIds: Array.isArray(parsedDraft.skippedProductIds) ? parsedDraft.skippedProductIds : [],
            postponedProductIds: Array.isArray(parsedDraft.postponedProductIds) ? parsedDraft.postponedProductIds : [],
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
    }

    function postponeProduct(product: RequiredProductType) {
        setDraft((currentDraft) => ({
            ...currentDraft,
            postponedProductIds: currentDraft.postponedProductIds.includes(product.id)
                ? currentDraft.postponedProductIds
                : [...currentDraft.postponedProductIds, product.id],
        }));
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
    }

    function removeOrderLine(requiredProductId: string) {
        setDraft((currentDraft) => ({
            ...currentDraft,
            orderLines: currentDraft.orderLines.filter((line) => line.requiredProductId !== requiredProductId),
        }));
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
        addOrderLine,
        skipProduct,
        postponeProduct,
        updateOrderLineQuantity,
        removeOrderLine,
        restoreSkippedProduct,
        clearDraft,
    };
}
