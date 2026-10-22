#!/usr/bin/env bash
# Runs the migration + seed + logic tests against a throw-away local Postgres cluster
# (with a stub of Supabase's auth schema). Requires Postgres 14+ binaries on this machine.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PGBIN="${PGBIN:-$(ls -d /usr/lib/postgresql/*/bin 2>/dev/null | sort -V | tail -1)}"
WORK="$(mktemp -d /tmp/azh-pgtest.XXXXXX)"
PORT="${PGPORT:-54329}"
if [ "$(id -u)" = "0" ]; then RUN="su postgres -c"; chown postgres "$WORK"; else RUN="bash -c"; fi
run() { $RUN "$1"; }
cleanup() { run "$PGBIN/pg_ctl -D $WORK/data -m immediate stop" >/dev/null 2>&1 || true; rm -rf "$WORK"; }
trap cleanup EXIT
chmod -R a+rX "$ROOT/supabase" 2>/dev/null || true

run "$PGBIN/initdb -D $WORK/data -A trust -U postgres >/dev/null"
run "$PGBIN/pg_ctl -D $WORK/data -o '-p $PORT -k $WORK -c listen_addresses=' -l $WORK/log -w start >/dev/null"
PSQL="$PGBIN/psql -h $WORK -p $PORT -U postgres -v ON_ERROR_STOP=1 -q"
run "$PSQL -d postgres -c 'create database azh'"
run "$PSQL -d azh -f $ROOT/supabase/tests/auth-stub.sql"
echo "== migration";           run "$PSQL -d azh -f $ROOT/supabase/migrations/0001_init.sql"
echo "== seed";                run "$PSQL -d azh -f $ROOT/supabase/seed.sql"
echo "== seed again (idempotent)"; run "$PSQL -d azh -f $ROOT/supabase/seed.sql"
echo "== logic tests";         run "$PSQL -d azh -f $ROOT/supabase/tests/logic.test.sql" 2>&1 | sed -e 's/^psql:[^ ]* //' | grep -E "ok -|ERROR|ASSERTION|FATAL" || true
echo "== summary"
run "$PSQL -d azh -At -c \"select 'topics='||count(*) from topics\""
