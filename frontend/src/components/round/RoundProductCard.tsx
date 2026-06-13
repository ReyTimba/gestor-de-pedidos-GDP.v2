import { RequiredProductType } from "../../../../shared/product.schemas";

type RoundProductCardProps = {
    product: RequiredProductType;
    quantity: string;
    onQuantityChange: (quantity: string) => void;
    onSupplierClick?: () => void;
};

export function RoundProductCard({ product, quantity, onQuantityChange, onSupplierClick }: RoundProductCardProps) {
    return (
        <section className="round-product-card">
            <button className="round-supplier-name" type="button" onClick={onSupplierClick}>
                {product.supplier.name}
            </button>
            <h2>{product.name}</h2>

            <div className="round-quantity-row">
                <button
                    className="round-quantity-button"
                    type="button"
                    aria-label="Restar cantidad"
                    onClick={() => onQuantityChange(String(Math.max((Number(quantity) || 0) - 1, 0)))}
                >
                    -
                </button>

                <label className="round-quantity-input">
                    <input
                        type="number"
                        value={quantity}
                        onChange={(event) => onQuantityChange(event.target.value)}
                    />
                    <span>{product.defaultUnit}</span>
                </label>

                <button
                    className="round-quantity-button"
                    type="button"
                    aria-label="Sumar cantidad"
                    onClick={() => onQuantityChange(String((Number(quantity) || 0) + 1))}
                >
                    +
                </button>
            </div>
        </section>
    );
}
