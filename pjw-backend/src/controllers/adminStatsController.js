const prisma = require('../db/db');

const adminStatsController = {
    // Get current stats
    getAdminStats: async (req, res) => {
        try {
            const orgInfo = await prisma.org_info.findFirst();
            if (!orgInfo) return res.status(404).json({ message: "Org info not found" });

            res.status(200).json({
                active_volunteers: orgInfo.active_volunteers || 0,
                percent_growth: orgInfo.percent_growth || 0
            });
        } catch (error) {
            res.status(500).json({ message: "Internal server error" });
        }
    },

    // Update stats (Admin/Owner only)
    updateAdminStats: async (req, res) => {
        const { active_volunteers, percent_growth } = req.body;

        try {
            // role requirement enforced via middleware
            const existing = await prisma.org_info.findFirst();
            const updated = await prisma.org_info.update({
                where: { biography: existing.biography },
                data: {
                    active_volunteers: parseInt(active_volunteers),
                    percent_growth: parseFloat(percent_growth)
                }
            });

            res.status(200).json(updated);
        } catch (error) {
            res.status(500).json({ message: "Failed to update stats" });
        }
    }
};

module.exports = adminStatsController;