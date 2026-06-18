import { Router } from "express";
import { closeCurrentRound, getCurrentRound, getRoundHistory, saveCurrentRoundDecision } from "../controllers/round.controllers";

export const roundRouter = Router();

roundRouter.get("/current", getCurrentRound);
roundRouter.get("/history", getRoundHistory);
roundRouter.post("/current/decisions", saveCurrentRoundDecision);
roundRouter.post("/current/close", closeCurrentRound);
