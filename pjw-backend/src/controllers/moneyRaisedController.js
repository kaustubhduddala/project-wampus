const prisma = require('../db/db');

const moneyRaisedController = {

    getTotalMoneyRaised: async (req, res) => {
        try {
            // org_info has just one row, so we grab 'all' the rows
            // and query the first in the list
            const org_info = await prisma.org_info.findFirst();
            
            res.status(200).json(org_info.money_raised);
        } catch (error) {
            console.error("Error fetching money raised:", error);
            res.status(500).json({ message: "Failed to retrieve money raised" });
        }
    },

    patchMoneyRaised: async (req, res) => {
        try {
            const update = req.body;

            if (update.moneyRaised == undefined) {
                throw Error("Key not found: moneyRaised")
            }

            if (update.moneyRaised < 0 || 
                !(typeof update.moneyRaised === 'number') ||
                !Number.isFinite(update.moneyRaised)) {
                throw Error("Value is not valid. Expected a finite positive number");
            }

            const org_info = await prisma.org_info.update({
                where: { id: 1 },
                data: {
                    money_raised: update.moneyRaised
                }
            });
            
            res.status(200).json({"updated": true});
        } catch (error) {
            // P2025 is the Prisma code for "Record to update not found"
            if (error.code === 'P2025') {
                return res.status(404).json({ message: "Item not found" });
            }
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = moneyRaisedController;