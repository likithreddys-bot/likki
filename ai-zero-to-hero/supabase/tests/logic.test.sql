-- Logic tests for 0001_init.sql + seed.sql. Run with scripts/test-sql.sh (plain Postgres + auth stub).
\set ON_ERROR_STOP on
\set QUIET on
\pset format unaligned
\pset tuples_only on

create schema test;
grant usage on schema test to public;

create function test.assert(cond boolean, msg text) returns void language plpgsql as $$
begin
  if cond is not true then raise exception 'ASSERTION FAILED: %', msg; end if;
  raise notice 'ok - %', msg;
end $$;

-- Answers array for a topic's final quiz: first n_correct right, the rest deliberately wrong.
create function test.answers(p_slug text, n_correct int) returns jsonb language sql security definer as $$
  select jsonb_agg(
           case when n <= n_correct then (q ->> 'correct_index')::int
                else (((q ->> 'correct_index')::int) + 1) % 4 end order by n)
    from public.final_quizzes f
    join public.topics t on t.id = f.topic_id and t.slug = p_slug,
    jsonb_array_elements(f.questions) with ordinality as e(q, n)
$$;
grant execute on function test.answers(text, int) to public;

create function test.qcount(p_slug text) returns int language sql security definer as $$
  select jsonb_array_length(f.questions) from public.final_quizzes f join public.topics t on t.id = f.topic_id and t.slug = p_slug
$$;
grant execute on function test.qcount(text) to public;

create function test.sid(p_slug text, p_ord int) returns uuid language sql security definer as $$
  select s.id from public.sessions s join public.topics t on t.id = s.topic_id
   where t.slug = p_slug and s.order_index = p_ord
$$;
grant execute on function test.sid(text, int) to public;

create function test.complete_all(p_slug text) returns void language plpgsql as $$
declare r record;
begin
  for r in select s.order_index from public.sessions s join public.topics t on t.id = s.topic_id
            where t.slug = p_slug order by 1 loop
    perform public.complete_session(test.sid(p_slug, r.order_index));
  end loop;
end $$;
grant execute on function test.complete_all(text) to public;

create function test.expect_error(p_sql text, p_fragment text) returns void language plpgsql as $$
begin
  begin
    execute p_sql;
  exception when others then
    if sqlerrm like '%' || p_fragment || '%' then
      raise notice 'ok - errors as expected (%): %', p_fragment, left(sqlerrm, 80);
      return;
    end if;
    raise exception 'ASSERTION FAILED: expected error containing "%" but got "%"', p_fragment, sqlerrm;
  end;
  raise exception 'ASSERTION FAILED: expected an error containing "%" but statement succeeded', p_fragment;
end $$;
grant execute on function test.expect_error(text, text) to public;

-- ───────────────────────── users ─────────────────────────
insert into auth.users (email, raw_user_meta_data) values ('ada@example.test', '{"name":"Ada"}');
insert into auth.users (email) values ('bob@example.test');
select id as uid_a from auth.users where email = 'ada@example.test' \gset
select id as uid_b from auth.users where email = 'bob@example.test' \gset

select test.assert((select count(*) from public.users_profile) = 2, 'signup trigger created a profile per user');
select test.assert((select name from public.users_profile where id = :'uid_a') = 'Ada', 'profile name comes from metadata');
select test.assert((select name from public.users_profile where id = :'uid_b') = 'bob', 'profile name falls back to email prefix');
select test.assert((select xp = 0 and streak = 0 and rank = 'Beginner' from public.users_profile where id = :'uid_a'), 'defaults: 0 XP, 0 streak, Beginner');

-- ───────────────────────── seed shape ─────────────────────────
select test.assert((select count(*) from public.topics) = 10, '10 topics seeded');
select test.assert((select count(*) from public.sessions) = 63, '63 sessions seeded');
select test.assert((select count(*) from public.inline_quizzes) = 78, '78 inline quizzes seeded (8+8+8+9+8+10+6+7+7+7)');
select test.assert((select count(*) from public.final_quizzes) = 10, '10 final quizzes seeded');
select test.assert((select string_agg(jsonb_array_length(questions)::text, ',' order by t.order_index)
                      from public.final_quizzes f join public.topics t on t.id = f.topic_id) = '10,10,10,12,10,12,10,10,10,10',
                   'final quiz sizes are 10,10,10,12,10,12,10,10,10,10');

-- ───────────────────────── rank thresholds ─────────────────────────
select test.assert(public.rank_for_xp(0)   = 'Beginner', 'rank 0 = Beginner');
select test.assert(public.rank_for_xp(99)  = 'Beginner', 'rank 99 = Beginner');
select test.assert(public.rank_for_xp(100) = 'Explorer', 'rank 100 = Explorer');
select test.assert(public.rank_for_xp(299) = 'Explorer', 'rank 299 = Explorer');
select test.assert(public.rank_for_xp(300) = 'Builder',  'rank 300 = Builder');
select test.assert(public.rank_for_xp(499) = 'Builder',  'rank 499 = Builder');
select test.assert(public.rank_for_xp(500) = 'AI Pro',   'rank 500 = AI Pro');

-- ───────────────────────── as Ada: unlock rules ─────────────────────────
select set_config('test.uid', :'uid_a', false) \gset
set role authenticated;

select test.assert((select jsonb_array_length(public.get_dashboard())) = 10, 'dashboard lists all 10 topics');
select test.assert((select (public.get_dashboard() -> 0 ->> 'unlocked')::boolean), 'topic 1 is unlocked by default');
select test.assert((select not bool_or((d ->> 'unlocked')::boolean) from jsonb_array_elements(public.get_dashboard()) d where (d ->> 'order_index')::int > 1),
                   'topics 2-10 start locked');
select test.assert((select count(distinct topic_id) from public.sessions) = 1, 'RLS: only topic 1 sessions are readable while others are locked');
select test.assert((select count(*) from public.inline_quizzes) = 8, 'RLS: only topic 1 inline quizzes are readable');
select test.expect_error($$ select count(*) from public.final_quizzes $$, 'permission denied');
select test.expect_error($$ select public.complete_session(test.sid('how-ai-models-work', 1)) $$, 'locked');
select test.expect_error($$ select public.get_final_quiz((select id from public.topics where slug = 'how-ai-models-work')) $$, 'locked');
select test.expect_error($$ select public.touch_streak(auth.uid()) $$, 'permission denied');
select test.expect_error($$ update public.users_profile set xp = 9999 where id = auth.uid() $$, 'permission denied');
select test.expect_error($$ insert into public.user_progress (user_id, topic_id, completed, quiz_passed) select auth.uid(), id, true, true from public.topics limit 1 $$, 'permission denied');
update public.users_profile set name = 'Ada L.' where id = :'uid_a';
select test.assert((select name from public.users_profile where id = :'uid_a') = 'Ada L.', 'users can rename themselves');

-- final quiz needs all sessions first
select test.expect_error($$ select public.get_final_quiz((select id from public.topics where slug = 'what-is-ai')) $$, 'finish all sessions');
select public.complete_session(test.sid('what-is-ai', 1));
select test.expect_error($$ select public.get_final_quiz((select id from public.topics where slug = 'what-is-ai')) $$, 'finish all sessions');
select test.assert((public.complete_session(test.sid('what-is-ai', 1)) ->> 'completed_count')::int = 1, 'completing a session twice is idempotent');
select test.complete_all('what-is-ai');
select test.assert((select (d ->> 'completed_count')::int = 7 from jsonb_array_elements(public.get_dashboard()) d where d ->> 'slug' = 'what-is-ai'), '7 of 7 sessions counted');

-- streak starts at 1 after first activity
reset role;
select test.assert((select streak = 1 and last_active_on = current_date from public.users_profile where id = :'uid_a'), 'streak = 1 after first activity today');

-- quiz payload must not leak answers
select set_config('test.uid', :'uid_a', false) \gset
set role authenticated;
select test.assert((public.get_final_quiz((select id from public.topics where slug = 'what-is-ai')) -> 'questions' -> 0) ? 'correct_index' = false, 'get_final_quiz hides correct_index');
select test.assert((public.get_final_quiz((select id from public.topics where slug = 'what-is-ai')) -> 'questions' -> 0) ? 'explanation' = false, 'get_final_quiz hides explanations');
select test.assert(jsonb_array_length(public.get_final_quiz((select id from public.topics where slug = 'what-is-ai')) -> 'questions') = 10, 'topic 1 quiz has 10 questions');

-- wrong answer count is rejected
select test.expect_error($$ select public.submit_final_quiz((select id from public.topics where slug = 'what-is-ai'), '[0,1]'::jsonb) $$, 'expected 10 answers');

-- 6/10 = 60% fails (< 70)
select public.submit_final_quiz((select id from public.topics where slug = 'what-is-ai'), test.answers('what-is-ai', 6)) as r \gset
select test.assert((:'r'::jsonb ->> 'score')::int = 60 and (:'r'::jsonb ->> 'passed')::boolean = false, '6/10 = 60% does not pass');
reset role;
select test.assert((select xp from public.users_profile where id = :'uid_a') = 0, 'failed attempt awards no XP');
select set_config('test.uid', :'uid_a', false) \gset
set role authenticated;
select test.assert((select not (d ->> 'unlocked')::boolean from jsonb_array_elements(public.get_dashboard()) d where d ->> 'slug' = 'how-ai-models-work'), 'topic 2 stays locked after a failed quiz');

-- 7/10 = 70% passes (exactly the threshold)
select public.submit_final_quiz((select id from public.topics where slug = 'what-is-ai'), test.answers('what-is-ai', 7)) as r \gset
select test.assert((:'r'::jsonb ->> 'score')::int = 70 and (:'r'::jsonb ->> 'passed')::boolean, '7/10 = 70% passes');
select test.assert((:'r'::jsonb ->> 'first_pass')::boolean and (:'r'::jsonb ->> 'xp_awarded')::int = 100, 'first pass awards +100 XP');
select test.assert((:'r'::jsonb ->> 'xp')::int = 100 and :'r'::jsonb ->> 'rank' = 'Explorer', '100 XP = Explorer');
select test.assert(:'r'::jsonb ->> 'next_topic_slug' = 'how-ai-models-work', 'result points to the next topic');
select test.assert(jsonb_array_length(:'r'::jsonb -> 'review') = 10 and (:'r'::jsonb -> 'review' -> 0) ? 'correct_index', 'review includes answers after submitting');
select test.assert((select (d ->> 'unlocked')::boolean from jsonb_array_elements(public.get_dashboard()) d where d ->> 'slug' = 'how-ai-models-work'), 'topic 2 unlocks after passing topic 1');
select test.assert((select not (d ->> 'unlocked')::boolean from jsonb_array_elements(public.get_dashboard()) d where d ->> 'slug' = 'ai-tools-landscape'), 'topic 3 is still locked');
select test.assert((select count(distinct topic_id) from public.sessions) = 2, 'RLS: topic 2 sessions are now readable');

-- re-passing (even with a perfect score) never awards XP twice, best score is kept
select public.submit_final_quiz((select id from public.topics where slug = 'what-is-ai'), test.answers('what-is-ai', 10)) as r \gset
select test.assert((:'r'::jsonb ->> 'xp_awarded')::int = 0 and (:'r'::jsonb ->> 'xp')::int = 100, 'second pass awards no extra XP');
select public.submit_final_quiz((select id from public.topics where slug = 'what-is-ai'), test.answers('what-is-ai', 0)) as r \gset
select test.assert((select (d ->> 'quiz_passed')::boolean and (d ->> 'best_score')::int = 100 from jsonb_array_elements(public.get_dashboard()) d where d ->> 'slug' = 'what-is-ai'),
                   'a later bad attempt neither un-passes nor lowers the best score');

-- progress rows are private
reset role;
select set_config('test.uid', :'uid_b', false) \gset
set role authenticated;
select test.assert((select count(*) from public.user_progress) = 0, 'RLS: Bob cannot see Ada''s progress');
select test.assert((select not bool_or((d ->> 'unlocked')::boolean) from jsonb_array_elements(public.get_dashboard()) d where (d ->> 'order_index')::int > 1), 'Bob''s unlocks are independent of Ada''s');
select test.expect_error($$ select public.complete_session(test.sid('how-ai-models-work', 1)) $$, 'locked');

-- ───────────────────────── streak logic ─────────────────────────
reset role;
update public.users_profile set streak = 4, last_active_on = current_date - 1 where id = :'uid_a';
select set_config('test.uid', :'uid_a', false) \gset
set role authenticated;
select public.complete_session(test.sid('how-ai-models-work', 1));
reset role;
select test.assert((select streak = 5 and last_active_on = current_date from public.users_profile where id = :'uid_a'), 'consecutive day: streak 4 -> 5');
select set_config('test.uid', :'uid_a', false) \gset
set role authenticated;
select public.complete_session(test.sid('how-ai-models-work', 2));
reset role;
select test.assert((select streak = 5 from public.users_profile where id = :'uid_a'), 'same day: streak unchanged');
update public.users_profile set last_active_on = current_date - 3 where id = :'uid_a';
select set_config('test.uid', :'uid_a', false) \gset
set role authenticated;
select public.complete_session(test.sid('how-ai-models-work', 3));
reset role;
select test.assert((select streak = 1 from public.users_profile where id = :'uid_a'), 'missed days: streak resets to 1');

-- ───────────────────────── rank follows XP automatically ─────────────────────────
update public.users_profile set xp = 299 where id = :'uid_b';
select test.assert((select rank from public.users_profile where id = :'uid_b') = 'Explorer', 'trigger: 299 XP -> Explorer');
update public.users_profile set xp = 300 where id = :'uid_b';
select test.assert((select rank from public.users_profile where id = :'uid_b') = 'Builder', 'trigger: 300 XP -> Builder');
update public.users_profile set xp = 500 where id = :'uid_b';
select test.assert((select rank from public.users_profile where id = :'uid_b') = 'AI Pro', 'trigger: 500 XP -> AI Pro');

-- ───────────────────────── leaderboard ─────────────────────────
select set_config('test.uid', :'uid_a', false) \gset
set role authenticated;
select test.assert((select count(*) from public.leaderboard) = 2, 'leaderboard lists everyone');
select test.assert((select name from public.leaderboard order by rank limit 1) = 'bob', 'leaderboard is ordered by XP (Bob 500 > Ada 100)');
select test.assert((select rank from public.leaderboard where name = 'Ada L.') = 2, 'rank column is the position');
select test.assert((select badge from public.leaderboard where name = 'bob') = 'AI Pro', 'badge column is the tier');
select test.assert((select topics_completed from public.leaderboard where name = 'Ada L.') = 1, 'topics_completed counts passed final quizzes');
select test.assert((select topics_completed from public.leaderboard where name = 'bob') = 0, 'topics_completed is 0 for Bob');
reset role;
set role anon;
select test.expect_error($$ select * from public.leaderboard $$, 'permission denied');
select test.assert((select count(*) from public.topics) = 10, 'anonymous visitors can read topic titles');
select test.expect_error($$ select * from public.sessions $$, 'permission denied');
reset role;

-- ───────────────────────── realtime publication ─────────────────────────
select test.assert(exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'users_profile'),
                   'users_profile is in the supabase_realtime publication');

-- ───────────────────────── unlock chain walks all 10 topics ─────────────────────────
update public.users_profile set xp = 0 where id = :'uid_b';
select set_config('test.uid', :'uid_b', false) \gset
set role authenticated;
do $$
declare slugs text[] := array['what-is-ai','how-ai-models-work','ai-tools-landscape','prompt-engineering','api-keys-and-integrations','working-with-claude','ai-for-data-analysis','your-own-data-rag','agents-and-tool-use','evaluating-and-shipping-ai'];
        s text; r jsonb;
begin
  foreach s in array slugs loop
    perform test.complete_all(s);
    r := public.submit_final_quiz((select id from public.topics where slug = s), test.answers(s, test.qcount(s)));
    perform test.assert((r ->> 'passed')::boolean, 'Bob passes ' || s);
  end loop;
end $$;
select test.assert((select bool_and((d ->> 'unlocked')::boolean and (d ->> 'quiz_passed')::boolean) from jsonb_array_elements(public.get_dashboard()) d), 'all 10 topics unlocked and passed in sequence');
reset role;
select test.assert((select xp = 1000 and rank = 'AI Pro' from public.users_profile where id = :'uid_b'), 'ten passes = 1000 XP = AI Pro');
