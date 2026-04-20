const supabase = require('../config/supabase');
const prisma = require('../db/db');

const MEMBER_ROLES = new Set(['USER', 'ADMIN', 'OWNER']);
const ADMIN_ROLES = new Set(['ADMIN', 'OWNER']);

function extractBearerToken(authorizationHeader) {
  if (typeof authorizationHeader !== 'string') {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(' ');
  if (!scheme || !token || scheme.toLowerCase() !== 'bearer') {
    return null;
  }

  const trimmedToken = token.trim();
  return trimmedToken || null;
}

async function resolveMemberFromToken(token) {
  if (!token) {
    return { ok: false, status: 401, payload: { error: 'No token provided' } };
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    return { ok: false, status: 401, payload: { error: 'Invalid token' } };
  }

  const userRole = await prisma.user_roles.findUnique({
    where: { user_id: user.id },
    select: { role: true },
  });

  if (!userRole || !MEMBER_ROLES.has(String(userRole.role))) {
    return { ok: false, status: 403, payload: { error: 'Not a member' } };
  }

  return {
    ok: true,
    user: {
      id: user.id,
      role: String(userRole.role),
      email: user.email ?? null,
    },
  };
}

async function resolveMemberFromRequest(req) {
  const token = extractBearerToken(req.headers.authorization);
  return resolveMemberFromToken(token);
}

async function verifyMember(req, res, next) {
  try {
    const resolved = await resolveMemberFromRequest(req);
    if (!resolved.ok) {
      return res.status(resolved.status).json(resolved.payload);
    }

    req.user = resolved.user;
    next();
  } catch (error) {
    console.error('verifyMember error:', error);
    res.status(500).json({ error: 'Authentication check failed' });
  }
}

async function verifyAdmin(req, res, next) {
  try {
    const resolved = await resolveMemberFromRequest(req);
    if (!resolved.ok) {
      return res.status(resolved.status).json(resolved.payload);
    }

    if (!ADMIN_ROLES.has(resolved.user.role)) {
      return res.status(403).json({ error: 'Admin or owner role required' });
    }

    req.user = resolved.user;
    next();
  } catch (error) {
    console.error('verifyAdmin error:', error);
    res.status(500).json({ error: 'Authentication check failed' });
  }
}

module.exports = {
  verifyMember,
  verifyAdmin,
  resolveMemberFromRequest,
  resolveMemberFromToken,
  extractBearerToken,
  // Backward-compatible alias for existing protected routes.
  requireAuth: verifyMember,
};