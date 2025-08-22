import { supabase } from '../supabase.js';

export async function auditMiddleware(req, _res, next) {
  // Fire and forget audit logging
  const { method, originalUrl, body } = req;
  const user = req.user || {};
  const payload = {
    actor_id: user.user_id || null,
    actor_role: user.role || null,
    path: originalUrl,
    method,
    payload: body || null
  };
  // Do not block request on audit errors
  try {
    await supabase.from('audit_logs').insert(payload);
  } catch (_e) {}
  next();
}


