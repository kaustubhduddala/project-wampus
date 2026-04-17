const prisma = require('../db/db');

const mealsDonatedController = {

    getTotalMealsDonated: async (req, res) => {
        try {
            const org_info = await prisma.org_info.findFirst();
            if (!org_info) {
                return res.status(404).json({ message: "item not found" });
            }
            res.status(200).json(org_info.meals_donated);
        } catch (error) {
            console.error("Error fetching meals donated:", error);
            res.status(500).json({ message: "Failed to retrieve meals donated" });
        }
    },

    patchMealsDonated: async (req, res) => {
        try {
            const update = req.body;

            if (update.mealsDonated == undefined) {
                return res.status(400).json({ message: "Key not found: mealsDonated" });
            }

            if (typeof update.mealsDonated !== 'number' || !Number.isFinite(update.mealsDonated) || update.mealsDonated < 0) {
                return res.status(422).json({ message: "Value is not valid. Expected a finite non-negative number" });
            }

            const existingOrgInfo = await prisma.org_info.findFirst();
            if (!existingOrgInfo) {
                return res.status(404).json({ message: "item not found" });
            }
            await prisma.org_info.update({
                where: { id: existingOrgInfo.id },
                data: {
                    meals_donated: update.mealsDonated
                }
            });

            res.status(200).json({"updated": true});
        } catch (error) {
            if (error && error.code === 'P2025') {
                return res.status(404).json({ message: "item not found" });
            }
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = mealsDonatedController;