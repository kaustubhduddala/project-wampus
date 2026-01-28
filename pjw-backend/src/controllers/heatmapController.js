const prisma = require("../db/db");

const heatmapController = {
  getAllPoints: async (req, res) => {
    try {
      const points = await prisma.heatmap.findMany({
        select: {
          latitude: true,
          longitude: true,
        },
      });

      res.status(200).json(points);
    } catch (error) {
      console.error("Error fetching heatmap points:", error);
      res.status(500).json({ message: "Failed to retrieve heatmap points" });
    }
  },
};

module.exports = heatmapController;
