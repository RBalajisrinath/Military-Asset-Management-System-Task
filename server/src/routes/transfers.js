import { Router } from 'express';
import { supabase } from '../supabase.js';
import { requireAnyRole, enforceBaseScope } from '../middleware/rbac.js';

const router = Router();

router.post('/transfers', requireAnyRole(['admin', 'base_commander', 'logistics_officer']), enforceBaseScope, async (req, res) => {
  const { from_base_id, to_base_id, equipment_type_id, quantity, transferred_at } = req.body || {};
  if (!from_base_id || !to_base_id || !equipment_type_id || !quantity) return res.status(400).json({ error: 'Missing fields' });
  const when = transferred_at ?? new Date().toISOString();
  const { data, error } = await supabase.rpc('record_transfer', {
    p_from_base_id: from_base_id,
    p_to_base_id: to_base_id,
    p_equipment_type_id: equipment_type_id,
    p_quantity: quantity,
    p_when: when
  });
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ ok: true, data });
});

router.get('/transfers', requireAnyRole(['admin', 'base_commander', 'logistics_officer']), enforceBaseScope, async (req, res) => {
  const { base_id, equipment_type_id, start_date, end_date } = req.query;
  let query = supabase.from('transfers').select('*').order('transferred_at', { ascending: false });
  if (base_id) query = query.or(`from_base_id.eq.${Number(base_id)},to_base_id.eq.${Number(base_id)}`);
  if (equipment_type_id) query = query.eq('equipment_type_id', Number(equipment_type_id));
  if (start_date) query = query.gte('transferred_at', start_date);
  if (end_date) query = query.lte('transferred_at', end_date);
  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ data });
});

export default router;


