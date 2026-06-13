import { useEffect, useMemo, useRef, useState } from "react";
import { CurrentOrderSummary } from "../components/round/CurrentOrderSummary";
import { CurrentOrderView } from "../components/round/CurrentOrderView";
import { RoundProductCard } from "../components/round/RoundProductCard";
import { useOrderDraft } from "../hooks/useOrderDraft";
import { useProducts } from "../hooks/products.hooks";
import { createOrder } from "../services/orders.services";

type RoundView = "round" | "order";

type RoundPageProps = {
    view?: RoundView;
    onViewChange?: (view: RoundView) => void;
};

export default function RoundPage({ view: controlledView, onViewChange }: RoundPageProps) {
    const { requiredProducts, loading, error } = useProducts();
    const [localView, setLocalView] = useState<RoundView>("round");
    const view = controlledView ?? localView;
    const [inputQty, setInputQty] = useState<string>("0");
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [selectedSupplierId, setSelectedSupplierId] = useState<string>("");
    const [focusedSupplierId, setFocusedSupplierId] = useState<string | null>(null);
    const supplierButtonRefs = useRef(new Map<string, HTMLButtonElement>());
    const selectedSupplierProducts = useMemo(
        () => selectedSupplierId
            ? requiredProducts.filter((product) => product.supplier.id === selectedSupplierId)
            : requiredProducts,
        [requiredProducts, selectedSupplierId]
    );
    const {
        orderLines,
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
        clearDraft,
    } = useOrderDraft(selectedSupplierProducts, requiredProducts);
    const orderedProductIds = useMemo(
        () => new Set(orderLines.map((line) => line.requiredProductId)),
        [orderLines]
    );
    const skippedProductIds = useMemo(
        () => new Set(skippedProducts.map((product) => product.id)),
        [skippedProducts]
    );
    const suppliers = useMemo(
        () => Array.from(
            new Map(requiredProducts.map((product) => [
                product.supplier.id,
                {
                    id: product.supplier.id,
                    name: product.supplier.name,
                    totalProducts: requiredProducts.filter((item) => item.supplier.id === product.supplier.id).length,
                    orderedProducts: requiredProducts.filter((item) => (
                        item.supplier.id === product.supplier.id && orderedProductIds.has(item.id)
                    )).length,
                },
            ])).values()
        ),
        [orderedProductIds, requiredProducts]
    );
    const nextSupplier = useMemo(() => {
        if (!selectedSupplierId || suppliers.length === 0) return null;

        const currentSupplierIndex = suppliers.findIndex((supplier) => supplier.id === selectedSupplierId);
        const orderedSuppliers = [
            ...suppliers.slice(currentSupplierIndex + 1),
            ...suppliers.slice(0, currentSupplierIndex + 1),
        ];

        return orderedSuppliers.find((supplier) => (
            supplier.id !== selectedSupplierId
            && requiredProducts.some((product) => (
                product.supplier.id === supplier.id
                && !orderedProductIds.has(product.id)
                && !skippedProductIds.has(product.id)
            ))
        )) ?? null;
    }, [orderedProductIds, requiredProducts, selectedSupplierId, skippedProductIds, suppliers]);

    function setView(nextView: RoundView) {
        setLocalView(nextView);
        onViewChange?.(nextView);
    }

    function focusSupplierInRail(supplierId: string) {
        const supplierButton = supplierButtonRefs.current.get(supplierId);
        supplierButton?.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "center",
        });
        setFocusedSupplierId(supplierId);
        window.setTimeout(() => {
            setFocusedSupplierId((currentSupplierId) => (
                currentSupplierId === supplierId ? null : currentSupplierId
            ));
        }, 900);
    }

    useEffect(() => {
        if (selectedSupplierId || suppliers.length === 0) return;

        setSelectedSupplierId(suppliers[0].id);
    }, [selectedSupplierId, suppliers]);

    useEffect(() => {
        if (!currentProduct) {
            setInputQty("0");
            return;
        }

        setInputQty(String(currentProduct.defaultQuantity));
    }, [currentProduct]);

    function handleAddOrderLine() {
        if (!currentProduct) return;

        const quantityOrdered = Number(inputQty);
        if (!Number.isFinite(quantityOrdered) || quantityOrdered <= 0) return;

        addOrderLine(currentProduct, quantityOrdered);
        setSaveError(null);
    }

    function handleSkipProduct() {
        if (!currentProduct) return;

        skipProduct(currentProduct);
        setSaveError(null);
    }

    function handlePostponeProduct() {
        if (!currentProduct) return;

        postponeProduct(currentProduct);
        setSaveError(null);
    }

    async function handleArchiveOrder() {
        setSaving(true);
        setSaveError(null);

        try {
            await createOrder({ orderLines });
            clearDraft();
            setView("round");
        } catch {
            setSaveError("No se pudo archivar. El pedido sigue guardado en este movil.");
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return <div className="round-page"><p className="round-status">Cargando ronda...</p></div>
    }

    if (error) {
        return <div className="round-page"><p className="round-status">No se pudo cargar la ronda.</p></div>
    }

    if (view === "order") {
        return (
            <CurrentOrderView
                orderProducts={orderProducts}
                skippedProducts={skippedProducts}
                saving={saving}
                saveError={saveError}
                onBackToRound={() => setView("round")}
                onArchiveOrder={handleArchiveOrder}
                onQuantityChange={updateOrderLineQuantity}
                onRemoveLine={removeOrderLine}
                onAddSkippedToOrder={addOrderLine}
            />
        );
    }

    return (
        <div className="round-page">
            <div className="round-topbar">
                <span>RONDA_T</span>
            </div>

            <h1>Siguiente producto</h1>

            <label className="round-supplier-selector">
                <span>Proveedor</span>
                <select value={selectedSupplierId} onChange={(event) => setSelectedSupplierId(event.target.value)}>
                    {suppliers.map((supplier) => (
                        <option key={supplier.id} value={supplier.id}>
                            {supplier.name} - {supplier.orderedProducts}/{supplier.totalProducts}
                        </option>
                    ))}
                </select>
            </label>

            <div className="round-supplier-progress-list">
                {suppliers.map((supplier) => (
                    <button
                        key={supplier.id}
                        ref={(element) => {
                            if (element) {
                                supplierButtonRefs.current.set(supplier.id, element);
                                return;
                            }

                            supplierButtonRefs.current.delete(supplier.id);
                        }}
                        type="button"
                        className={[
                            supplier.id === selectedSupplierId ? "is-active" : "",
                            supplier.orderedProducts > 0 ? "has-lines" : "",
                            supplier.orderedProducts === supplier.totalProducts ? "is-complete" : "",
                            supplier.id === focusedSupplierId ? "is-focused" : "",
                        ].filter(Boolean).join(" ")}
                        onClick={() => setSelectedSupplierId(supplier.id)}
                    >
                        <span>{supplier.name}</span>
                        <strong>{supplier.orderedProducts}/{supplier.totalProducts}</strong>
                    </button>
                ))}
            </div>

            <div className="round-main-area">
                {currentProduct ? (
                    <>
                    <RoundProductCard
                        product={currentProduct}
                        quantity={inputQty}
                        onQuantityChange={setInputQty}
                        onSupplierClick={() => focusSupplierInRail(currentProduct.supplier.id)}
                    />

                    <div className="round-actions">
                        <button type="button" onClick={handleSkipProduct}>No pedir</button>
                        <button type="button" onClick={handlePostponeProduct}>Despues</button>
                        <button type="button" onClick={handleAddOrderLine}>Pedir</button>
                    </div>
                    </>
                ) : (
                    <section className="round-product-card round-provider-finished-card">
                    {nextSupplier ? (
                        <>
                            <span className="round-supplier-name">Proveedor completado</span>
                            <h2>{suppliers.find((supplier) => supplier.id === selectedSupplierId)?.name}</h2>
                            <p>Ya decidiste todos los productos pendientes de este proveedor.</p>
                            <button type="button" onClick={() => setSelectedSupplierId(nextSupplier.id)}>
                                Siguiente proveedor
                            </button>
                        </>
                    ) : (
                        <>
                            <span className="round-supplier-name">Ronda terminada</span>
                            <h2>Pedido listo</h2>
                            <p>Ya decidiste todos los productos activos.</p>
                            <button type="button" onClick={() => setView("order")}>Revisar pedido</button>
                        </>
                    )}
                    </section>
                )}
            </div>

            <div className="round-bottom-area">
                <CurrentOrderSummary
                    providersCount={providersCount}
                    linesCount={orderLines.length}
                    onOpenOrder={() => setView("order")}
                />

                <p className="round-progress">
                    {pendingProducts.length} productos pendientes
                </p>
            </div>
        </div>
    )
}
