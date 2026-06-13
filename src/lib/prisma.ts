import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const DB_UNAVAILABLE_MSG =
  "Database not configured. Set DATABASE_URL in your Vercel environment variables.";

function createDummyClient(): PrismaClient {
  const rejector = () => Promise.reject(new Error(DB_UNAVAILABLE_MSG));

  return new Proxy({} as PrismaClient, {
    get(_target, prop: string | symbol) {
      if (prop === "$connect" || prop === "$disconnect" || prop === "$on") {
        return () => Promise.resolve();
      }
      // Nested access like prisma.user -> prisma.user.findMany()
      return new Proxy({} as never, {
        get() {
          return rejector;
        },
      });
    },
  });
}

function createPrisma(): PrismaClient {
  if (!process.env.DATABASE_URL) {
    return createDummyClient();
  }
  try {
    return new PrismaClient();
  } catch {
    return createDummyClient();
  }
}

export const prisma = globalForPrisma.prisma ?? createPrisma();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
