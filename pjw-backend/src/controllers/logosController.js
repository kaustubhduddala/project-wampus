const prisma = require('../db/db');

const isUuid = (value) =>
    typeof value === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

const logosController = {
    getAllLogos: async (req, res) => {
        try {
            const logos = await prisma.oauth_clients.findMany({
                where: { deleted_at: null },
                select: {
                    id: true,
                    client_name: true,
                    logo_uri: true,
                    created_at: true,
                    updated_at: true
                },
                orderBy: { created_at: 'desc' }
            });

            res.status(200).json(logos);
        } catch (error) {
            console.error('Error fetching logos:', error);
            res.status(500).json({ message: 'Failed to retrieve logos' });
        }
    },

    getLogoByClientId: async (req, res) => {
        try {
            const { id } = req.params;
            if (!isUuid(id)) {
                return res.status(400).json({ message: 'Invalid client id format' });
            }

            const logoRecord = await prisma.oauth_clients.findUnique({
                where: { id },
                select: {
                    id: true,
                    client_name: true,
                    logo_uri: true,
                    created_at: true,
                    updated_at: true,
                    deleted_at: true
                }
            });

            if (!logoRecord || logoRecord.deleted_at) {
                return res.status(404).json({ message: 'Logo record not found' });
            }

            res.status(200).json(logoRecord);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    updateLogoByClientId: async (req, res) => {
        try {
            const { id } = req.params;
            if (!isUuid(id)) {
                return res.status(400).json({ message: 'Invalid client id format' });
            }
            if (!Object.prototype.hasOwnProperty.call(req.body, 'logo_uri')) {
                return res.status(400).json({ message: 'logo_uri is required' });
            }

            const { logo_uri } = req.body;
            if (logo_uri !== null && typeof logo_uri !== 'string') {
                return res.status(400).json({ message: 'logo_uri must be a string or null' });
            }

            const existingClient = await prisma.oauth_clients.findUnique({
                where: { id },
                select: {
                    id: true,
                    deleted_at: true
                }
            });

            if (!existingClient || existingClient.deleted_at) {
                return res.status(404).json({ message: 'Logo record not found' });
            }

            const updatedLogo = await prisma.oauth_clients.update({
                where: { id },
                data: {
                    logo_uri,
                    updated_at: new Date()
                },
                select: {
                    id: true,
                    client_name: true,
                    logo_uri: true,
                    updated_at: true
                }
            });

            res.status(200).json(updatedLogo);
        } catch (error) {
            if (error.code === 'P2025') {
                return res.status(404).json({ message: 'Logo record not found' });
            }
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = logosController;
