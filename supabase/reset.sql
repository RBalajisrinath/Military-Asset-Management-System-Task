-- DANGER: Reset database objects for this app. Run in Supabase SQL editor.
-- Drops functions first, then tables, then types if any.

-- Drop functions (ignore if not exist)
drop function if exists compute_metrics(bigint,bigint,timestamptz,timestamptz) cascade;
drop function if exists record_expenditure(bigint,bigint,bigint,timestamptz,text) cascade;
drop function if exists record_assignment(bigint,bigint,bigint,text,timestamptz) cascade;
drop function if exists record_transfer(bigint,bigint,bigint,bigint,timestamptz) cascade;
drop function if exists record_purchase(bigint,bigint,bigint,numeric,timestamptz) cascade;
drop function if exists ensure_inventory(bigint,bigint) cascade;

-- Drop tables (order matters due to FKs)
drop table if exists audit_logs cascade;
drop table if exists expenditures cascade;
drop table if exists assignments cascade;
drop table if exists transfers cascade;
drop table if exists purchases cascade;
drop table if exists movements cascade;
drop table if exists inventories cascade;
drop table if exists users cascade;
drop table if exists equipment_types cascade;
drop table if exists bases cascade;

-- Optionally drop extension (usually keep it enabled)
-- drop extension if exists pgcrypto;

-- After this, run: supabase/schema.sql (and optionally supabase/seed.sql or supabase/sample_data.sql)


