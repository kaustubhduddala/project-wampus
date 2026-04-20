const prisma = require('../db/db');
const {
  generateInviteToken,
  hashInviteToken,
  getInviteExpiryDate,
} = require('../utils/inviteToken');

const TOKEN_HEX_PATTERN = /^[0-9a-f]{64}$/i;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const LEGACY_UNUSED_INVITE_EMAIL = '';

const defaultFrontendUrl = 'http://localhost:5173';

function getFrontendBaseUrl() {
  const configured = String(process.env.FRONTEND_URL ?? '').trim();
  return configured || defaultFrontendUrl;
}

const inviteController = {
  createInvite: async (req, res) => {
    try {
      const rawInviteToken = generateInviteToken();
      const tokenHash = hashInviteToken(rawInviteToken);
      const expiresAt = getInviteExpiryDate();

      const invite = await prisma.invite_tokens.create({
        data: {
          created_by: req.user.id,
          // Kept as legacy metadata to satisfy current DB schema; not used in invite logic.
          email: LEGACY_UNUSED_INVITE_EMAIL,
          token_hash: tokenHash,
          expires_at: expiresAt,
        },
        select: {
          id: true,
          expires_at: true,
        },
      });

      const inviteUrl = `${getFrontendBaseUrl()}/join/${rawInviteToken}`;

      res.status(201).json({
        invite_url: inviteUrl,
        invite_id: invite.id,
        expires_at: invite.expires_at,
      });
    } catch (error) {
      console.error('Error creating invite:', error);
      res.status(500).json({ message: 'Failed to create invite token' });
    }
  },

  validateInviteToken: async (req, res) => {
    try {
      const token = String(req.params.token ?? '').trim();
      if (!token) {
        return res.status(200).json({ valid: false });
      }

      const isHexToken = TOKEN_HEX_PATTERN.test(token);
      const isLegacyUuidToken = UUID_PATTERN.test(token);
      if (!isHexToken && !isLegacyUuidToken) {
        return res.status(200).json({ valid: false });
      }

      let invite = null;

      if (isHexToken) {
        const tokenHash = hashInviteToken(token);
        invite = await prisma.invite_tokens.findFirst({
          where: { token_hash: tokenHash },
          select: {
            id: true,
            used_at: true,
            expires_at: true,
          },
        });
      }

      if (!invite && isLegacyUuidToken) {
        // Legacy support for pre-hash invite links that used UUID IDs directly.
        invite = await prisma.invite_tokens.findUnique({
          where: { id: token },
          select: {
            id: true,
            used_at: true,
            expires_at: true,
          },
        });
      }

      if (!invite) {
        return res.status(200).json({ valid: false });
      }

      const isUsed = invite.used_at != null;
      const isExpired = new Date(invite.expires_at) <= new Date();

      if (isUsed || isExpired) {
        return res.status(200).json({ valid: false });
      }

      res.status(200).json({ valid: true });
    } catch (error) {
      console.error('Error validating invite token:', error);
      res.status(200).json({ valid: false });
    }
  },

  getPendingInvites: async (_req, res) => {
    try {
      const now = new Date();
      const invites = await prisma.invite_tokens.findMany({
        where: {
          used_at: null,
          expires_at: {
            gt: now,
          },
        },
        orderBy: [{ created_at: 'desc' }],
        select: {
          id: true,
          created_at: true,
          created_by: true,
          expires_at: true,
          used_at: true,
          used_by: true,
        },
      });

      res.status(200).json(invites);
    } catch (error) {
      console.error('Error listing invites:', error);
      res.status(500).json({ message: 'Failed to retrieve pending invites' });
    }
  },

  revokeInvite: async (req, res) => {
    try {
      const token = String(req.params.token ?? '').trim();
      if (!UUID_PATTERN.test(token)) {
        return res.status(400).json({ message: 'Invalid invite token' });
      }

      const deleted = await prisma.invite_tokens.deleteMany({
        where: {
          id: token,
          used_at: null,
        },
      });

      if (deleted.count === 0) {
        return res.status(404).json({ message: 'Pending invite not found' });
      }

      res.status(200).json({ message: 'Invite revoked successfully' });
    } catch (error) {
      console.error('Error revoking invite:', error);
      res.status(500).json({ message: 'Failed to revoke invite' });
    }
  },
};

module.exports = {
  inviteController,
};
