import SuppliersList from "../components/SuppliersList"
import { useSuppliers } from "../hooks/suppliers.hooks"


export default function SuppliersPage() {

    const { suppliers, loading, error } = useSuppliers();

    if (loading) return <p>Cargando proveedores...</p>
    if (error) return <p>Error al cargar</p>
    if (suppliers.length < 1) return (
        <section className="products-panel products-empty">
            <h2>Proveedores</h2>
            <p>No hay proveedores disponibles.</p>
        </section>
    )
    return (
        <div className="suppliers-panel">
            <SuppliersList suppliers={suppliers} />
        </div>
    )
}
