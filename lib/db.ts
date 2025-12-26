import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";

const adapterlibsql = new PrismaLibSql({
  url: process.env.DATABASE_URL || "file:./dev.db",
});

const prismaClientSingleton = () => {
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoAuthToken = process.env.TURSO_AUTH_TOKEN;

  // 1. กรณีขึ้น Cloud (Turso)
  if (tursoUrl && tursoAuthToken) {
    console.log("🔌 Connecting to Turso Cloud...");
    const libsql = createClient({
      url: tursoUrl,
      authToken: tursoAuthToken,
    });

    const adapter = new PrismaLibSql(libsql as any);

    return new PrismaClient({ adapter });
  }

  // 2. กรณี Local (SQLite)
  console.log("💻 Connecting to Local SQLite...");

  return new PrismaClient({ adapter: adapterlibsql });
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal || prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;
