import type { Request, Response } from "express";
import { checkDatabase } from "../services/health.service";

export async function getHealth(_request: Request, response: Response) {
  try {
    await checkDatabase();
    response.json({ ok: true, database: "connected" });
  } catch {
    response.status(500).json({ ok: false, database: "error" });
  }
}
