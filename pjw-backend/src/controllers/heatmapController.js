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

const parseFloatValue = (value) => {
    if (value === undefined || value === null || value === '') return { ok: false };
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return { ok: false };
    return { ok: true, value: parsed };
};

const parseBigIntValue = (value) => {
    if (value === undefined || value === null || value === '') return { ok: false };
    try {
        const parsed = BigInt(value);
        return { ok: true, value: parsed };
    } catch {
        return { ok: false };
    }
};

const heatmapController = {
    getAllHeatmapPoints: async (req, res) => {
        try {
            const points = await prisma.heatmap.findMany({
                orderBy: { created_at: 'desc' }
            });
            res.status(200).json(points);
        } catch (error) {
            console.error('Error fetching heatmap points:', error);
            res.status(500).json({ message: 'Failed to retrieve heatmap points' });
        }
    },

    getHeatmapPointById: async (req, res) => {
        try {
            const { id } = req.params;
            const heatmapId = parseBigIntId(id);

            if (heatmapId === null) return res.status(400).json({ message: 'Invalid heatmap id' });

            const point = await prisma.heatmap.findUnique({
                where: { id: heatmapId }
            });

            if (!point) return res.status(404).json({ message: 'Heatmap point not found' });

            res.status(200).json(point);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    createHeatmapPoint: async (req, res) => {
        try {
            const { latitude, longitude, intensity } = req.body;

            const lat = parseFloatValue(latitude);
            const lon = parseFloatValue(longitude);
            const intens = parseBigIntValue(intensity);

            if (!lat.ok || !lon.ok || !intens.ok) {
                return res.status(400).json({ message: 'Invalid latitude, longitude, or intensity' });
            }

            const newPoint = await prisma.heatmap.create({
                data: {
                    latitude: lat.value,
                    longitude: lon.value,
                    intensity: intens.value
                }
            });

            res.status(201).json(newPoint);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    updateHeatmapPoint: async (req, res) => {
        try {
            const { id } = req.params;
            const heatmapId = parseBigIntId(id);

            if (heatmapId === null) return res.status(400).json({ message: 'Invalid heatmap id' });

            const data = {};

            if (hasOwn(req.body, 'latitude')) {
                const lat = parseFloatValue(req.body.latitude);
                if (!lat.ok) return res.status(400).json({ message: 'Invalid latitude' });
                data.latitude = lat.value;
            }

            if (hasOwn(req.body, 'longitude')) {
                const lon = parseFloatValue(req.body.longitude);
                if (!lon.ok) return res.status(400).json({ message: 'Invalid longitude' });
                data.longitude = lon.value;
            }

            if (hasOwn(req.body, 'intensity')) {
                const intens = parseBigIntValue(req.body.intensity);
                if (!intens.ok) return res.status(400).json({ message: 'Invalid intensity' });
                data.intensity = intens.value;
            }

            if (Object.keys(data).length === 0) return res.status(400).json({ message: 'No valid fields provided for update' });

            const updated = await prisma.heatmap.update({
                where: { id: heatmapId },
                data
            });

            res.status(200).json(updated);
        } catch (error) {
            if (error.code === 'P2025') return res.status(404).json({ message: 'Heatmap point not found' });
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = heatmapController;
