import { useProducts } from "../hooks/products.hooks"
import RequiredProductsList from "../components/RequiredProductsList"
import { useOrderDraft } from "../hooks/useOrderDraft"


export default function RequiredProductsPage() {

    const { requiredProducts, loading, error } = useProducts()
    const { orderProducts, addOrderLine, updateOrderLineQuantity, removeOrderLine } = useOrderDraft(requiredProducts)

    if (loading) return <p>cargando productos...</p>
    if (error) return <p>Error al cargar...</p>
    if (requiredProducts.length < 1) {
        return (
            <section className="products-panel products-empty">
                <h2>Productos requeridos</h2>
                <p>No hay productos disponibles.</p>
            </section>
        )
    }

    return (
        <RequiredProductsList
            requiredProducts={requiredProducts}
            orderProducts={orderProducts}
            onAddOrderLine={addOrderLine}
            onUpdateOrderLineQuantity={updateOrderLineQuantity}
            onRemoveOrderLine={removeOrderLine}
        />
    )

}
