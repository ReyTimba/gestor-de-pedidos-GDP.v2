import { prisma } from "../db/prisma";

export async function checkDatabase() {
  await prisma.$queryRaw`SELECT 1`;
}
