const prisma = require('../db/db');

const volunteersController = {
  getVolunteerEntries: async (_req, res) => {
    try {
      const entries = await prisma.volunteer_data.findMany({
        orderBy: { id: 'desc' },
        include: {
          users: {
            select: {
              email: true,
            },
          },
        },
      });

      const response = entries.map((entry) => ({
        id: entry.id,
        user_id: entry.user_id,
        volunteer_email: entry.users?.email ?? null,
        total_hours: entry.total_hours,
        clock_in: entry.clock_in,
        clock_out: entry.clock_out,
      }));

      res.status(200).json(response);
    } catch (error) {
      console.error('Error fetching volunteers:', error);
      res.status(500).json({ message: 'Failed to retrieve volunteer entries' });
    }
  },

  getVolunteerSummary: async (_req, res) => {
    try {
      const [entries, distinctVolunteers] = await Promise.all([
        prisma.volunteer_data.findMany({
          select: {
            total_hours: true,
            user_id: true,
          },
        }),
        prisma.volunteer_data.findMany({
          distinct: ['user_id'],
          select: {
            user_id: true,
          },
        }),
      ]);

      const totalHours = entries.reduce((sum, entry) => sum + Number(entry.total_hours ?? 0), 0);

      res.status(200).json({
        active_volunteers: distinctVolunteers.length,
        total_hours_logged: totalHours,
        entry_count: entries.length,
      });
    } catch (error) {
      console.error('Error fetching volunteer summary:', error);
      res.status(500).json({ message: 'Failed to retrieve volunteer summary' });
    }
  },
};

module.exports = volunteersController;
