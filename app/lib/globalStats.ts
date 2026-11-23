import { createClient } from "@supabase/supabase-js";

type GlobalStats = {
  playCounts: Record<string, number>;
  monthlyListeners: number;
};

function createSupabase() {
  const url = process.env.SUPABASE_URL?.trim() || process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_ANON_KEY?.trim() || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !key) {
    return null;
  }

  return createClient(url, key);
}

export function hasGlobalStatsStore() {
  return Boolean(
    (process.env.SUPABASE_URL?.trim() || process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()) &&
    (process.env.SUPABASE_ANON_KEY?.trim() || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim())
  );
}

function normalizeCounts(counts: Record<string, number> | null | undefined) {
  return Object.fromEntries(
    Object.entries(counts ?? {}).map(([trackKey, count]) => [trackKey, Number(count) || 0])
  );
}

export async function readGlobalStats(): Promise<GlobalStats> {
  const supabase = createSupabase();
  if (!supabase) {
    return { playCounts: {}, monthlyListeners: 0 };
  }

  const { data, error } = await supabase.rpc("get_stream_stats");
  if (error) throw error;

  return {
    playCounts: normalizeCounts(data?.playCounts),
    monthlyListeners: Number(data?.monthlyListeners) || 0,
  };
}

export async function recordGlobalPlay(trackKey: string, listenerId: string): Promise<GlobalStats> {
  const supabase = createSupabase();
  if (!supabase) {
    return { playCounts: {}, monthlyListeners: 0 };
  }

  const { error } = await supabase.rpc("record_track_play", {
    p_track_key: trackKey,
    p_listener_id: listenerId,
  });
  if (error) throw error;

  return readGlobalStats();
}