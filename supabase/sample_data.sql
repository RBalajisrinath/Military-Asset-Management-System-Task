-- Sample data for Military Asset Management System
-- Run this AFTER schema.sql

-- Bases
insert into bases(name) values
  ('Alpha Base'),
  ('Bravo Base'),
  ('Charlie Base')
on conflict do nothing;

-- Equipment Types
insert into equipment_types(name, category) values
  ('Rifle M4', 'weapon'),
  ('Truck M35', 'vehicle'),
  ('5.56mm Rounds', 'ammunition'),
  ('Mortar Shell 81mm', 'ammunition')
on conflict do nothing;

-- Users with password hashes (requires pgcrypto)
-- Password for all below: Passw0rd!
insert into users(email, role, base_id, password_hash)
values
  ('admin@example.mil', 'admin', null, crypt('Passw0rd!', gen_salt('bf'))),
  ('cmdr.alpha@example.mil', 'base_commander', (select id from bases where name='Alpha Base'), crypt('Passw0rd!', gen_salt('bf'))),
  ('log.alpha@example.mil', 'logistics_officer', (select id from bases where name='Alpha Base'), crypt('Passw0rd!', gen_salt('bf'))),
  ('cmdr.bravo@example.mil', 'base_commander', (select id from bases where name='Bravo Base'), crypt('Passw0rd!', gen_salt('bf'))),
  ('log.bravo@example.mil', 'logistics_officer', (select id from bases where name='Bravo Base'), crypt('Passw0rd!', gen_salt('bf')))
on conflict (email) do nothing;

-- Ensure inventory rows exist for all base/equipment combos
select ensure_inventory(b.id, e.id)
from bases b cross join equipment_types e;

do $$
declare
  alpha_base bigint := (select id from bases where name='Alpha Base');
  bravo_base bigint := (select id from bases where name='Bravo Base');
  rifle_m4 bigint := (select id from equipment_types where name='Rifle M4');
  truck_m35 bigint := (select id from equipment_types where name='Truck M35');
  ammo_556 bigint := (select id from equipment_types where name='5.56mm Rounds');
  mortar_81 bigint := (select id from equipment_types where name='Mortar Shell 81mm');
begin
  -- Purchases
  perform record_purchase(alpha_base, rifle_m4, 50, 1200, now());
  perform record_purchase(alpha_base, ammo_556, 10000, 0.5, now());
  perform record_purchase(bravo_base, truck_m35, 5, 45000, now());

  -- Transfers
  perform record_transfer(alpha_base, bravo_base, rifle_m4, 10, now());
  perform record_transfer(bravo_base, alpha_base, ammo_556, 2000, now());

  -- Assignments
  perform record_assignment(alpha_base, rifle_m4, 20, '1st Platoon', now());
  perform record_assignment(bravo_base, truck_m35, 2, 'Logistics Convoy B', now());

  -- Expenditures
  perform record_expenditure(alpha_base, ammo_556, 1500, now(), 'Live-fire training');
  perform record_expenditure(bravo_base, mortar_81, 40, now(), 'Range day');
end $$;


