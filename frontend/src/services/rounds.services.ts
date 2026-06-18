import { CurrentRoundSchema, RoundHistorySchema, UpsertRoundDecisionType } from "../../../shared/round.schemas";
import { apiUrl } from "./api";

export async function getCurrentRound() {
    const response = await fetch(apiUrl("/api/rounds/current"));

    if (!response.ok) {
        throw new Error("err_get_current_round");
    }

    const round = await response.json();
    return CurrentRoundSchema.parse(round);
}

export async function saveCurrentRoundDecision(decision: UpsertRoundDecisionType) {
    const response = await fetch(apiUrl("/api/rounds/current/decisions"), {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(decision),
    });

    if (!response.ok) {
        throw new Error("err_save_round_decision");
    }

    const round = await response.json();
    return CurrentRoundSchema.parse(round);
}

export async function closeCurrentRound() {
    const response = await fetch(apiUrl("/api/rounds/current/close"), {
        method: "POST",
    });

    if (!response.ok) {
        throw new Error("err_close_current_round");
    }

    const round = await response.json();
    return CurrentRoundSchema.parse(round);
}

export async function getRoundHistory() {
    const response = await fetch(apiUrl("/api/rounds/history"));

    if (!response.ok) {
        throw new Error("err_get_round_history");
    }

    const history = await response.json();
    return RoundHistorySchema.parse(history);
}
