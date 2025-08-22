-- Enable pgcrypto for gen_random_uuid
create extension if not exists pgcrypto;

-- Schema for Military Asset Management System

create table if not exists bases (
  id bigserial primary key,
  name text not null unique
);

create table if not exists equipment_types (
  id bigserial primary key,
  name text not null unique,
  category text not null -- e.g., weapon, vehicle, ammunition
);

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  role text not null check (role in ('admin','base_commander','logistics_officer')),
  base_id bigint references bases(id),
  password_hash text
);

create table if not exists inventories (
  id bigserial primary key,
  base_id bigint not null references bases(id) on delete cascade,
  equipment_type_id bigint not null references equipment_types(id) on delete cascade,
  opening_balance bigint not null default 0,
  closing_balance bigint not null default 0,
  constraint uniq_inventory unique (base_id, equipment_type_id)
);

create table if not exists movements (
  id bigserial primary key,
  base_id bigint not null references bases(id) on delete cascade,
  equipment_type_id bigint not null references equipment_types(id) on delete cascade,
  quantity bigint not null,
  kind text not null check (kind in ('purchase','transfer_in','transfer_out','assignment','expenditure')),
  occurred_at timestamptz not null default now(),
  details jsonb
);

create table if not exists purchases (
  id bigserial primary key,
  base_id bigint not null references bases(id) on delete cascade,
  equipment_type_id bigint not null references equipment_types(id) on delete cascade,
  quantity bigint not null,
  unit_cost numeric,
  purchased_at timestamptz not null default now()
);

create table if not exists transfers (
  id bigserial primary key,
  from_base_id bigint not null references bases(id) on delete cascade,
  to_base_id bigint not null references bases(id) on delete cascade,
  equipment_type_id bigint not null references equipment_types(id) on delete cascade,
  quantity bigint not null,
  transferred_at timestamptz not null default now()
);

create table if not exists assignments (
  id bigserial primary key,
  base_id bigint not null references bases(id) on delete cascade,
  equipment_type_id bigint not null references equipment_types(id) on delete cascade,
  quantity bigint not null,
  assigned_to text not null,
  assigned_at timestamptz not null default now()
);

create table if not exists expenditures (
  id bigserial primary key,
  base_id bigint not null references bases(id) on delete cascade,
  equipment_type_id bigint not null references equipment_types(id) on delete cascade,
  quantity bigint not null,
  expended_at timestamptz not null default now(),
  notes text
);

create table if not exists audit_logs (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  actor_id uuid,
  actor_role text,
  path text not null,
  method text not null,
  payload jsonb
);

-- Helper function: ensure inventory row exists
create or replace function ensure_inventory(p_base_id bigint, p_equipment_type_id bigint)
returns void language plpgsql as $$
begin
  insert into inventories (base_id, equipment_type_id, opening_balance, closing_balance)
  values (p_base_id, p_equipment_type_id, 0, 0)
  on conflict (base_id, equipment_type_id) do nothing;
end;
$$;

-- Purchase RPC: records purchase and updates inventory/movements
create or replace function record_purchase(
  p_base_id bigint,
  p_equipment_type_id bigint,
  p_quantity bigint,
  p_unit_cost numeric,
  p_when timestamptz
) returns void language plpgsql as $$
begin
  perform ensure_inventory(p_base_id, p_equipment_type_id);
  insert into purchases(base_id, equipment_type_id, quantity, unit_cost, purchased_at)
  values (p_base_id, p_equipment_type_id, p_quantity, p_unit_cost, coalesce(p_when, now()));
  update inventories set closing_balance = closing_balance + p_quantity
  where base_id = p_base_id and equipment_type_id = p_equipment_type_id;
  insert into movements(base_id, equipment_type_id, quantity, kind, occurred_at, details)
  values (p_base_id, p_equipment_type_id, p_quantity, 'purchase', coalesce(p_when, now()), null);
end;
$$;

-- Transfer RPC: records transfer out + in and updates inventories/movements
create or replace function record_transfer(
  p_from_base_id bigint,
  p_to_base_id bigint,
  p_equipment_type_id bigint,
  p_quantity bigint,
  p_when timestamptz
) returns void language plpgsql as $$
begin
  perform ensure_inventory(p_from_base_id, p_equipment_type_id);
  perform ensure_inventory(p_to_base_id, p_equipment_type_id);
  update inventories set closing_balance = closing_balance - p_quantity
  where base_id = p_from_base_id and equipment_type_id = p_equipment_type_id;
  update inventories set closing_balance = closing_balance + p_quantity
  where base_id = p_to_base_id and equipment_type_id = p_equipment_type_id;
  insert into transfers(from_base_id, to_base_id, equipment_type_id, quantity, transferred_at)
  values (p_from_base_id, p_to_base_id, p_equipment_type_id, p_quantity, coalesce(p_when, now()));
  insert into movements(base_id, equipment_type_id, quantity, kind, occurred_at, details)
  values (p_from_base_id, p_equipment_type_id, p_quantity, 'transfer_out', coalesce(p_when, now()), jsonb_build_object('to_base_id', p_to_base_id));
  insert into movements(base_id, equipment_type_id, quantity, kind, occurred_at, details)
  values (p_to_base_id, p_equipment_type_id, p_quantity, 'transfer_in', coalesce(p_when, now()), jsonb_build_object('from_base_id', p_from_base_id));
end;
$$;

-- Assignment RPC: records assignment and deducts inventory
create or replace function record_assignment(
  p_base_id bigint,
  p_equipment_type_id bigint,
  p_quantity bigint,
  p_assigned_to text,
  p_when timestamptz
) returns void language plpgsql as $$
begin
  perform ensure_inventory(p_base_id, p_equipment_type_id);
  update inventories set closing_balance = closing_balance - p_quantity
  where base_id = p_base_id and equipment_type_id = p_equipment_type_id;
  insert into assignments(base_id, equipment_type_id, quantity, assigned_to, assigned_at)
  values (p_base_id, p_equipment_type_id, p_quantity, p_assigned_to, coalesce(p_when, now()));
  insert into movements(base_id, equipment_type_id, quantity, kind, occurred_at, details)
  values (p_base_id, p_equipment_type_id, p_quantity, 'assignment', coalesce(p_when, now()), jsonb_build_object('assigned_to', p_assigned_to));
end;
$$;

-- Expenditure RPC: records expenditure and deducts inventory
create or replace function record_expenditure(
  p_base_id bigint,
  p_equipment_type_id bigint,
  p_quantity bigint,
  p_when timestamptz,
  p_notes text
) returns void language plpgsql as $$
begin
  perform ensure_inventory(p_base_id, p_equipment_type_id);
  update inventories set closing_balance = closing_balance - p_quantity
  where base_id = p_base_id and equipment_type_id = p_equipment_type_id;
  insert into expenditures(base_id, equipment_type_id, quantity, expended_at, notes)
  values (p_base_id, p_equipment_type_id, p_quantity, coalesce(p_when, now()), p_notes);
  insert into movements(base_id, equipment_type_id, quantity, kind, occurred_at, details)
  values (p_base_id, p_equipment_type_id, p_quantity, 'expenditure', coalesce(p_when, now()), jsonb_build_object('notes', p_notes));
end;
$$;

-- Metrics RPC: Opening, Closing, Net, Assigned, Expended in range
create or replace function compute_metrics(
  p_base_id bigint,
  p_equipment_type_id bigint,
  p_start timestamptz,
  p_end timestamptz
) returns table (
  opening_balance bigint,
  closing_balance bigint,
  purchases bigint,
  transfer_in bigint,
  transfer_out bigint,
  net_movement bigint,
  assigned bigint,
  expended bigint
) language plpgsql as $$
begin
  return query
  with inv as (
    select i.opening_balance as inv_opening,
           i.closing_balance as inv_closing
    from inventories i
    where i.base_id = p_base_id
      and (p_equipment_type_id is null or i.equipment_type_id = p_equipment_type_id)
    limit 1
  ),
  mv as (
    select
      sum(case when kind = 'purchase' then quantity else 0 end) as mv_purchases,
      sum(case when kind = 'transfer_in' then quantity else 0 end) as mv_transfer_in,
      sum(case when kind = 'transfer_out' then quantity else 0 end) as mv_transfer_out,
      sum(case when kind = 'assignment' then quantity else 0 end) as mv_assigned,
      sum(case when kind = 'expenditure' then quantity else 0 end) as mv_expended
    from movements m
    where m.base_id = p_base_id
      and (p_equipment_type_id is null or m.equipment_type_id = p_equipment_type_id)
      and (p_start is null or m.occurred_at >= p_start)
      and (p_end is null or m.occurred_at <= p_end)
  )
  select
    coalesce((select inv_opening from inv), 0) as opening_balance,
    coalesce((select inv_closing from inv), 0) as closing_balance,
    coalesce((select mv_purchases from mv), 0)::bigint as purchases,
    coalesce((select mv_transfer_in from mv), 0)::bigint as transfer_in,
    coalesce((select mv_transfer_out from mv), 0)::bigint as transfer_out,
    (coalesce((select mv_purchases from mv), 0)::bigint + coalesce((select mv_transfer_in from mv), 0)::bigint - coalesce((select mv_transfer_out from mv), 0)::bigint) as net_movement,
    coalesce((select mv_assigned from mv), 0)::bigint as assigned,
    coalesce((select mv_expended from mv), 0)::bigint as expended;
end;
$$;


