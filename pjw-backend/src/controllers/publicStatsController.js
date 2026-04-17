const prisma = require('../db/db');

const toNumberOrZero = (value) => {
  if (value === null || value === undefined) return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const publicStatsController = {
  getHomeStats: async (_req, res) => {
    try {
      const [orgInfo, distinctVolunteers, deliveriesCount, sponsorsCount] = await Promise.all([
        prisma.org_info.findFirst(),
        prisma.volunteer_data.findMany({
          distinct: ['user_id'],
          select: {
            user_id: true,
          },
        }),
        prisma.delivery_logs.count(),
        prisma.sponsors.count(),
      ]);

      const fundraisingGoal = toNumberOrZero(process.env.FUNDRAISING_GOAL || 50000);

      res.status(200).json({
        money_raised: toNumberOrZero(orgInfo?.money_raised),
        meals_donated: toNumberOrZero(orgInfo?.meals_donated),
        active_volunteers: distinctVolunteers.length,
        delivery_count: deliveriesCount,
        sponsor_count: sponsorsCount,
        fundraising_goal: fundraisingGoal,
      });
    } catch (error) {
      console.error('Error fetching home stats:', error);
      res.status(500).json({ message: 'Failed to retrieve home stats' });
    }
  },
};

module.exports = publicStatsController;
