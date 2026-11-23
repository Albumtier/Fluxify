import { NextResponse } from "next/server";
import { hasGlobalStatsStore, recordGlobalPlay } from "../../lib/globalStats";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!hasGlobalStatsStore()) {
    return NextResponse.json(
      { error: "Upstash is not configured" },
      { status: 503 }
    );
  }

  const body = await request.json().catch(() => null);
  const trackKey = typeof body?.trackKey === "string" ? body.trackKey.trim() : "";
  const listenerId = typeof body?.listenerId === "string" ? body.listenerId.trim() : "";

  if (!trackKey || !listenerId) {
    return NextResponse.json({ error: "Missing trackKey or listenerId" }, { status: 400 });
  }

  const stats = await recordGlobalPlay(trackKey, listenerId);

  return NextResponse.json(stats, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}