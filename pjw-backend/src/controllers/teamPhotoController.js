const prisma = require('../db/db');

const isNullableString = (value) => value === null || value === undefined || typeof value === 'string';

const teamPhotoController = {
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
    }
};

module.exports = teamPhotoController;
