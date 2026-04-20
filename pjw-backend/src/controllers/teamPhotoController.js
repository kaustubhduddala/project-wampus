const prisma = require('../db/db');

const isNullableString = (value) => value === null || value === undefined || typeof value === 'string';

const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

const teamPhotoController = {
    getTeamPhoto: async (req, res) => {
        try {
            const photo = await prisma.team_photos.findFirst();
            if (!photo) {
                return res.status(404).json({ message: 'Team photo not found' });
            }
            res.status(200).json(photo);
        } catch (error) {
            console.error('Error fetching team photo:', error);
            res.status(500).json({ message: 'Failed to retrieve team photo' });
        }
    },

    createTeamPhoto: async (req, res) => {
        try {
            const { photo_url, caption, alt_text } = req.body;

            if (typeof photo_url !== 'string' || photo_url.trim().length === 0) {
                return res.status(400).json({ message: 'photo_url is required and must be a non-empty string' });
            }
            if (!isNullableString(caption)) {
                return res.status(400).json({ message: 'caption must be a string or null' });
            }
            if (!isNullableString(alt_text)) {
                return res.status(400).json({ message: 'alt_text must be a string or null' });
            }

            const existing = await prisma.team_photos.findFirst();
            if (existing) {
                return res.status(409).json({ message: 'Team photo already exists. Use update to modify it.' });
            }

            const createdTeamPhoto = await prisma.team_photos.create({
                data: {
                    photo_url: photo_url.trim(),
                    caption: caption ?? null,
                    alt_text: alt_text ?? null
                }
            });

            res.status(201).json(createdTeamPhoto);
        } catch (error) {
            console.error('Error creating team photo:', error);
            res.status(500).json({ message: 'Failed to create team photo' });
        }
    },

    updateTeamPhoto: async (req, res) => {
        try {
            const { photo_url, caption, alt_text } = req.body;
            const data = {};

            if (hasOwn(req.body, 'photo_url')) {
                if (typeof photo_url !== 'string' || photo_url.trim() === '') {
                    return res.status(400).json({ message: 'photo_url must be a non-empty string' });
                }
                data.photo_url = photo_url.trim();
            }
            if (hasOwn(req.body, 'caption')) {
                if (!isNullableString(caption)) {
                    return res.status(400).json({ message: 'caption must be a string or null' });
                }
                data.caption = caption ?? null;
            }
            if (hasOwn(req.body, 'alt_text')) {
                if (!isNullableString(alt_text)) {
                    return res.status(400).json({ message: 'alt_text must be a string or null' });
                }
                data.alt_text = alt_text ?? null;
            }

            if (Object.keys(data).length === 0) {
                return res.status(400).json({ message: 'No valid fields provided for update' });
            }

            const existing = await prisma.team_photos.findFirst();
            if (!existing) {
                return res.status(404).json({ message: 'Team photo not found' });
            }

            const updated = await prisma.team_photos.update({ where: { id: existing.id }, data });
            res.status(200).json(updated);
        } catch (error) {
            if (error && error.code === 'P2025') {
                return res.status(404).json({ message: 'Team photo not found' });
            }
            res.status(500).json({ message: error.message });
        }
    },

    deleteTeamPhoto: async (req, res) => {
        try {
            const existing = await prisma.team_photos.findFirst();
            if (!existing) {
                return res.status(404).json({ message: 'Team photo not found' });
            }

            await prisma.team_photos.delete({ where: { id: existing.id } });
            res.status(200).json({ message: 'Team photo deleted successfully' });
        } catch (error) {
            if (error && error.code === 'P2025') {
                return res.status(404).json({ message: 'Team photo not found' });
            }
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = teamPhotoController;
