import { Request, Response } from "express";
import z from "zod";
import { CurrentRoundSchema, RoundHistorySchema, UpsertRoundDecisionSchema } from "../../../shared/round.schemas";
import { Prisma } from "../generated/prisma/client";
import { closeCurrentRoundOfRestaurant, getCurrentRoundOfRestaurant, getRoundHistoryOfRestaurant, upsertCurrentRoundDecision } from "../services/round.services";

export async function getCurrentRound(_req: Request, res: Response) {
    try {
        const round = await getCurrentRoundOfRestaurant();
        const validatedRound = CurrentRoundSchema.parse(round);
        return res.status(200).json(validatedRound);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(500).json({ msg: "err_Zod_validation" });
        }

        return res.status(500).json({ msg: "err_getCurrentRound" });
    }
}

export async function getRoundHistory(_req: Request, res: Response) {
    try {
        const history = await getRoundHistoryOfRestaurant();
        const validatedHistory = RoundHistorySchema.parse(history);
        return res.status(200).json(validatedHistory);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(500).json({ msg: "err_Zod_validation" });
        }

        return res.status(500).json({ msg: "err_getRoundHistory" });
    }
}

export async function saveCurrentRoundDecision(req: Request, res: Response) {
    try {
        const decision = UpsertRoundDecisionSchema.parse(req.body);
        const round = await upsertCurrentRoundDecision(decision);
        const validatedRound = CurrentRoundSchema.parse(round);
        return res.status(200).json(validatedRound);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ msg: "err_Zod_validation" });
        }

        if (
            error instanceof Prisma.PrismaClientKnownRequestError
            && error.code === "P2025"
        ) {
            return res.status(404).json({ msg: "err_round_not_found" });
        }

        if (error instanceof Error && error.message === "err_required_product_not_found") {
            return res.status(404).json({ msg: error.message });
        }

        if (error instanceof Error && error.message === "err_user_not_found") {
            return res.status(409).json({ msg: error.message });
        }

        return res.status(500).json({ msg: "err_saveCurrentRoundDecision" });
    }
}

export async function closeCurrentRound(_req: Request, res: Response) {
    try {
        const round = await closeCurrentRoundOfRestaurant();
        const validatedRound = CurrentRoundSchema.parse(round);
        return res.status(200).json(validatedRound);
    } catch (error) {
        if (error instanceof Error && error.message === "err_empty_order_round") {
            return res.status(400).json({ msg: error.message });
        }

        if (error instanceof z.ZodError) {
            return res.status(500).json({ msg: "err_Zod_validation" });
        }

        return res.status(500).json({ msg: "err_closeCurrentRound" });
    }
}
