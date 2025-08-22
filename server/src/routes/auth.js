import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { signToken } from '../middleware/auth.js';
import { supabase } from '../supabase.js';

const router = Router();

// Dev helper to mint JWTs for local testing only
router.post('/dev-token', (req, res) => {
  const { user_id, role, base_id } = req.body || {};
  if (!user_id || !role) return res.status(400).json({ error: 'user_id and role required' });
  const token = signToken({ user_id, role, base_id: base_id ?? null });
  return res.json({ token });
});

export default router;

// Credentials auth
router.post('/register', async (req, res) => {
  const { email, password, role, base_id } = req.body || {};
  if (!email || !password || !role) return res.status(400).json({ error: 'email, password, role required' });
  const hash = await bcrypt.hash(password, 10);
  const { data, error } = await supabase
    .from('users')
    .insert({ email, role, base_id: base_id ?? null, password_hash: hash })
    .select('id, email, role, base_id')
    .single();
  if (error) return res.status(400).json({ error: error.message });
  return res.json({ user: data });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  const { data: user, error } = await supabase
    .from('users')
    .select('id, email, role, base_id, password_hash')
    .eq('email', email)
    .single();
  if (error || !user) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.password_hash || '');
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  const token = signToken({ user_id: user.id, role: user.role, base_id: user.base_id });
  return res.json({ token, user: { id: user.id, email: user.email, role: user.role, base_id: user.base_id } });
});


