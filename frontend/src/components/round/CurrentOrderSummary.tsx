type CurrentOrderSummaryProps = {
    providersCount: number;
    linesCount: number;
    onOpenOrder: () => void;
};

export function CurrentOrderSummary({ providersCount, linesCount, onOpenOrder }: CurrentOrderSummaryProps) {
    return (
        <button className="round-current-order" type="button" onClick={onOpenOrder}>
            <span>PEDIDO ACTUAL</span>
            <strong>{providersCount} proveedores - {linesCount} lineas</strong>
        </button>
    );
}
