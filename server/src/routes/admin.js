import { Router } from 'express';
import { supabase } from '../supabase.js';
import { requireAnyRole } from '../middleware/rbac.js';

const router = Router();

// Bases CRUD
router.get('/bases', requireAnyRole(['admin']), async (_req, res) => {
  const { data, error } = await supabase.from('bases').select('*').order('id');
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ data });
});

router.post('/bases', requireAnyRole(['admin']), async (req, res) => {
  const { name } = req.body || {};
  if (!name) return res.status(400).json({ error: 'name required' });
  const { data, error } = await supabase.from('bases').insert({ name }).select('*').single();
  if (error) return res.status(400).json({ error: error.message });
  return res.json({ data });
});

router.put('/bases/:id', requireAnyRole(['admin']), async (req, res) => {
  const id = Number(req.params.id);
  const { name } = req.body || {};
  const { data, error } = await supabase.from('bases').update({ name }).eq('id', id).select('*').single();
  if (error) return res.status(400).json({ error: error.message });
  return res.json({ data });
});

router.delete('/bases/:id', requireAnyRole(['admin']), async (req, res) => {
  const id = Number(req.params.id);
  const { error } = await supabase.from('bases').delete().eq('id', id);
  if (error) return res.status(400).json({ error: error.message });
  return res.json({ ok: true });
});

// Equipment Types CRUD
router.get('/equipment-types', requireAnyRole(['admin']), async (_req, res) => {
  const { data, error } = await supabase.from('equipment_types').select('*').order('id');
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ data });
});

router.post('/equipment-types', requireAnyRole(['admin']), async (req, res) => {
  const { name, category } = req.body || {};
  if (!name || !category) return res.status(400).json({ error: 'name and category required' });
  const { data, error } = await supabase.from('equipment_types').insert({ name, category }).select('*').single();
  if (error) return res.status(400).json({ error: error.message });
  return res.json({ data });
});

router.put('/equipment-types/:id', requireAnyRole(['admin']), async (req, res) => {
  const id = Number(req.params.id);
  const { name, category } = req.body || {};
  const { data, error } = await supabase.from('equipment_types').update({ name, category }).eq('id', id).select('*').single();
  if (error) return res.status(400).json({ error: error.message });
  return res.json({ data });
});

router.delete('/equipment-types/:id', requireAnyRole(['admin']), async (req, res) => {
  const id = Number(req.params.id);
  const { error } = await supabase.from('equipment_types').delete().eq('id', id);
  if (error) return res.status(400).json({ error: error.message });
  return res.json({ ok: true });
});

export default router;


