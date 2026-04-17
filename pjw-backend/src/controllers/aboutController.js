const prisma = require('../db/db');

const parseBigIntId = (id) => {
    try {
        const parsedId = BigInt(id);
        return parsedId > 0n ? parsedId : null;
    } catch {
        return null;
    }
};

const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

const parseDateStarted = (value) => {
    if (value === null) {
        return { ok: true, value: null };
    }
    if (typeof value !== 'string') {
        return { ok: false };
    }

    const trimmed = value.trim();
    if (trimmed.length === 0) {
        return { ok: false };
    }

    const parsed = new Date(trimmed);
    if (Number.isNaN(parsed.getTime())) {
        return { ok: false };
    }

    return { ok: true, value: parsed };
};

const parseDisplayOrder = (value) => {
    if (value === undefined) {
        return { ok: true, isOmitted: true };
    }

    const parsed = Number(value);
    if (!Number.isInteger(parsed)) {
        return { ok: false };
    }

    return { ok: true, value: parsed };
};

const isValidNullableString = (value) =>
    value === null || value === undefined || typeof value === 'string';

const aboutController = {
    getDateStarted: async (req, res) => {
        try {
            const orgInfo = await prisma.org_info.findFirst({
                select: { date_started: true }
            });

            if (!orgInfo) {
                return res.status(404).json({ message: 'org_info not found' });
            }

            res.status(200).json(orgInfo.date_started);
        } catch (error) {
            console.error('Error fetching date started:', error);
            res.status(500).json({ message: 'Failed to retrieve date started' });
        }
    },

    patchDateStarted: async (req, res) => {
        try {
            if (!hasOwn(req.body, 'dateStarted')) {
                return res.status(400).json({ message: 'dateStarted is required' });
            }

            const parsedDate = parseDateStarted(req.body.dateStarted);
            if (!parsedDate.ok) {
                return res.status(400).json({ message: 'dateStarted must be a valid date string or null' });
            }

            await prisma.org_info.update({
                where: { id: 1 },
                data: {
                    date_started: parsedDate.value
                }
            });

            res.status(200).json({ updated: true });
        } catch (error) {
            if (error.code === 'P2025') {
                return res.status(404).json({ message: 'org_info not found' });
            }
            res.status(500).json({ message: error.message });
        }
    },

    getAllExecEntries: async (req, res) => {
        try {
            const entries = await prisma.executive_team_entries.findMany({
                orderBy: [
                    { display_order: 'asc' },
                    { id: 'asc' }
                ]
            });

            res.status(200).json(entries);
        } catch (error) {
            console.error('Error fetching executive team entries:', error);
            res.status(500).json({ message: 'Failed to retrieve executive team entries' });
        }
    },

    getExecEntryById: async (req, res) => {
        try {
            const entryId = parseBigIntId(req.params.id);
            if (entryId === null) {
                return res.status(400).json({ message: 'Invalid executive entry id' });
            }

            const entry = await prisma.executive_team_entries.findUnique({
                where: { id: entryId }
            });

            if (!entry) {
                return res.status(404).json({ message: 'Executive team entry not found' });
            }

            res.status(200).json(entry);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    createExecEntry: async (req, res) => {
        try {
            const { name, title, bio, photo_url, display_order } = req.body;

            if (!name || !title || !bio) {
                return res.status(400).json({ message: 'name, title, and bio are required' });
            }
            if (typeof name !== 'string' || typeof title !== 'string' || typeof bio !== 'string') {
                return res.status(400).json({ message: 'name, title, and bio must be strings' });
            }
            if (!isValidNullableString(photo_url)) {
                return res.status(400).json({ message: 'photo_url must be a string or null' });
            }

            const parsedDisplayOrder = parseDisplayOrder(display_order);
            if (!parsedDisplayOrder.ok) {
                return res.status(400).json({ message: 'display_order must be an integer' });
            }

            const newEntry = await prisma.executive_team_entries.create({
                data: {
                    name: name.trim(),
                    title: title.trim(),
                    bio: bio.trim(),
                    photo_url: photo_url ?? null,
                    display_order: parsedDisplayOrder.isOmitted ? 0 : parsedDisplayOrder.value
                }
            });

            res.status(201).json(newEntry);
        } catch (error) {
            console.error('Error creating executive team entry:', error);
            res.status(500).json({ message: 'Failed to create executive team entry' });
        }
    },

    updateExecEntry: async (req, res) => {
        try {
            const entryId = parseBigIntId(req.params.id);
            if (entryId === null) {
                return res.status(400).json({ message: 'Invalid executive entry id' });
            }

            const { name, title, bio, photo_url, display_order } = req.body;
            const data = {};

            if (hasOwn(req.body, 'name')) {
                if (typeof name !== 'string') {
                    return res.status(400).json({ message: 'name must be a string' });
                }
                data.name = name.trim();
            }
            if (hasOwn(req.body, 'title')) {
                if (typeof title !== 'string') {
                    return res.status(400).json({ message: 'title must be a string' });
                }
                data.title = title.trim();
            }
            if (hasOwn(req.body, 'bio')) {
                if (typeof bio !== 'string') {
                    return res.status(400).json({ message: 'bio must be a string' });
                }
                data.bio = bio.trim();
            }
            if (hasOwn(req.body, 'photo_url')) {
                if (!isValidNullableString(photo_url)) {
                    return res.status(400).json({ message: 'photo_url must be a string or null' });
                }
                data.photo_url = photo_url;
            }
            if (hasOwn(req.body, 'display_order')) {
                const parsedDisplayOrder = parseDisplayOrder(display_order);
                if (!parsedDisplayOrder.ok || parsedDisplayOrder.isOmitted) {
                    return res.status(400).json({ message: 'display_order must be an integer' });
                }
                data.display_order = parsedDisplayOrder.value;
            }

            if (Object.keys(data).length === 0) {
                return res.status(400).json({ message: 'No valid fields provided for update' });
            }

            data.updated_at = new Date();

            const updatedEntry = await prisma.executive_team_entries.update({
                where: { id: entryId },
                data
            });

            res.status(200).json(updatedEntry);
        } catch (error) {
            if (error.code === 'P2025') {
                return res.status(404).json({ message: 'Executive team entry not found' });
            }
            res.status(500).json({ message: error.message });
        }
    },

    deleteExecEntry: async (req, res) => {
        try {
            const entryId = parseBigIntId(req.params.id);
            if (entryId === null) {
                return res.status(400).json({ message: 'Invalid executive entry id' });
            }

            await prisma.executive_team_entries.delete({
                where: { id: entryId }
            });

            res.status(200).json({ message: 'Executive team entry deleted successfully' });
        } catch (error) {
            if (error.code === 'P2025') {
                return res.status(404).json({ message: 'Executive team entry not found' });
            }
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = aboutController;
