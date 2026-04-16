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

const parseAmount = (value) => {
    if (value === undefined || value === null || value === '') {
        return { ok: true, value: null };
    }

    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 0) {
        return { ok: false };
    }

    return { ok: true, value: parsed };
};

const parseDateValue = (value) => {
    if (value === undefined) {
        return { ok: true, isOmitted: true };
    }

    if (value === null || value === '') {
        return { ok: true, value: null };
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return { ok: false };
    }

    return { ok: true, value: parsed };
};

const sponsorsController = {
    getAllSponsors: async (req, res) => {
        try {
            const sponsors = await prisma.sponsors.findMany({
                orderBy: { sponsor_id: 'asc' }
            });

            res.status(200).json(sponsors);
        } catch (error) {
            console.error('Error fetching sponsors:', error);
            res.status(500).json({ message: 'Failed to retrieve sponsors' });
        }
    },

    getSponsorById: async (req, res) => {
        try {
            const { id } = req.params;
            const sponsorId = parseBigIntId(id);

            if (sponsorId === null) {
                return res.status(400).json({ message: 'Invalid sponsor id' });
            }

            const sponsor = await prisma.sponsors.findUnique({
                where: { sponsor_id: sponsorId }
            });

            if (!sponsor) {
                return res.status(404).json({ message: 'Sponsor not found' });
            }

            res.status(200).json(sponsor);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    createSponsor: async (req, res) => {
        try {
            const { sponsor_name, sponsor_description, amount, sponsor_picture, date_donated } = req.body;

            if (!sponsor_name || !sponsor_description) {
                return res.status(400).json({ message: 'sponsor_name and sponsor_description are required' });
            }
            if (sponsor_picture !== undefined && sponsor_picture !== null && typeof sponsor_picture !== 'string') {
                return res.status(400).json({ message: 'sponsor_picture must be a string or null' });
            }

            const parsedAmount = parseAmount(amount);
            if (!parsedAmount.ok) {
                return res.status(400).json({ message: 'amount must be a non-negative number' });
            }

            const parsedDate = parseDateValue(date_donated);
            if (!parsedDate.ok) {
                return res.status(400).json({ message: 'date_donated must be a valid date' });
            }

            const newSponsor = await prisma.sponsors.create({
                data: {
                    sponsor_name,
                    sponsor_description,
                    amount: parsedAmount.value,
                    sponsor_picture: sponsor_picture ?? null,
                    date_donated: parsedDate.isOmitted ? null : parsedDate.value
                }
            });

            res.status(201).json(newSponsor);
        } catch (error) {
            console.error('Error creating sponsor:', error);
            res.status(500).json({ message: 'Failed to create sponsor' });
        }
    },

    updateSponsor: async (req, res) => {
        try {
            const { id } = req.params;
            const sponsorId = parseBigIntId(id);

            if (sponsorId === null) {
                return res.status(400).json({ message: 'Invalid sponsor id' });
            }

            const { sponsor_name, sponsor_description, amount, sponsor_picture, date_donated } = req.body;
            const data = {};

            if (hasOwn(req.body, 'sponsor_name')) {
                data.sponsor_name = sponsor_name;
            }
            if (hasOwn(req.body, 'sponsor_description')) {
                data.sponsor_description = sponsor_description;
            }
            if (hasOwn(req.body, 'sponsor_picture')) {
                if (sponsor_picture !== null && typeof sponsor_picture !== 'string') {
                    return res.status(400).json({ message: 'sponsor_picture must be a string or null' });
                }
                data.sponsor_picture = sponsor_picture;
            }
            if (hasOwn(req.body, 'amount')) {
                const parsedAmount = parseAmount(amount);
                if (!parsedAmount.ok) {
                    return res.status(400).json({ message: 'amount must be a non-negative number' });
                }
                data.amount = parsedAmount.value;
            }
            if (hasOwn(req.body, 'date_donated')) {
                const parsedDate = parseDateValue(date_donated);
                if (!parsedDate.ok) {
                    return res.status(400).json({ message: 'date_donated must be a valid date' });
                }
                data.date_donated = parsedDate.value;
            }

            if (Object.keys(data).length === 0) {
                return res.status(400).json({ message: 'No valid fields provided for update' });
            }

            const updatedSponsor = await prisma.sponsors.update({
                where: { sponsor_id: sponsorId },
                data
            });

            res.status(200).json(updatedSponsor);
        } catch (error) {
            if (error.code === 'P2025') {
                return res.status(404).json({ message: 'Sponsor not found' });
            }
            res.status(500).json({ message: error.message });
        }
    },

    deleteSponsor: async (req, res) => {
        try {
            const { id } = req.params;
            const sponsorId = parseBigIntId(id);

            if (sponsorId === null) {
                return res.status(400).json({ message: 'Invalid sponsor id' });
            }

            await prisma.sponsors.delete({
                where: { sponsor_id: sponsorId }
            });

            res.status(200).json({ message: 'Sponsor deleted successfully' });
        } catch (error) {
            if (error.code === 'P2025') {
                return res.status(404).json({ message: 'Sponsor not found' });
            }
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = sponsorsController;
