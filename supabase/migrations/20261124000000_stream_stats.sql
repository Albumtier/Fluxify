create table if not exists public.track_stream_counts (
  track_key text primary key,
  play_count bigint not null default 0
);

create table if not exists public.listener_activity (
  listener_id text primary key,
  last_play_at timestamptz not null default now()
);

alter table public.track_stream_counts enable row level security;
alter table public.listener_activity enable row level security;

create or replace function public.record_track_play(
  p_track_key text,
  p_listener_id text
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.track_stream_counts (track_key, play_count)
  values (p_track_key, 1)
  on conflict (track_key)
  do update set play_count = public.track_stream_counts.play_count + 1;

  insert into public.listener_activity (listener_id, last_play_at)
  values (p_listener_id, now())
  on conflict (listener_id)
  do update set last_play_at = greatest(public.listener_activity.last_play_at, now());

  return public.get_stream_stats();
end;
$$;

create or replace function public.get_stream_stats()
returns jsonb
language sql
security definer
set search_path = public
stable
as $$
  select jsonb_build_object(
    'playCounts',
    coalesce(
      (select jsonb_object_agg(track_key, play_count) from public.track_stream_counts),
      '{}'::jsonb
    ),
    'monthlyListeners',
    (select count(*)::int from public.listener_activity
     where last_play_at >= now() - interval '30 days')
  );
$$;

grant execute on function public.record_track_play(text, text) to anon, authenticated;
grant execute on function public.get_stream_stats() to anon, authenticated;
