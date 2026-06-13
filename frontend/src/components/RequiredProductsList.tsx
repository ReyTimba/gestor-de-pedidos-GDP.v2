import { useEffect, useState } from "react";
import { RequiredProductType } from "../../../shared/product.schemas"
import { updateRequiredProductDefaultQuantity } from "../services/product.services";

export type RequiredProductsListProps = {
    requiredProducts: RequiredProductType[]
}


export default function RequiredProductsList(props: RequiredProductsListProps) {

    const [requiredProducts, setRequiredProducts] = useState<RequiredProductType[]>(props.requiredProducts);
    const [selectedSupplier, setSelectedSupplier] = useState<string>("all");
    const [editingProductId, setEditingProductId] = useState<string | null>(null);
    const [editingQuantity, setEditingQuantity] = useState<string>("");
    const [savingProductId, setSavingProductId] = useState<string | null>(null);

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
    }

    async function saveDefaultQuantity(product: RequiredProductType) {
        const defaultQuantity = Number(editingQuantity);
        if (!Number.isFinite(defaultQuantity) || defaultQuantity < 0) {
            setEditingQuantity(String(product.defaultQuantity));
            setEditingProductId(null);
            return;
        }

        setSavingProductId(product.id);

        try {
            const updatedProduct = await updateRequiredProductDefaultQuantity(product.id, defaultQuantity);
            setRequiredProducts((currentProducts) => currentProducts.map((currentProduct) => (
                currentProduct.id === updatedProduct.id ? updatedProduct : currentProduct
            )));
            setEditingProductId(null);
        } finally {
            setSavingProductId(null);
        }
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
                                    <p>
                                        {editingProductId === product.id ? (
                                            <input
                                                className="product-card-quantity-input"
                                                type="number"
                                                autoFocus
                                                min="0"
                                                value={editingQuantity}
                                                disabled={savingProductId === product.id}
                                                onChange={(event) => setEditingQuantity(event.target.value)}
                                                onBlur={() => saveDefaultQuantity(product)}
                                                onKeyDown={(event) => {
                                                    if (event.key === "Enter") {
                                                        event.currentTarget.blur();
                                                    }

                                                    if (event.key === "Escape") {
                                                        setEditingProductId(null);
                                                        setEditingQuantity("");
                                                    }
                                                }}
                                            />
                                        ) : (
                                            <button
                                                className="product-card-quantity-button"
                                                type="button"
                                                onClick={() => startEditing(product)}
                                            >
                                                {product.defaultQuantity}
                                            </button>
                                        )}
                                        <span>{product.defaultUnit}</span>
                                    </p>
                                </li>
                            )
                        })
                    }
                </ul>
            </div>
        </section>

    )
}
