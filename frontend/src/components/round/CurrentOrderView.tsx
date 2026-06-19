import { useMemo, useState } from "react";
import { CreateOrderLineType } from "../../../../shared/order.schemas";
import { RequiredProductType } from "../../../../shared/product.schemas";

type OrderProduct = {
    line: CreateOrderLineType;
    product: RequiredProductType;
};

type SupplierMessageGroup = {
    supplierId: string;
    supplierName: string;
    phone: string | null;
    orderProducts: OrderProduct[];
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

type OrderReviewTab = "ordered" | "skipped" | "messages";

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
    const [copiedSupplierId, setCopiedSupplierId] = useState<string | null>(null);

    const orderedSuppliers = useMemo(
        () => getUniqueSuppliers(orderProducts.map(({ product }) => product)),
        [orderProducts]
    );

    const skippedSuppliers = useMemo(
        () => getUniqueSuppliers(skippedProducts),
        [skippedProducts]
    );

    const supplierMessageGroups = useMemo(
        () => groupOrderProductsBySupplier(orderProducts),
        [orderProducts]
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

    async function handleCopySupplierMessage(group: SupplierMessageGroup) {
        await navigator.clipboard.writeText(buildSupplierMessage(group));
        setCopiedSupplierId(group.supplierId);
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
                    <button
                        className="order-messages-open-button"
                        type="button"
                        disabled={orderProducts.length === 0}
                        onClick={() => setActiveTab("messages")}
                    >
                        Mensajes
                    </button>
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
                                        defaultQuantity={product.defaultQuantity}
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

            {activeTab === "messages" && (
            <section className="order-review-section">
                <div className="order-review-title">
                    <h2>Mensajes</h2>
                    <button type="button" onClick={() => setActiveTab("ordered")}>Revisar</button>
                </div>

                {supplierMessageGroups.length === 0 ? (
                    <p className="order-review-empty">Todavia no hay proveedores con productos pedidos.</p>
                ) : (
                    <ul className="supplier-message-list">
                        {supplierMessageGroups.map((group) => (
                            <li key={group.supplierId}>
                                <div>
                                    <strong>{group.supplierName}</strong>
                                    <span>{group.phone ?? "Sin telefono"}</span>
                                    <small>{group.orderProducts.length} productos</small>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleCopySupplierMessage(group)}
                                >
                                    {copiedSupplierId === group.supplierId ? "Copiado" : "Copiar mensaje"}
                                </button>
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
                                    defaultQuantity={product.defaultQuantity}
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
    defaultQuantity: number;
    unit: string;
    onDecrease: () => void;
    onIncrease: () => void;
};

function QuantityStepper({ quantity, defaultQuantity, unit, onDecrease, onIncrease }: QuantityStepperProps) {
    return (
        <div className="order-quantity-stepper">
            <button type="button" aria-label="Restar cantidad" onClick={onDecrease}>-</button>
            <div>
                <strong>{quantity} / {defaultQuantity}</strong>
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

function groupOrderProductsBySupplier(orderProducts: OrderProduct[]) {
    const groups = new Map<string, SupplierMessageGroup>();

    for (const orderProduct of orderProducts) {
        const supplier = orderProduct.product.supplier;
        const group = groups.get(supplier.id) ?? {
            supplierId: supplier.id,
            supplierName: supplier.name,
            phone: supplier.phone,
            orderProducts: [],
        };

        group.orderProducts.push(orderProduct);
        groups.set(supplier.id, group);
    }

    return Array.from(groups.values())
        .map((group) => ({
            ...group,
            orderProducts: group.orderProducts.sort((a, b) => (
                a.product.name.localeCompare(b.product.name)
            )),
        }))
        .sort((a, b) => a.supplierName.localeCompare(b.supplierName));
}

function buildSupplierMessage(group: SupplierMessageGroup) {
    const lines = group.orderProducts.map(({ line, product }) => (
        `- ${product.name}: ${line.quantityOrdered} ${product.defaultUnit}`
    ));

    return [`Pedido ${group.supplierName}`, ...lines].join("\n");
}
