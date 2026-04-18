const prisma = require('../db/db');

const fundraisingController = {

    // get current amount
    getMoneyRaised: async (req, res) => {
        try {
            const orgInfo = await prisma.org_info.findFirst();

            if (!orgInfo) {
                return res.status(404).json({ message: "Organization info not found." });
            }

            res.status(200).json({
                money_raised: orgInfo.money_raised || 0
            });

        } catch (error) {
            console.error("Error fetching money raised:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    // update amount
    updateMoneyRaised: async (req, res) => {
        const { money_raised } = req.body;
        try {
            // role requirement enforced via middleware

            const existingOrgInfo = await prisma.org_info.findFirst();

            if (!existingOrgInfo) {
                return res.status(404).json({ 
                    message: "No Organization Info record found to update." 
                });
            }

            // update it
            const updatedInfo = await prisma.org_info.update({
                where: { 
                    biography: existingOrgInfo.biography 
                },
                data: { 
                    money_raised: parseFloat(money_raised) 
                }
            });

            res.status(200).json({ 
                message: "Fundraising amount updated", 
                money_raised: updatedInfo.money_raised 
            });

        } catch (error) {
            console.error("Error updating money raised:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
};

module.exports = fundraisingController;