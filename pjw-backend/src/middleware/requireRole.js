// middleware/requireRole.js
const prisma = require('../db/db');

const requireRole = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      // prefer role attached by requireAuth to avoid extra DB lookup
      const roleFromReq = req.user?.role;
      if (roleFromReq) {
        if (!allowedRoles.includes(roleFromReq)) return res.status(403).json({ message: 'Forbidden' });
        return next();
      }

      const requesterId = req.user?.id || req.headers['x-user-id'];
      if (!requesterId) return res.status(401).json({ message: 'Unauthorized' });

      const requesterRole = await prisma.user_roles.findUnique({ where: { user_id: requesterId } });
      if (!allowedRoles.includes(requesterRole?.role)) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      next();
    } catch (err) {
      console.error('Error in requireRole middleware:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
};

module.exports = requireRole;
