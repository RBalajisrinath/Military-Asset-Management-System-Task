import { Router } from 'express';
import { supabase } from '../supabase.js';
import { requireAnyRole, enforceBaseScope } from '../middleware/rbac.js';

const router = Router();

router.post('/purchases', requireAnyRole(['admin', 'base_commander', 'logistics_officer']), enforceBaseScope, async (req, res) => {
  const { base_id, equipment_type_id, quantity, unit_cost, purchased_at } = req.body || {};
  if (!base_id || !equipment_type_id || !quantity) return res.status(400).json({ error: 'Missing fields' });
  const when = purchased_at ?? new Date().toISOString();
  const { data, error } = await supabase.rpc('record_purchase', {
    p_base_id: base_id,
    p_equipment_type_id: equipment_type_id,
    p_quantity: quantity,
    p_unit_cost: unit_cost ?? null,
    p_when: when
  });
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ ok: true, data });
});

router.get('/purchases', requireAnyRole(['admin', 'base_commander', 'logistics_officer']), enforceBaseScope, async (req, res) => {
  const { base_id, equipment_type_id, start_date, end_date } = req.query;
  let query = supabase.from('purchases').select('*').order('purchased_at', { ascending: false });
  if (base_id) query = query.eq('base_id', Number(base_id));
  if (equipment_type_id) query = query.eq('equipment_type_id', Number(equipment_type_id));
  if (start_date) query = query.gte('purchased_at', start_date);
  if (end_date) query = query.lte('purchased_at', end_date);
  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ data });
});

export default router;


