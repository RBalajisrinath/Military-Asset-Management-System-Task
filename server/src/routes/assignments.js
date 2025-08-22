import { Router } from 'express';
import { supabase } from '../supabase.js';
import { requireAnyRole, enforceBaseScope } from '../middleware/rbac.js';

const router = Router();

router.post('/assignments', requireAnyRole(['admin', 'base_commander']), enforceBaseScope, async (req, res) => {
  const { base_id, equipment_type_id, quantity, assigned_to, assigned_at } = req.body || {};
  if (!base_id || !equipment_type_id || !quantity || !assigned_to) return res.status(400).json({ error: 'Missing fields' });
  const when = assigned_at ?? new Date().toISOString();
  const { data, error } = await supabase.rpc('record_assignment', {
    p_base_id: base_id,
    p_equipment_type_id: equipment_type_id,
    p_quantity: quantity,
    p_assigned_to: assigned_to,
    p_when: when
  });
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ ok: true, data });
});

router.post('/expenditures', requireAnyRole(['admin', 'base_commander']), enforceBaseScope, async (req, res) => {
  const { base_id, equipment_type_id, quantity, expended_at, notes } = req.body || {};
  if (!base_id || !equipment_type_id || !quantity) return res.status(400).json({ error: 'Missing fields' });
  const when = expended_at ?? new Date().toISOString();
  const { data, error } = await supabase.rpc('record_expenditure', {
    p_base_id: base_id,
    p_equipment_type_id: equipment_type_id,
    p_quantity: quantity,
    p_when: when,
    p_notes: notes ?? null
  });
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ ok: true, data });
});

router.get('/assignments', requireAnyRole(['admin', 'base_commander']), enforceBaseScope, async (req, res) => {
  const { base_id, equipment_type_id, start_date, end_date } = req.query;
  let query = supabase.from('assignments').select('*').order('assigned_at', { ascending: false });
  if (base_id) query = query.eq('base_id', Number(base_id));
  if (equipment_type_id) query = query.eq('equipment_type_id', Number(equipment_type_id));
  if (start_date) query = query.gte('assigned_at', start_date);
  if (end_date) query = query.lte('assigned_at', end_date);
  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ data });
});

export default router;


