-- AI Zero to Hero — initial schema
-- Tables, RLS, unlock/XP/rank/streak logic (server-side), leaderboard view, realtime.
-- Run in the Supabase SQL editor, or with `supabase db push`.

-- ───────────────────────── tables ─────────────────────────

create table public.users_profile (
  id            uuid primary key references auth.users (id) on delete cascade,
  name          text        not null default 'Learner',
  xp            int         not null default 0 check (xp >= 0),
  streak        int         not null default 0 check (streak >= 0),
  rank          text        not null default 'Beginner',
  last_active_on date,                       -- drives the daily streak
  created_at    timestamptz not null default now()
);

create table public.topics (
  id              uuid primary key default gen_random_uuid(),
  slug            text    not null unique,
  title           text    not null,
  description     text    not null,
  order_index     int     not null unique,
  cover_image_url text,
  is_published    boolean not null default true
);

create table public.sessions (
  id               uuid primary key default gen_random_uuid(),
  topic_id         uuid not null references public.topics (id) on delete cascade,
  title            text not null,
  content_markdown text not null,
  order_index      int  not null,
  youtube_urls     jsonb not null default '[]'::jsonb,  -- [{title, url, thumbnail}]
  unique (topic_id, order_index)
);

create table public.inline_quizzes (
  id            uuid primary key default gen_random_uuid(),
  session_id    uuid not null references public.sessions (id) on delete cascade,
  question      text  not null,
  options       jsonb not null,                           -- ["a","b","c","d"]
  correct_index int   not null check (correct_index between 0 and 3),
  explanation   text  not null,
  order_index   int   not null default 0
);

create table public.final_quizzes (
  id        uuid primary key default gen_random_uuid(),
  topic_id  uuid not null unique references public.topics (id) on delete cascade,
  questions jsonb not null                                -- [{question, options[], correct_index, explanation}]
);

-- One row per completed session (session_id set) and one row per topic final quiz (session_id null).
create table public.user_progress (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  topic_id     uuid not null references public.topics (id) on delete cascade,
  session_id   uuid references public.sessions (id) on delete cascade,
  completed    boolean not null default false,
  quiz_passed  boolean not null default false,
  score        int,
  completed_at timestamptz
);
create unique index user_progress_session_uidx on public.user_progress (user_id, session_id) where session_id is not null;
create unique index user_progress_final_uidx   on public.user_progress (user_id, topic_id)   where session_id is null;
create index user_progress_user_idx on public.user_progress (user_id);

-- ───────────────────────── rank + profile triggers ─────────────────────────

-- 0–99 Beginner · 100–299 Explorer · 300–499 Builder · 500+ AI Pro
create or replace function public.rank_for_xp(p_xp int) returns text
language sql immutable as $$
  select case
    when p_xp >= 500 then 'AI Pro'
    when p_xp >= 300 then 'Builder'
    when p_xp >= 100 then 'Explorer'
    else 'Beginner'
  end
$$;

create or replace function public.users_profile_set_rank() returns trigger
language plpgsql as $$
begin
  new.rank := public.rank_for_xp(new.xp);
  return new;
end $$;

create trigger users_profile_rank_trg
  before insert or update of xp on public.users_profile
  for each row execute function public.users_profile_set_rank();

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.users_profile (id, name)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'name'), ''), split_part(new.email, '@', 1), 'Learner')
  )
  on conflict (id) do nothing;
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ───────────────────────── unlock logic ─────────────────────────

-- Topic 1 is open to everyone. Every other topic opens when the previous topic's final quiz is passed.
create or replace function public.is_topic_unlocked(p_user uuid, p_topic uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from public.topics t
    where t.id = p_topic and t.is_published
      and (
        not exists (select 1 from public.topics e where e.is_published and e.order_index < t.order_index)
        or exists (
          select 1
          from public.topics prev
          join public.user_progress up
            on up.topic_id = prev.id and up.user_id = p_user and up.session_id is null and up.quiz_passed
          where prev.is_published
            and prev.order_index = (select max(x.order_index) from public.topics x
                                    where x.is_published and x.order_index < t.order_index)
        )
      )
  )
$$;

create or replace function public.touch_streak(p_uid uuid) returns void
language sql security definer set search_path = public as $$
  update public.users_profile
     set streak = case
                    when last_active_on = current_date     then streak
                    when last_active_on = current_date - 1 then streak + 1
                    else 1
                  end,
         last_active_on = current_date
   where id = p_uid
$$;

-- ───────────────────────── row level security ─────────────────────────

alter table public.users_profile  enable row level security;
alter table public.topics         enable row level security;
alter table public.sessions       enable row level security;
alter table public.inline_quizzes enable row level security;
alter table public.final_quizzes  enable row level security;   -- no policy: reachable only through RPC
alter table public.user_progress  enable row level security;

revoke all on all tables in schema public from anon, authenticated;

grant select on public.topics to anon, authenticated;
grant select on public.users_profile, public.sessions, public.inline_quizzes, public.user_progress to authenticated;
grant update (name) on public.users_profile to authenticated;       -- xp / streak / rank are server-owned

create policy topics_read on public.topics
  for select to anon, authenticated using (is_published);

create policy profiles_read on public.users_profile
  for select to authenticated using (true);                           -- needed for the leaderboard
create policy profiles_update_own_name on public.users_profile
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create policy sessions_read_if_unlocked on public.sessions
  for select to authenticated using (public.is_topic_unlocked(auth.uid(), topic_id));

create policy inline_quizzes_read_if_unlocked on public.inline_quizzes
  for select to authenticated using (
    exists (select 1 from public.sessions s
            where s.id = inline_quizzes.session_id
              and public.is_topic_unlocked(auth.uid(), s.topic_id))
  );

create policy progress_read_own on public.user_progress
  for select to authenticated using (user_id = auth.uid());

-- ───────────────────────── RPC: dashboard ─────────────────────────

create or replace function public.get_dashboard() returns jsonb
language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', t.id,
    'slug', t.slug,
    'title', t.title,
    'description', t.description,
    'order_index', t.order_index,
    'cover_image_url', t.cover_image_url,
    'session_count', (select count(*) from public.sessions s where s.topic_id = t.id),
    'completed_count', (select count(*) from public.user_progress p
                         where p.user_id = auth.uid() and p.topic_id = t.id
                           and p.session_id is not null and p.completed),
    'quiz_passed', exists (select 1 from public.user_progress p
                            where p.user_id = auth.uid() and p.topic_id = t.id
                              and p.session_id is null and p.quiz_passed),
    'best_score', (select max(p.score) from public.user_progress p
                    where p.user_id = auth.uid() and p.topic_id = t.id and p.session_id is null),
    'unlocked', public.is_topic_unlocked(auth.uid(), t.id)
  ) order by t.order_index), '[]'::jsonb)
  from public.topics t
  where t.is_published
$$;

-- ───────────────────────── RPC: complete a session ─────────────────────────

create or replace function public.complete_session(p_session_id uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_uid   uuid := auth.uid();
  v_topic uuid;
  v_done  int;
  v_total int;
begin
  if v_uid is null then raise exception 'not authenticated' using errcode = '28000'; end if;

  select topic_id into v_topic from public.sessions where id = p_session_id;
  if v_topic is null then raise exception 'session not found' using errcode = 'P0002'; end if;
  if not public.is_topic_unlocked(v_uid, v_topic) then
    raise exception 'topic is locked' using errcode = '42501';
  end if;

  insert into public.user_progress (user_id, topic_id, session_id, completed, completed_at)
  values (v_uid, v_topic, p_session_id, true, now())
  on conflict (user_id, session_id) where session_id is not null
  do update set completed = true,
                completed_at = coalesce(public.user_progress.completed_at, now());

  perform public.touch_streak(v_uid);

  select count(*) into v_total from public.sessions where topic_id = v_topic;
  select count(*) into v_done  from public.user_progress
   where user_id = v_uid and topic_id = v_topic and session_id is not null and completed;

  return jsonb_build_object(
    'topic_id', v_topic,
    'completed_count', v_done,
    'session_count', v_total,
    'all_done', v_done >= v_total,
    'streak', (select streak from public.users_profile where id = v_uid)
  );
end $$;

-- ───────────────────────── RPC: final quiz ─────────────────────────

-- Questions without answers (correct_index / explanation are never sent before submit).
create or replace function public.get_final_quiz(p_topic_id uuid) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_total int; v_done int; v_title text; v_q jsonb;
begin
  if v_uid is null then raise exception 'not authenticated' using errcode = '28000'; end if;
  if not public.is_topic_unlocked(v_uid, p_topic_id) then
    raise exception 'topic is locked' using errcode = '42501';
  end if;

  select count(*) into v_total from public.sessions where topic_id = p_topic_id;
  select count(*) into v_done  from public.user_progress
   where user_id = v_uid and topic_id = p_topic_id and session_id is not null and completed;
  if v_done < v_total then
    raise exception 'finish all sessions first' using errcode = 'P0001';
  end if;

  select t.title, (
           select jsonb_agg(jsonb_build_object('question', q ->> 'question', 'options', q -> 'options') order by n)
             from jsonb_array_elements(f.questions) with ordinality as e(q, n)
         )
    into v_title, v_q
    from public.final_quizzes f join public.topics t on t.id = f.topic_id
   where f.topic_id = p_topic_id;
  if v_q is null then raise exception 'no final quiz for this topic' using errcode = 'P0002'; end if;

  return jsonb_build_object(
    'topic_id', p_topic_id, 'title', v_title,
    'time_limit_seconds', 900, 'pass_percent', 70,
    'questions', v_q
  );
end $$;

-- Grades server-side, records the attempt, and on the FIRST pass awards +100 XP,
-- updates the streak and (via trigger) the rank.
create or replace function public.submit_final_quiz(p_topic_id uuid, p_answers jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_total int; v_done int; v_sessions int;
  v_questions jsonb; v_n int;
  v_correct int := 0; v_pct int; v_passed boolean; v_was_passed boolean;
  v_review jsonb := '[]'::jsonb;
  v_q jsonb; v_i int; v_pick int;
  v_xp_awarded int := 0;
  v_profile public.users_profile;
  v_next text;
begin
  if v_uid is null then raise exception 'not authenticated' using errcode = '28000'; end if;
  if not public.is_topic_unlocked(v_uid, p_topic_id) then
    raise exception 'topic is locked' using errcode = '42501';
  end if;

  select count(*) into v_sessions from public.sessions where topic_id = p_topic_id;
  select count(*) into v_done from public.user_progress
   where user_id = v_uid and topic_id = p_topic_id and session_id is not null and completed;
  if v_done < v_sessions then raise exception 'finish all sessions first' using errcode = 'P0001'; end if;

  select questions into v_questions from public.final_quizzes where topic_id = p_topic_id;
  if v_questions is null then raise exception 'no final quiz for this topic' using errcode = 'P0002'; end if;

  v_total := jsonb_array_length(v_questions);
  if jsonb_typeof(p_answers) <> 'array' or jsonb_array_length(p_answers) <> v_total then
    raise exception 'expected % answers', v_total using errcode = '22023';
  end if;

  for v_i in 0 .. v_total - 1 loop
    v_q := v_questions -> v_i;
    v_pick := case when jsonb_typeof(p_answers -> v_i) = 'number' then (p_answers ->> v_i)::int else -1 end;
    if v_pick = (v_q ->> 'correct_index')::int then v_correct := v_correct + 1; end if;
    v_review := v_review || jsonb_build_array(jsonb_build_object(
      'question', v_q ->> 'question',
      'options', v_q -> 'options',
      'your_index', v_pick,
      'correct_index', (v_q ->> 'correct_index')::int,
      'explanation', v_q ->> 'explanation',
      'is_correct', v_pick = (v_q ->> 'correct_index')::int
    ));
  end loop;

  v_pct := round(v_correct * 100.0 / v_total);
  v_passed := v_pct >= 70;

  select coalesce(bool_or(quiz_passed), false) into v_was_passed
    from public.user_progress where user_id = v_uid and topic_id = p_topic_id and session_id is null;

  insert into public.user_progress (user_id, topic_id, session_id, completed, quiz_passed, score, completed_at)
  values (v_uid, p_topic_id, null, v_passed, v_passed, v_pct, case when v_passed then now() end)
  on conflict (user_id, topic_id) where session_id is null
  do update set score        = greatest(coalesce(public.user_progress.score, 0), excluded.score),
                quiz_passed  = public.user_progress.quiz_passed or excluded.quiz_passed,
                completed    = public.user_progress.completed   or excluded.completed,
                completed_at = coalesce(public.user_progress.completed_at, excluded.completed_at);

  if v_passed then
    perform public.touch_streak(v_uid);
    if not v_was_passed then
      update public.users_profile set xp = xp + 100 where id = v_uid;
      v_xp_awarded := 100;
    end if;
  end if;

  select * into v_profile from public.users_profile where id = v_uid;
  select t2.slug into v_next
    from public.topics t1 join public.topics t2 on t2.order_index = t1.order_index + 1 and t2.is_published
   where t1.id = p_topic_id;

  return jsonb_build_object(
    'score', v_pct, 'correct', v_correct, 'total', v_total,
    'passed', v_passed, 'first_pass', v_passed and not v_was_passed,
    'xp_awarded', v_xp_awarded, 'xp', v_profile.xp, 'rank', v_profile.rank, 'streak', v_profile.streak,
    'next_topic_slug', case when v_passed then v_next end,
    'review', v_review
  );
end $$;

revoke all on function public.get_dashboard(), public.complete_session(uuid),
                       public.get_final_quiz(uuid), public.submit_final_quiz(uuid, jsonb),
                       public.is_topic_unlocked(uuid, uuid), public.touch_streak(uuid) from public, anon, authenticated;
grant execute on function public.get_dashboard(), public.complete_session(uuid),
                          public.get_final_quiz(uuid), public.submit_final_quiz(uuid, jsonb)
  to authenticated;
-- is_topic_unlocked is used inside RLS policies, which run as the calling role.
grant execute on function public.is_topic_unlocked(uuid, uuid) to authenticated;

-- ───────────────────────── leaderboard ─────────────────────────

-- `rank` = position by XP (ties share a position); `badge` = tier name.
-- Runs with the view owner's rights so it can count other users' passed topics.
create or replace view public.leaderboard as
select
  p.id as user_id,
  p.name,
  p.xp,
  coalesce((select count(*) from public.user_progress up
             where up.user_id = p.id and up.session_id is null and up.quiz_passed), 0)::int as topics_completed,
  (rank() over (order by p.xp desc))::int as rank,
  p.rank as badge
from public.users_profile p;

revoke all on public.leaderboard from anon, authenticated;
grant select on public.leaderboard to authenticated;

-- ───────────────────────── realtime ─────────────────────────
-- The leaderboard page subscribes to changes on users_profile and re-reads the view.

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.users_profile;
  end if;
end $$;
