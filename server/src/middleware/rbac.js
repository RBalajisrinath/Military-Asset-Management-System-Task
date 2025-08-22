export function requireAnyRole(roles) {
  return function(req, res, next) {
    const role = req.user?.role;
    if (!role) return res.status(403).json({ error: 'Forbidden' });
    if (roles.includes('admin') && role === 'admin') return next();
    if (roles.includes(role)) return next();
    return res.status(403).json({ error: 'Insufficient role' });
  };
}

export function enforceBaseScope(req, res, next) {
  const role = req.user?.role;
  if (role === 'admin') return next();
  const userBaseId = req.user?.base_id;
  const targetBaseId =
    Number(req.body?.base_id ?? req.query?.base_id ?? req.body?.from_base_id ?? req.body?.to_base_id);
  if (!userBaseId) return res.status(403).json({ error: 'No base assigned' });
  if (!Number.isFinite(targetBaseId)) return next();
  // For transfers, allow if either side is user's base
  if (req.body?.from_base_id && req.body?.to_base_id) {
    if (Number(req.body.from_base_id) === userBaseId || Number(req.body.to_base_id) === userBaseId) return next();
    return res.status(403).json({ error: 'Transfer not in your base scope' });
  }
  if (Number(targetBaseId) !== Number(userBaseId)) {
    return res.status(403).json({ error: 'Out of base scope' });
  }
  return next();
}


