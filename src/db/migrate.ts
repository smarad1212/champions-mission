import dotenv from 'dotenv'
import path from 'path'
dotenv.config({ path: path.resolve(__dirname, '../../.env'), override: true })

import { pool } from '../lib/db'

const SQL = `
CREATE TABLE IF NOT EXISTS children (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  age integer not null,
  gender text not null,
  city text not null,
  interests text[] default '{}',
  active_subjects text[] default '{"math","hebrew","finance","torah","ai_tech"}',
  adhd_mode boolean default true,
  weak_areas text[] default '{}',
  subject_last_seen jsonb default '{}',
  recent_concepts text[] default '{}',
  total_xp integer default 0,
  streak_days integer default 0,
  streak_shields integer default 0,
  streak_last_active date,
  level integer default 1,
  sprint_count_today integer default 0,
  xp_multiplier numeric default 1.0,
  created_at timestamptz default now()
);

CREATE TABLE IF NOT EXISTS sprints (
  id uuid primary key default gen_random_uuid(),
  child_id uuid references children(id),
  subject text,
  concept text,
  difficulty integer,
  content jsonb,
  xp_earned integer default 0,
  completed_at timestamptz,
  created_at timestamptz default now()
);

CREATE TABLE IF NOT EXISTS daily_state (
  id uuid primary key default gen_random_uuid(),
  child_id uuid references children(id),
  date date not null,
  sprints_completed integer default 0,
  field_task jsonb,
  unique(child_id, date)
);

CREATE TABLE IF NOT EXISTS question_results (
  id uuid primary key default gen_random_uuid(),
  child_id uuid references children(id),
  sprint_id uuid references sprints(id),
  subject text not null,
  concept text not null,
  question_id integer not null,
  correct_on_first_attempt boolean not null,
  total_attempts integer not null default 1,
  answered_at timestamptz default now()
);

CREATE TABLE IF NOT EXISTS subject_performance (
  id uuid primary key default gen_random_uuid(),
  child_id uuid references children(id),
  subject text not null,
  total_questions integer default 0,
  first_attempt_correct integer default 0,
  error_rate numeric default 0,
  current_difficulty integer default 2,
  concepts_seen text[] default '{}',
  concepts_failed text[] default '{}',
  concepts_mastered text[] default '{}',
  updated_at timestamptz default now(),
  unique(child_id, subject)
);
`

async function migrate() {
  console.log('Connecting to Neon Postgres...')
  const client = await pool.connect()
  try {
    await client.query(SQL)
    console.log('✅ Migration complete — tables created:')
    console.log('   • children')
    console.log('   • sprints')
    console.log('   • daily_state')
    console.log('   • question_results')
    console.log('   • subject_performance')

    // Verify
    const { rows } = await client.query(`
      SELECT tablename FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename
    `)
    console.log('\nTables in DB:', rows.map((r) => r.tablename).join(', '))
  } finally {
    client.release()
    await pool.end()
  }
}

migrate().catch((err) => {
  console.error('❌ Migration failed:', err.message)
  process.exit(1)
})
