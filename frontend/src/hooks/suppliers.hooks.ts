import { useEffect, useState } from "react";
import { SupplierType } from "../../../shared/supplier.schemas";
import { getActiveSupplier } from "../services/suppliers.services";


export function useSuppliers() {

    const [suppliers, setSuppliers] = useState<SupplierType[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        getActiveSupplier()
            .then(setSuppliers)
            .catch((error) => { 
                console.error(error);
                setError("err_loading_suppliers");
            })
            .finally(() => setLoading(false))
    }, [])
    return { suppliers, loading, error }
}