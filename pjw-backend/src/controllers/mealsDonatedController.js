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
                throw Error("Key not found: mealsDonated")
            }

            if (update.mealsDonated < 0 || 
                !(typeof update.mealsDonated === 'number') ||
                !Number.isFinite(update.mealsDonated)) {
                throw Error("Value is not valid. Expected a finite positive number");
            }

            const existingOrgInfo = await prisma.org_info.findFirst();
            if (!existingOrgInfo) {
                return res.status(404).json({ message: "item not found" });
            }
            const org_info = await prisma.org_info.update({
                where: { id: existingOrgInfo.id },
                data: {
                    meals_donated: update.mealsDonated
                }
            });

            if (!org_info) {
                return res.status(404).json({ message: "item not found" });
            }
            res.status(200).json({"updated": true});
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = mealsDonatedController;