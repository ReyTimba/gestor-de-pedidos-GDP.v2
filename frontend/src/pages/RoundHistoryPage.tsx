import { useEffect, useMemo, useState } from "react";
import { CurrentRoundType, RoundOrderLineType } from "../../../shared/round.schemas";
import { getRoundHistory } from "../services/rounds.services";

type SupplierLineGroup = {
    supplierName: string;
    lines: RoundOrderLineType[];
};

function formatRoundDate(date: string) {
    return new Intl.DateTimeFormat("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(date));
}

function groupLinesBySupplier(lines: RoundOrderLineType[]) {
    const groups = new Map<string, SupplierLineGroup>();

    for (const line of lines) {
        const group = groups.get(line.supplierSnapshot) ?? {
            supplierName: line.supplierSnapshot,
            lines: [],
        };

        group.lines.push(line);
        groups.set(line.supplierSnapshot, group);
    }

    return Array.from(groups.values())
        .map((group) => ({
            ...group,
            lines: group.lines.sort((a, b) => a.nameSnapshot.localeCompare(b.nameSnapshot)),
        }))
        .sort((a, b) => a.supplierName.localeCompare(b.supplierName));
}

function getRoundSummary(round: CurrentRoundType) {
    const supplierNames = new Set(round.orderLines.map((line) => line.supplierSnapshot));
    const skippedCount = round.decisions.filter((decision) => decision.action === "SKIPPED").length;
    const postponedCount = round.decisions.filter((decision) => decision.action === "POSTPONED").length;

    return {
        suppliersCount: supplierNames.size,
        skippedCount,
        postponedCount,
    };
}

function RoundHistoryListItem({
    round,
    isSelected,
    onSelect,
}: {
    round: CurrentRoundType;
    isSelected: boolean;
    onSelect: () => void;
}) {
    const summary = getRoundSummary(round);

    return (
        <li>
            <button
                type="button"
                className={isSelected ? "is-selected" : ""}
                onClick={onSelect}
            >
                <span>{formatRoundDate(round.closedAt ?? round.startedAt)}</span>
                <strong>{summary.suppliersCount} proveedores - {round.orderLines.length} productos</strong>
            </button>
            {isSelected ? <RoundHistoryDetail round={round} /> : null}
        </li>
    );
}

function RoundHistoryDetail({ round }: { round: CurrentRoundType }) {
    const supplierGroups = useMemo(
        () => groupLinesBySupplier(round.orderLines),
        [round.orderLines]
    );
    const summary = getRoundSummary(round);

    return (
        <article className="history-round-detail">
            <div className="history-round-metrics">
                <strong>{round.decisions.length} revisados</strong>
                <strong>{summary.skippedCount} no pedidos</strong>
                <strong>{summary.postponedCount} pospuestos</strong>
            </div>

            <div className="history-supplier-groups">
                {supplierGroups.map((group) => (
                    <section key={group.supplierName} className="history-supplier-group">
                        <h3>{group.supplierName}</h3>
                        <ul>
                            {group.lines.map((line) => (
                                <li key={line.id}>
                                    <span>{line.nameSnapshot}</span>
                                    <strong>{line.quantityOrdered} {line.unitSnapshot}</strong>
                                </li>
                            ))}
                        </ul>
                    </section>
                ))}
            </div>
        </article>
    );
}

export default function RoundHistoryPage() {
    const [history, setHistory] = useState<CurrentRoundType[]>([]);
    const [selectedRoundId, setSelectedRoundId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function loadHistory() {
            try {
                const rounds = await getRoundHistory();
                if (cancelled) return;
                setHistory(rounds);
                setError(null);
            } catch {
                if (cancelled) return;
                setError("No se pudo cargar el historial.");
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadHistory();

        return () => {
            cancelled = true;
        };
    }, []);

    if (loading) {
        return <p className="history-status">Cargando historial...</p>;
    }

    if (error) {
        return <p className="history-status">{error}</p>;
    }

    return (
        <section className="history-page">
            <header className="history-page-header">
                <h1>Historial</h1>
                <span>{history.length} rondas cerradas</span>
            </header>

            {history.length === 0 ? (
                <p className="history-empty">Todavia no hay rondas cerradas.</p>
            ) : (
                <div className="history-layout">
                    <ul className="history-round-list" aria-label="Rondas cerradas">
                        {history.map((round) => (
                            <RoundHistoryListItem
                                key={round.id}
                                round={round}
                                isSelected={round.id === selectedRoundId}
                                onSelect={() => setSelectedRoundId((currentRoundId) => (
                                    currentRoundId === round.id ? null : round.id
                                ))}
                            />
                        ))}
                    </ul>
                </div>
            )}
        </section>
    );
}
