"use server";
import neo4j, { Driver } from "neo4j-driver";

let driver: Driver | null = null;

function getDriver() {
  if (driver) return driver;

  if (
    !process.env.DB_URI ||
    !process.env.DB_USER ||
    !process.env.NEO4J_PASSWORD
  ) {
    throw new Error("Database credentials not provided");
  }

  driver = neo4j.driver(
    process.env.DB_URI,
    neo4j.auth.basic(process.env.DB_USER, process.env.NEO4J_PASSWORD),
    {
      maxConnectionLifetime: 30000,
      maxConnectionPoolSize: 50,
      connectionTimeout: 30000,
    }
  );

  return driver;
}

export async function runQuery<T>(
  query: string,
  params: Record<string, unknown> = {}
): Promise<T[]> {
  const session = getDriver().session({ database: "neo4j" });
  try {
    const result = await session.run(query, params);
    return result.records.map((record) => resolveTypes<T>(record.toObject()));
  } finally {
    await session.close();
  }
}

function resolveTypes<T>(data: unknown): T {
  if (data === null || data === undefined) {
    return null as T;
  }

  if (neo4j.isInt(data)) {
    return data.toNumber() as T;
  }

  if (Array.isArray(data)) {
    return data.map(resolveTypes) as T;
  }

  if (data instanceof Date) {
    return data.toISOString() as T;
  }

  if (typeof data === "object") {
    return Object.fromEntries(
      Object.entries(data).map(([key, value]) => [key, resolveTypes(value)])
    ) as T;
  }

  return data as T;
}
