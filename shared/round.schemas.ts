import z from "zod";

export const RoundDecisionActionSchema = z.enum(["ORDERED", "SKIPPED", "POSTPONED", "PENDING"]);
export type RoundDecisionActionType = z.infer<typeof RoundDecisionActionSchema>;

export const UpsertRoundDecisionSchema = z.object({
    requiredProductId: z.string(),
    action: RoundDecisionActionSchema,
    quantityOrdered: z.number().positive().optional(),
}).superRefine((decision, ctx) => {
    if (decision.action === "ORDERED" && decision.quantityOrdered === undefined) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["quantityOrdered"],
            message: "quantityOrdered is required for ORDERED decisions",
        });
    }
});
export type UpsertRoundDecisionType = z.infer<typeof UpsertRoundDecisionSchema>;

export const RoundDecisionSchema = z.object({
    id: z.string(),
    requiredProductId: z.string(),
    action: z.enum(["ORDERED", "SKIPPED", "POSTPONED"]),
    quantityOrdered: z.number().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
});
export type RoundDecisionType = z.infer<typeof RoundDecisionSchema>;

export const RoundOrderLineSchema = z.object({
    id: z.string(),
    requiredProductId: z.string(),
    nameSnapshot: z.string(),
    quantityOrdered: z.number(),
    unitSnapshot: z.string(),
    supplierSnapshot: z.string(),
    isDelivered: z.boolean(),
});
export type RoundOrderLineType = z.infer<typeof RoundOrderLineSchema>;

export const CurrentRoundSchema = z.object({
    id: z.string(),
    status: z.enum(["OPEN", "CLOSED"]),
    startedAt: z.string(),
    closedAt: z.string().nullable(),
    decisions: z.array(RoundDecisionSchema),
    orderLines: z.array(RoundOrderLineSchema),
});
export type CurrentRoundType = z.infer<typeof CurrentRoundSchema>;

export const RoundHistorySchema = z.array(CurrentRoundSchema);
export type RoundHistoryType = z.infer<typeof RoundHistorySchema>;
