-- Run against your Postgres/Supabase DB if `highlight` is missing (e.g. after `drizzle-kit push`).
ALTER TABLE categories ADD COLUMN IF NOT EXISTS highlight varchar(120);
