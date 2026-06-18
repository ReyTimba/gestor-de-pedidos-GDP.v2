import { FormEvent, useEffect, useState } from "react";
import { CreateOrderLineType } from "../../../shared/order.schemas";
import { RequiredProductType } from "../../../shared/product.schemas"
import { updateRequiredProductDefaults } from "../services/product.services";

type OrderProduct = {
    line: CreateOrderLineType;
    product: RequiredProductType;
};

export type RequiredProductsListProps = {
    requiredProducts: RequiredProductType[];
    orderProducts: OrderProduct[];
    onAddOrderLine: (product: RequiredProductType, quantityOrdered: number) => void;
    onUpdateOrderLineQuantity: (requiredProductId: string, quantityOrdered: number) => void;
    onRemoveOrderLine: (requiredProductId: string) => void;
}


export default function RequiredProductsList(props: RequiredProductsListProps) {

    const [requiredProducts, setRequiredProducts] = useState<RequiredProductType[]>(props.requiredProducts);
    const [selectedSupplier, setSelectedSupplier] = useState<string>("all");
    const [editingProductId, setEditingProductId] = useState<string | null>(null);
    const [editingQuantity, setEditingQuantity] = useState<string>("");
    const [editingUnit, setEditingUnit] = useState<string>("");
    const [savingProductId, setSavingProductId] = useState<string | null>(null);
    const orderedQuantityByProductId = new Map(props.orderProducts.map(({ line }) => [
        line.requiredProductId,
        line.quantityOrdered,
    ]));

    useEffect(() => {
        setRequiredProducts(props.requiredProducts);
    }, [props.requiredProducts]);

    const productsList = selectedSupplier === "all"
        ? requiredProducts
        : requiredProducts.filter(product => product.supplier.name === selectedSupplier);


    const suppliers = Array.from(new Set(requiredProducts.map(product => {
        return product.supplier.name
    })));

    function startEditing(product: RequiredProductType) {
        setEditingProductId(product.id);
        setEditingQuantity(String(product.defaultQuantity));
        setEditingUnit(product.defaultUnit);
    }

    async function saveDefaultSettings(product: RequiredProductType, event?: FormEvent<HTMLFormElement>) {
        event?.preventDefault();

        const defaultQuantity = Number(editingQuantity);
        const defaultUnit = editingUnit.trim();

        if (!Number.isFinite(defaultQuantity) || defaultQuantity < 0 || defaultUnit.length === 0) {
            setEditingQuantity(String(product.defaultQuantity));
            setEditingUnit(product.defaultUnit);
            setEditingProductId(null);
            return;
        }

        setSavingProductId(product.id);

        try {
            const updatedProduct = await updateRequiredProductDefaults(product.id, defaultQuantity, defaultUnit);
            setRequiredProducts((currentProducts) => currentProducts.map((currentProduct) => (
                currentProduct.id === updatedProduct.id ? updatedProduct : currentProduct
            )));
            setEditingProductId(null);
        } finally {
            setSavingProductId(null);
        }
    }

    function updateOrderQuantity(product: RequiredProductType, quantityOrdered: number) {
        if (quantityOrdered <= 0) {
            props.onRemoveOrderLine(product.id);
            return;
        }

        if (orderedQuantityByProductId.has(product.id)) {
            props.onUpdateOrderLineQuantity(product.id, quantityOrdered);
            return;
        }

        props.onAddOrderLine(product, quantityOrdered);
    }

    return (
        <section className="products-panel">
            <div className="products-header">
                <h2>Productos requeridos</h2>
                <select
                    value={selectedSupplier}
                    onChange={(e) => {
                        setSelectedSupplier(e.target.value)
                    }}>
                    <option value="all">Todos</option>
                    {
                        suppliers.map(item => {
                            return <option key={item} value={item}>{item}</option>
                        })
                    }
                </select>
                <span>{productsList.length} productos</span>
            </div>
            <div className="products-list-wrapper">
                <ul className="products-card-list">
                    {
                        productsList.map(product => {
                            return (
                                <li key={product.id} className="product-card-item">
                                    <div>
                                        <strong>{product.name}</strong>
                                        <span>{product.supplier.name}</span>
                                    </div>
                                    <div className="product-card-actions">
                                        <ProductOrderQuantity
                                            quantity={orderedQuantityByProductId.get(product.id) ?? 0}
                                            defaultQuantity={product.defaultQuantity}
                                            unit={product.defaultUnit}
                                            onDecrease={() => updateOrderQuantity(
                                                product,
                                                (orderedQuantityByProductId.get(product.id) ?? 0) - 1
                                            )}
                                            onIncrease={() => updateOrderQuantity(
                                                product,
                                                (orderedQuantityByProductId.get(product.id) ?? 0) + 1
                                            )}
                                        />
                                        <details
                                            className="product-card-menu"
                                            open={editingProductId === product.id}
                                            onToggle={(event) => {
                                                if (event.currentTarget.open) {
                                                    startEditing(product);
                                                } else if (editingProductId === product.id) {
                                                    setEditingProductId(null);
                                                    setEditingQuantity("");
                                                    setEditingUnit("");
                                                }
                                            }}
                                        >
                                            <summary aria-label="Opciones del producto">...</summary>
                                            <form onSubmit={(event) => saveDefaultSettings(product, event)}>
                                                <label>
                                                    <span>Cantidad habitual</span>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={editingQuantity}
                                                        disabled={savingProductId === product.id}
                                                        onChange={(event) => setEditingQuantity(event.target.value)}
                                                    />
                                                </label>
                                                <label>
                                                    <span>Unidad habitual</span>
                                                    <input
                                                        type="text"
                                                        value={editingUnit}
                                                        disabled={savingProductId === product.id}
                                                        onChange={(event) => setEditingUnit(event.target.value)}
                                                    />
                                                </label>
                                                <button type="submit" disabled={savingProductId === product.id}>
                                                    {savingProductId === product.id ? "Guardando..." : "Guardar"}
                                                </button>
                                            </form>
                                        </details>
                                    </div>
                                </li>
                            )
                        })
                    }
                </ul>
            </div>
        </section>

    )
}

type ProductOrderQuantityProps = {
    quantity: number;
    defaultQuantity: number;
    unit: string;
    onDecrease: () => void;
    onIncrease: () => void;
};

function ProductOrderQuantity({
    quantity,
    defaultQuantity,
    unit,
    onDecrease,
    onIncrease,
}: ProductOrderQuantityProps) {
    return (
        <div className={quantity > 0 ? "product-order-stepper has-order" : "product-order-stepper"}>
            <button type="button" aria-label="Restar cantidad del pedido" onClick={onDecrease}>-</button>
            <div>
                <strong>{quantity} / {defaultQuantity}</strong>
                <span>{unit}</span>
            </div>
            <button type="button" aria-label="Sumar cantidad al pedido" onClick={onIncrease}>+</button>
        </div>
    );
}
