const prisma = require('../db/db');

const storeItemsController = {

    getAllItems: async (req, res) => {
        try {
            const store_items = await prisma.store_items.findMany();
            
            res.status(200).json(store_items);
        } catch (error) {
            console.error("Error fetching store items:", error);
            res.status(500).json({ message: "Failed to retrieve store items" });
        }
    },

    getItemById: async (req, res) => {
        try {
            const { id } = req.params;
            const store_item = await prisma.store_items.findUnique({
                where: { item_id: id } 
            });

            if (!store_item) {
                return res.status(404).json({ message: "store item not found" });
            }
            res.status(200).json(store_item);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = storeItemsController;