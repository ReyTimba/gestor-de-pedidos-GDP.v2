-- CreateEnum
CREATE TYPE "OrderRoundStatus" AS ENUM ('OPEN', 'CLOSED');

-- CreateEnum
CREATE TYPE "RoundDecisionAction" AS ENUM ('ORDERED', 'SKIPPED', 'POSTPONED');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN "orderRoundId" TEXT;

-- CreateTable
CREATE TABLE "OrderRound" (
    "id" TEXT NOT NULL,
    "status" "OrderRoundStatus" NOT NULL DEFAULT 'OPEN',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),
    "restaurantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "OrderRound_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoundDecision" (
    "id" TEXT NOT NULL,
    "action" "RoundDecisionAction" NOT NULL,
    "quantityOrdered" DECIMAL(65,30),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "orderRoundId" TEXT NOT NULL,
    "requiredProductId" TEXT NOT NULL,

    CONSTRAINT "RoundDecision_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OrderRound_restaurantId_status_idx" ON "OrderRound"("restaurantId", "status");

-- CreateIndex
CREATE INDEX "OrderRound_startedAt_idx" ON "OrderRound"("startedAt");

-- CreateIndex
CREATE INDEX "RoundDecision_requiredProductId_idx" ON "RoundDecision"("requiredProductId");

-- CreateIndex
CREATE UNIQUE INDEX "RoundDecision_orderRoundId_requiredProductId_key" ON "RoundDecision"("orderRoundId", "requiredProductId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderRoundId_key" ON "Order"("orderRoundId");

-- CreateIndex
CREATE UNIQUE INDEX "OrderLine_orderId_requiredProductId_key" ON "OrderLine"("orderId", "requiredProductId");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_orderRoundId_fkey" FOREIGN KEY ("orderRoundId") REFERENCES "OrderRound"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderRound" ADD CONSTRAINT "OrderRound_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderRound" ADD CONSTRAINT "OrderRound_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoundDecision" ADD CONSTRAINT "RoundDecision_orderRoundId_fkey" FOREIGN KEY ("orderRoundId") REFERENCES "OrderRound"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoundDecision" ADD CONSTRAINT "RoundDecision_requiredProductId_fkey" FOREIGN KEY ("requiredProductId") REFERENCES "RequiredProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
