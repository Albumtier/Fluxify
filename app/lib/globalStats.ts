import { Redis } from "@upstash/redis";

const PLAY_COUNTS_KEY = "fluxify:playCounts";
const MONTHLY_LISTENERS_KEY = "fluxify:monthlyListeners";
const MONTH_MS = 30 * 24 * 60 * 60 * 1000;

type GlobalStats = {
  playCounts: Record<string, number>;
  monthlyListeners: number;
};

function createRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();

  if (!url || !token) {
    return null;
  }

  return new Redis({ url, token });
}

export function hasGlobalStatsStore() {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL?.trim() &&
    process.env.UPSTASH_REDIS_REST_TOKEN?.trim()
  );
}

function normalizeCounts(counts: Record<string, number> | null | undefined) {
  return Object.fromEntries(
    Object.entries(counts ?? {}).map(([trackKey, count]) => [trackKey, Number(count) || 0])
  );
}

export async function readGlobalStats(): Promise<GlobalStats> {
  const redis = createRedis();
  if (!redis) {
    return { playCounts: {}, monthlyListeners: 0 };
  }

  const [playCountsRaw, monthlyListenersRaw] = await Promise.all([
    redis.hgetall<Record<string, number>>(PLAY_COUNTS_KEY),
    redis.zcard(MONTHLY_LISTENERS_KEY),
  ]);

  return {
    playCounts: normalizeCounts(playCountsRaw),
    monthlyListeners: Number(monthlyListenersRaw) || 0,
  };
}

export async function recordGlobalPlay(trackKey: string, listenerId: string): Promise<GlobalStats> {
  const redis = createRedis();
  if (!redis) {
    return { playCounts: {}, monthlyListeners: 0 };
  }

  const now = Date.now();
  const cutoff = now - MONTH_MS;

  await redis.hincrby(PLAY_COUNTS_KEY, trackKey, 1);
  await redis.zremrangebyscore(MONTHLY_LISTENERS_KEY, 0, cutoff);

  const existing = await redis.zscore(MONTHLY_LISTENERS_KEY, listenerId);
  if (existing === null) {
    await redis.zadd(MONTHLY_LISTENERS_KEY, {
      score: now,
      member: listenerId,
    });
  }

  return readGlobalStats();
}