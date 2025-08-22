insert into bases(name) values
  ('Alpha Base'),
  ('Bravo Base'),
  ('Charlie Base')
on conflict do nothing;

insert into equipment_types(name, category) values
  ('Rifle M4', 'weapon'),
  ('Truck M35', 'vehicle'),
  ('5.56mm Rounds', 'ammunition')
on conflict do nothing;

-- Example users (for reference; auth handled in server for dev)
insert into users(email, role, base_id) values
  ('admin@example.mil','admin', null),
  ('cmdr.alpha@example.mil','base_commander', (select id from bases where name='Alpha Base')),
  ('log.alpha@example.mil','logistics_officer', (select id from bases where name='Alpha Base'))
on conflict do nothing;

-- Ensure inventory rows exist for common combos
select ensure_inventory(b.id, e.id)
from bases b cross join equipment_types e;


