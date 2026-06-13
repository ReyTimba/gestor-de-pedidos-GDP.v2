import { useEffect, useState } from "react";
import { RequiredProductType } from "../../../shared/product.schemas";
import { getActiveRequiredProduct } from "../services/product.services";

export function useProducts() {
    
    const [requiredProducts, setRequiredProducts] = useState<RequiredProductType[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        getActiveRequiredProduct()
        .then(setRequiredProducts)
        .catch((error) => {
            console.error(error)
            setError("err_loading_products")
        })
        .finally(() => {
            setLoading(false)
        })
    }, [])
    return {requiredProducts, loading, error}
}