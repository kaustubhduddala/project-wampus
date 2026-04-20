const prisma = require('../db/db');

const parseBigIntId = (id) => {
    try {
        const parsed = BigInt(id);
        return parsed > 0n ? parsed : null;
    } catch {
        return null;
    }
};

const ordersController = {

    getAllOrders: async (req, res) => {
        try {
            const orders = await prisma.orders.findMany();
            
            res.status(200).json(orders);
        } catch (error) {
            console.error("Error fetching orders:", error);
            res.status(500).json({ message: "Failed to retrieve orders" });
        }
    },

    getOrderById: async (req, res) => {
        try {
            const { id } = req.params;
            const parsedId = parseBigIntId(id);

            if (parsedId === null) {
                return res.status(400).json({ message: "Invalid order id" });
            }

            const order = await prisma.orders.findUnique({
                where: { id: parsedId } 
            });

            if (!order) {
                return res.status(404).json({ message: "Order not found" });
            }
            res.status(200).json(order);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = ordersController;