const supabase = require('../config/supabase');
const prisma = require('../db/db');
const { resolveMemberFromRequest } = require('../middleware/auth');
const { hashInviteToken } = require('../utils/inviteToken');

const ADMIN_PERMISSION_CODE = process.env.ADMIN_CODE;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INVITE_HEX_PATTERN = /^[0-9a-f]{64}$/i;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const normalizeEmail = (value) => String(value ?? '').trim().toLowerCase();

const authController = {

    getMe: async (req, res) => {
        try {
            const resolved = await resolveMemberFromRequest(req);
            if (!resolved.ok) {
                return res.status(resolved.status).json(resolved.payload);
            }

            const isAdmin = resolved.user.role === 'ADMIN' || resolved.user.role === 'OWNER';

            return res.status(200).json({
                user: {
                    id: resolved.user.id,
                    email: resolved.user.email,
                },
                role: resolved.user.role,
                access_level: isAdmin ? 'admin' : 'member',
            });
        } catch (err) {
            console.error('GetMe Error:', err);
            return res.status(500).json({ message: 'Internal Server Error during auth check' });
        }
    },

    signUp: async (req, res) => {
        const { password, adminPermissionCode, invite_token } = req.body;
        const email = normalizeEmail(req.body.email);

        try {
            if (!EMAIL_PATTERN.test(email)) {
                return res.status(400).json({ error: 'Valid email is required' });
            }
            if (typeof password !== 'string' || !password) {
                return res.status(400).json({ error: 'password is required' });
            }

            let intendedRole = 'USER';
            let inviteTokenId = null;
            let inviteTokenHash = null;
            let legacyInviteMode = false;

            if (adminPermissionCode) {
                if (adminPermissionCode === ADMIN_PERMISSION_CODE) {
                    intendedRole = 'ADMIN';
                } else {
                    return res.status(400).json({ error: 'Invalid Admin Permission Code' });
                }
            } else {
                if (typeof invite_token !== 'string' || !invite_token.trim()) {
                    return res.status(400).json({ error: 'invite_token is required for member signup' });
                }

                const rawInviteToken = invite_token.trim();

                const isHexToken = INVITE_HEX_PATTERN.test(rawInviteToken);
                const isLegacyUuidToken = UUID_PATTERN.test(rawInviteToken);
                if (!isHexToken && !isLegacyUuidToken) {
                    return res.status(400).json({ error: 'Invalid invite token' });
                }

                if (isHexToken) {
                    inviteTokenHash = hashInviteToken(rawInviteToken);
                }

                let invite = null;
                if (isHexToken) {
                    invite = await prisma.invite_tokens.findFirst({
                        where: { token_hash: inviteTokenHash },
                        select: {
                            id: true,
                            used_at: true,
                            expires_at: true,
                        },
                    });
                }

                if (!invite && isLegacyUuidToken) {
                    // Legacy support for pre-hash invite links that used UUID IDs directly.
                    legacyInviteMode = true;
                    invite = await prisma.invite_tokens.findUnique({
                        where: { id: rawInviteToken },
                        select: {
                            id: true,
                            used_at: true,
                            expires_at: true,
                        },
                    });
                }

                if (!invite) {
                    return res.status(400).json({ error: 'Invalid invite token' });
                }
                if (invite.used_at) {
                    return res.status(400).json({ error: 'Invite token has already been used' });
                }
                if (new Date(invite.expires_at) <= new Date()) {
                    return res.status(400).json({ error: 'Invite token has expired' });
                }

                inviteTokenId = invite.id;
            }

            const { data, error } = await supabase.auth.admin.createUser({
                email,
                password,
                email_confirm: true,
                user_metadata: { role: intendedRole } 
            });

            if (error) {
                return res.status(400).json({ error: error.message });
            }

            if (!data?.user?.id) {
                return res.status(500).json({ message: 'Signup completed without a user id' });
            }

            const createdUserId = data.user.id;

            if (intendedRole === 'ADMIN') {
                await prisma.user_roles.upsert({
                    where: { user_id: createdUserId },
                    update: { role: 'ADMIN' },
                    create: {
                        user_id: createdUserId,
                        role: 'ADMIN',
                    },
                });
            } else {
                const tokenConsumeResult = await prisma.invite_tokens.updateMany({
                    where: {
                        ...(legacyInviteMode
                            ? { id: inviteTokenId }
                            : { token_hash: inviteTokenHash }),
                        used_at: null,
                        expires_at: {
                            gt: new Date(),
                        },
                    },
                    data: {
                        used_at: new Date(),
                        used_by: createdUserId,
                    },
                });

                if (tokenConsumeResult.count === 0) {
                    await supabase.auth.admin.deleteUser(createdUserId).catch((cleanupError) => {
                        console.error('Failed to rollback user creation after invite token conflict:', cleanupError);
                    });
                    return res.status(400).json({ error: 'Invite token is no longer valid' });
                }

                await prisma.user_roles.upsert({
                    where: { user_id: createdUserId },
                    update: { role: 'USER' },
                    create: {
                        user_id: createdUserId,
                        role: 'USER',
                    },
                });
            }

            res.status(201).json({ 
                message: "User created successfully", 
                user: data.user, 
                role: intendedRole 
            });

        } catch (err) {
            console.error("SignUp Error:", err);
            res.status(500).json({ message: "Internal Server Error during signup" });
        }
    },

    signIn: async (req, res) => {
        const { password } = req.body;
        const email = normalizeEmail(req.body.email);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                return res.status(401).json({ error: error.message });
            }

            const userRole = await prisma.user_roles.findUnique({
                where: { user_id: data.user.id }
            });

            res.status(200).json({ 
                message: "Login successful",
                token: data.session.access_token, 
                user: data.user,
                role: userRole?.role || 'USER'
            });

        } catch (err) {
            console.error("SignIn Error:", err);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }
};

module.exports = authController;