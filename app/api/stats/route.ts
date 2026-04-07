import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

type Stat = {
  label: string;
  value: string;
  icon: string;
};

const FALLBACK_STATS: Stat[] = [
  { label: "Customers Served", value: "5M+", icon: "customers" },
  { label: "ATMs & Branches", value: "4,800+", icon: "locations" },
  { label: "Monthly Fee", value: "$0", icon: "fee" },
  { label: "App Uptime", value: "99.9%", icon: "uptime" }
];

type CachedPayload = {
  stats: Stat[];
  source: "database" | "fallback";
  system: {
    status: "operational" | "maintenance";
    database: "connected" | "fallback";
  };
};

let cache: CachedPayload | null = null;
let cacheTime = 0;

const CACHE_TTL = 5 * 60 * 1000;

function buildSystemStatus(database: "connected" | "fallback") {
  return {
    status: process.env.MAINTENANCE_MODE === "true" ? "maintenance" : "operational",
    database
  } as const;
}

export async function GET() {
  if (cache && Date.now() - cacheTime < CACHE_TTL) {
    return NextResponse.json(cache, {
      headers: {
        "X-Cache": "HIT"
      }
    });
  }

  try {
    const connectionString =
      process.env.DATABASE_URL ||
      process.env.NEON_POSTGRES_PRISMA_URL ||
      process.env.NEON_POSTGRES_URL ||
      process.env.NEON_DATABASE_URL;

    if (!connectionString) {
      const payload: CachedPayload = {
        stats: FALLBACK_STATS,
        source: "fallback",
        system: buildSystemStatus("fallback")
      };
      cache = payload;
      cacheTime = Date.now();
      return NextResponse.json(payload);
    }

    const sql = neon(connectionString);
    const tableCheck = await sql`SELECT to_regclass('public.stats') AS table_name`;
    const hasStatsTable = Array.isArray(tableCheck) && Boolean(tableCheck[0]?.table_name);

    if (!hasStatsTable) {
      const payload: CachedPayload = {
        stats: FALLBACK_STATS,
        source: "fallback",
        system: buildSystemStatus("connected")
      };
      cache = payload;
      cacheTime = Date.now();
      return NextResponse.json(payload);
    }

    const rows = await sql`
      SELECT label, value, icon
      FROM stats
      WHERE active = true
      ORDER BY sort_order
      LIMIT 8
    `;

    const dbStats: Stat[] = rows.map((row) => ({
      label: String(row.label ?? ""),
      value: String(row.value ?? ""),
      icon: String(row.icon ?? "stats")
    }));
    const stats: Stat[] = dbStats.length > 0 ? dbStats : FALLBACK_STATS;
    const payload: CachedPayload = {
      stats,
      source: dbStats.length > 0 ? "database" : "fallback",
      system: buildSystemStatus("connected")
    };

    cache = payload;
    cacheTime = Date.now();

    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600"
      }
    });
  } catch (error) {
    console.error("[/api/stats] error:", error instanceof Error ? error.message : error);
    const payload: CachedPayload = {
      stats: FALLBACK_STATS,
      source: "fallback",
      system: buildSystemStatus("fallback")
    };
    return NextResponse.json(payload);
  }
}
