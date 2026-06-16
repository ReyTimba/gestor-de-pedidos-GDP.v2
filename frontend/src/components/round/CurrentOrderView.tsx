import { useMemo, useState } from "react";
import { CreateOrderLineType } from "../../../../shared/order.schemas";
import { RequiredProductType } from "../../../../shared/product.schemas";

type OrderProduct = {
    line: CreateOrderLineType;
    product: RequiredProductType;
};

type CurrentOrderViewProps = {
    orderProducts: OrderProduct[];
    skippedProducts: RequiredProductType[];
    saving: boolean;
    saveError: string | null;
    onArchiveOrder: () => void;
    onQuantityChange: (requiredProductId: string, quantityOrdered: number) => void;
    onRemoveLine: (requiredProductId: string) => void;
    onAddSkippedToOrder: (product: RequiredProductType, quantityOrdered: number) => void;
};

type OrderReviewTab = "ordered" | "skipped";

export function CurrentOrderView({
    orderProducts,
    skippedProducts,
    saving,
    saveError,
    onArchiveOrder,
    onQuantityChange,
    onRemoveLine,
    onAddSkippedToOrder,
}: CurrentOrderViewProps) {
    const [activeTab, setActiveTab] = useState<OrderReviewTab>("ordered");
    const [orderedSupplierFilter, setOrderedSupplierFilter] = useState("all");
    const [skippedSupplierFilter, setSkippedSupplierFilter] = useState("all");
    const [skippedQuantities, setSkippedQuantities] = useState<Record<string, string>>({});

    const orderedSuppliers = useMemo(
        () => getUniqueSuppliers(orderProducts.map(({ product }) => product)),
        [orderProducts]
    );

    const skippedSuppliers = useMemo(
        () => getUniqueSuppliers(skippedProducts),
        [skippedProducts]
    );

    const filteredOrderProducts = useMemo(
        () => orderProducts.filter(({ product }) => (
            orderedSupplierFilter === "all" || product.supplier.id === orderedSupplierFilter
        )),
        [orderProducts, orderedSupplierFilter]
    );

    const filteredSkippedProducts = useMemo(
        () => skippedProducts.filter((product) => (
            skippedSupplierFilter === "all" || product.supplier.id === skippedSupplierFilter
        )),
        [skippedProducts, skippedSupplierFilter]
    );

    function getSkippedQuantity(product: RequiredProductType) {
        return skippedQuantities[product.id] ?? String(product.defaultQuantity);
    }

    function handleSkippedQuantityChange(productId: string, quantity: string) {
        setSkippedQuantities((currentQuantities) => ({
            ...currentQuantities,
            [productId]: quantity,
        }));
    }

    function updateSkippedQuantity(product: RequiredProductType, delta: number) {
        const nextQuantity = Math.max((Number(getSkippedQuantity(product)) || 0) + delta, 0);
        handleSkippedQuantityChange(product.id, String(nextQuantity));
    }

    function handleAddSkippedProduct(product: RequiredProductType) {
        const quantityOrdered = Number(getSkippedQuantity(product));
        if (!Number.isFinite(quantityOrdered) || quantityOrdered <= 0) return;

        onAddSkippedToOrder(product, quantityOrdered);
        setSkippedQuantities((currentQuantities) => {
            const { [product.id]: _removedQuantity, ...remainingQuantities } = currentQuantities;
            return remainingQuantities;
        });
    }

    return (
        <div className="current-order-view">
            <div className="order-review-tabs" role="tablist" aria-label="Pedido actual">
                <button
                    type="button"
                    className={activeTab === "ordered" ? "is-active" : ""}
                    onClick={() => setActiveTab("ordered")}
                >
                    Revisar pedido
                </button>
                <button
                    type="button"
                    className={activeTab === "skipped" ? "is-active" : ""}
                    onClick={() => setActiveTab("skipped")}
                >
                    No pedidos
                </button>
            </div>

            {activeTab === "ordered" && (
            <section className="order-review-section">
                <div className="order-review-title">
                    <h2>Productos pedidos</h2>
                    <span>{orderProducts.length} lineas</span>
                </div>

                    <SupplierFilter
                        value={orderedSupplierFilter}
                        suppliers={orderedSuppliers}
                        onChange={setOrderedSupplierFilter}
                    />

                {orderProducts.length === 0 ? (
                    <p className="order-review-empty">Todavia no has agregado productos.</p>
                ) : (
                    <ul className="order-review-list">
                        {filteredOrderProducts.map(({ line, product }) => (
                            <li key={line.requiredProductId}>
                                <div>
                                    <strong>{product.name}</strong>
                                    <span>{product.supplier.name}</span>
                                </div>
                                    <QuantityStepper
                                        quantity={line.quantityOrdered}
                                        unit={product.defaultUnit}
                                        onDecrease={() => onQuantityChange(
                                            line.requiredProductId,
                                            Math.max(line.quantityOrdered - 1, 1)
                                        )}
                                        onIncrease={() => onQuantityChange(
                                            line.requiredProductId,
                                            line.quantityOrdered + 1
                                        )}
                                    />
                                <details className="order-line-menu">
                                    <summary aria-label="Opciones del producto">...</summary>
                                    <button type="button" onClick={() => onRemoveLine(line.requiredProductId)}>Quitar</button>
                                </details>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
            )}

            {activeTab === "skipped" && (
            <section className="order-review-section">
                <div className="order-review-title">
                    <h2>No pedidos</h2>
                    <span>{skippedProducts.length} productos</span>
                </div>

                    <SupplierFilter
                        value={skippedSupplierFilter}
                        suppliers={skippedSuppliers}
                        onChange={setSkippedSupplierFilter}
                    />

                {skippedProducts.length === 0 ? (
                    <p className="order-review-empty">No hay productos marcados como no pedir.</p>
                ) : (
                    <ul className="order-review-list skipped-list">
                        {filteredSkippedProducts.map((product) => (
                            <li key={product.id}>
                                <div>
                                    <strong>{product.name}</strong>
                                    <span>{product.supplier.name}</span>
                                </div>
                                <QuantityStepper
                                    quantity={Number(getSkippedQuantity(product)) || 0}
                                    unit={product.defaultUnit}
                                    onDecrease={() => updateSkippedQuantity(product, -1)}
                                    onIncrease={() => updateSkippedQuantity(product, 1)}
                                />
                                <button type="button" onClick={() => handleAddSkippedProduct(product)}>Agregar</button>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
            )}

            {saveError && <p className="order-save-error">{saveError}</p>}

            <button
                className="archive-order-button"
                type="button"
                disabled={saving || orderProducts.length === 0}
                onClick={onArchiveOrder}
            >
                {saving ? "Archivando..." : "Archivar pedido"}
            </button>
        </div>
    );
}

type SupplierOption = {
    id: string;
    name: string;
};

type SupplierFilterProps = {
    value: string;
    suppliers: SupplierOption[];
    onChange: (value: string) => void;
};

function SupplierFilter({ value, suppliers, onChange }: SupplierFilterProps) {
    return (
        <label className="supplier-filter">
            <span>Proveedor</span>
            <select value={value} onChange={(event) => onChange(event.target.value)}>
                <option value="all">Todos</option>
                {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                ))}
            </select>
        </label>
    );
}

type QuantityStepperProps = {
    quantity: number;
    unit: string;
    onDecrease: () => void;
    onIncrease: () => void;
};

function QuantityStepper({ quantity, unit, onDecrease, onIncrease }: QuantityStepperProps) {
    return (
        <div className="order-quantity-stepper">
            <button type="button" aria-label="Restar cantidad" onClick={onDecrease}>-</button>
            <div>
                <strong>{quantity}</strong>
                <span>{unit}</span>
            </div>
            <button type="button" aria-label="Sumar cantidad" onClick={onIncrease}>+</button>
        </div>
    );
}

function getUniqueSuppliers(products: RequiredProductType[]) {
    return Array.from(
        new Map(products.map((product) => [
            product.supplier.id,
            {
                id: product.supplier.id,
                name: product.supplier.name,
            },
        ])).values()
    );
}
