import { SupplierType } from "../../../shared/supplier.schemas"

type SuppliersListProps ={
    suppliers: SupplierType[]
}
export default function SuppliersList(props: SuppliersListProps) {
    return(
        <ul className="suppliers-list">
            {
                props.suppliers.map(supplier => {
                    return <li key={supplier.id}>
                        <span>{supplier.name}</span>
                        <span>{supplier.phone}</span>
                    </li>
                })
            }
        </ul>
    )
}
