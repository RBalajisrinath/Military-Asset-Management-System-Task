import { Router } from 'express';
import { supabase } from '../supabase.js';
import { requireAnyRole, enforceBaseScope } from '../middleware/rbac.js';

const router = Router();

router.get('/dashboard/metrics', requireAnyRole(['admin', 'base_commander', 'logistics_officer']), enforceBaseScope, async (req, res) => {
  const { base_id, equipment_type_id, start_date, end_date } = req.query;
  if (!base_id) return res.status(400).json({ error: 'base_id required' });
  const { data, error } = await supabase.rpc('compute_metrics', {
    p_base_id: Number(base_id),
    p_equipment_type_id: equipment_type_id ? Number(equipment_type_id) : null,
    p_start: start_date ?? null,
    p_end: end_date ?? null
  });
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ data });
});

export default router;


