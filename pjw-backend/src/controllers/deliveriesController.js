const prisma = require('../db/db');

const MISSING_JSON_BODY_MESSAGE =
  'Request body missing or invalid JSON. Ensure Content-Type: application/json is set.';

const hasNonEmptyJsonBody = (body) =>
  body != null && typeof body === 'object' && !Array.isArray(body) && Object.keys(body).length > 0;

const parseLatitudeLongitude = (value, fieldName) => {
  if (value === undefined || value === null || value === '') {
    return { ok: false, message: `${fieldName} is required` };
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return { ok: false, message: `${fieldName} must be a valid number` };
  }

  return { ok: true, value: parsed };
};

const parseItems = (items) => {
  if (items === undefined || items === null || items === '') return [];

  if (Array.isArray(items)) {
    return items
      .map((item) => (item == null ? '' : String(item).trim()))
      .filter(Boolean);
  }

  if (typeof items === 'string') {
    return items
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return null;
};

const toDeliveryResponse = (delivery) => ({
  id: delivery.id,
  created_at: delivery.created_at,
  user_id: delivery.user_id,
  volunteer_email: delivery.users?.email ?? null,
  lat: delivery.lat,
  lng: delivery.lng,
  notes: delivery.notes,
  items: delivery.items,
});

const deliveriesController = {
  getAllDeliveries: async (req, res) => {
    try {
      const parsedLimit = Number.parseInt(String(req.query.limit ?? ''), 10);
      const limit = Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : undefined;

      const deliveries = await prisma.delivery_logs.findMany({
        orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
        take: limit,
        include: {
          users: {
            select: {
              email: true,
            },
          },
        },
      });

      res.status(200).json(deliveries.map(toDeliveryResponse));
    } catch (error) {
      console.error('Error fetching deliveries:', error);
      res.status(500).json({ message: 'Failed to retrieve deliveries' });
    }
  },

  getDeliveryById: async (req, res) => {
    try {
      const { id } = req.params;
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ message: 'Invalid delivery id' });
      }

      const delivery = await prisma.delivery_logs.findUnique({
        where: { id },
        include: {
          users: {
            select: {
              email: true,
            },
          },
        },
      });

      if (!delivery) {
        return res.status(404).json({ message: 'Delivery not found' });
      }

      res.status(200).json(toDeliveryResponse(delivery));
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  createDelivery: async (req, res) => {
    try {
      if (!hasNonEmptyJsonBody(req.body)) {
        return res.status(400).json({ message: MISSING_JSON_BODY_MESSAGE });
      }

      const latResult = parseLatitudeLongitude(req.body.lat, 'lat');
      const lngResult = parseLatitudeLongitude(req.body.lng, 'lng');

      if (!latResult.ok) {
        return res.status(400).json({ message: latResult.message });
      }
      if (!lngResult.ok) {
        return res.status(400).json({ message: lngResult.message });
      }

      const parsedItems = parseItems(req.body.items);
      if (parsedItems === null) {
        return res.status(400).json({ message: 'items must be a string or an array of strings' });
      }

      if (req.body.notes !== undefined && req.body.notes !== null && typeof req.body.notes !== 'string') {
        return res.status(400).json({ message: 'notes must be a string or null' });
      }

      const requestUserId = req.user?.id;
      if (!requestUserId && req.body.user_id !== undefined && req.body.user_id !== null && typeof req.body.user_id !== 'string') {
        return res.status(400).json({ message: 'user_id must be a UUID string or null' });
      }

      const resolvedUserId = requestUserId ?? req.body.user_id ?? null;

      const created = await prisma.delivery_logs.create({
        data: {
          lat: latResult.value,
          lng: lngResult.value,
          notes: req.body.notes ?? null,
          items: parsedItems,
          ...(resolvedUserId ? { user_id: resolvedUserId } : {}),
        },
        include: {
          users: {
            select: {
              email: true,
            },
          },
        },
      });

      res.status(201).json(toDeliveryResponse(created));
    } catch (error) {
      if (error.code === 'P2003') {
        return res.status(400).json({ message: 'Provided user_id does not reference an existing user' });
      }
      console.error('Error creating delivery:', error);
      res.status(500).json({ message: 'Failed to create delivery' });
    }
  },
};

module.exports = deliveriesController;
