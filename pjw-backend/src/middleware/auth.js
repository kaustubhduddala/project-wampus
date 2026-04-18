const supabase = require('../config/supabase');
const prisma = require('../db/db');

const requireAuth = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'No token provided' });

  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) return res.status(401).json({ error: 'Invalid token' });

  req.user = user;

  // load app role and attach to req.user to avoid duplicate DB lookups
  try {
    const roleRecord = await prisma.user_roles.findUnique({ where: { user_id: user.id } });
    req.user.role = roleRecord?.role ?? null;
  } catch (err) {
    console.error('Failed to load user role in requireAuth:', err);
    req.user.role = null;
  }

  next();
};

module.exports = requireAuth;