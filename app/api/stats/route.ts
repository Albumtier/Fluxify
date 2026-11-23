import { NextResponse } from "next/server";
import { hasGlobalStatsStore, readGlobalStats } from "../../lib/globalStats";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!hasGlobalStatsStore()) {
    return NextResponse.json(
      { error: "Upstash is not configured" },
      { status: 503 }
    );
  }

  const stats = await readGlobalStats();

  return NextResponse.json(stats, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}