const prisma = require('../db/db');

const EVENT_TYPES = new Set(['general_meeting', 'food_drive', 'other']);
const MISSING_JSON_BODY_MESSAGE =
  'Request body missing or invalid JSON. Ensure Content-Type: application/json is set.';

const hasNonEmptyJsonBody = (body) =>
  body != null && typeof body === 'object' && !Array.isArray(body) && Object.keys(body).length > 0;

const parseBigIntId = (id) => {
  try {
    const parsed = BigInt(id);
    return parsed > 0n ? parsed : null;
  } catch {
    return null;
  }
};

const parseLimit = (value, fallback = 20) => {
  if (value === undefined) return fallback;
  const parsed = Number.parseInt(String(value), 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.min(parsed, 200);
};

const parseOffset = (value, fallback = 0) => {
  if (value === undefined) return fallback;
  const parsed = Number.parseInt(String(value), 10);
  if (!Number.isFinite(parsed) || parsed < 0) return fallback;
  return parsed;
};

const parseEventDate = (value) => {
  if (typeof value !== 'string' || !value.trim()) {
    return { ok: false, message: 'event_date is required and must be an ISO datetime string' };
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return { ok: false, message: 'event_date must be a valid ISO datetime string' };
  }

  return { ok: true, value: parsed };
};

const parseOptionalString = (value, fieldName) => {
  if (value === undefined) return { ok: true, isOmitted: true };
  if (value === null || value === '') return { ok: true, value: null };
  if (typeof value !== 'string') {
    return { ok: false, message: `${fieldName} must be a string or null` };
  }
  return { ok: true, value: value.trim() };
};

const parseEventType = (value, fieldName = 'event_type') => {
  if (value === undefined) return { ok: true, isOmitted: true };
  if (value === null || value === '') return { ok: true, value: null };
  if (typeof value !== 'string') {
    return { ok: false, message: `${fieldName} must be one of general_meeting, food_drive, other, or null` };
  }

  const normalized = value.trim();
  if (!EVENT_TYPES.has(normalized)) {
    return { ok: false, message: `${fieldName} must be one of general_meeting, food_drive, other, or null` };
  }

  return { ok: true, value: normalized };
};

const eventsController = {
  getEvents: async (req, res) => {
    try {
      const upcomingOnly = String(req.query.upcoming ?? '').toLowerCase() === 'true';
      const limit = parseLimit(req.query.limit, 20);
      const offset = parseOffset(req.query.offset, 0);

      const where = upcomingOnly
        ? {
            event_date: {
              gte: new Date(),
            },
          }
        : undefined;

      const events = await prisma.events.findMany({
        where,
        orderBy: [{ event_date: 'asc' }, { id: 'asc' }],
        take: limit,
        skip: offset,
      });

      res.status(200).json(events);
    } catch (error) {
      console.error('Error fetching events:', error);
      res.status(500).json({ message: 'Failed to retrieve events' });
    }
  },

  getEventById: async (req, res) => {
    try {
      const eventId = parseBigIntId(req.params.id);
      if (eventId === null) {
        return res.status(400).json({ message: 'Invalid event id' });
      }

      const event = await prisma.events.findUnique({ where: { id: eventId } });
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }

      res.status(200).json(event);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  createEvent: async (req, res) => {
    try {
      if (!hasNonEmptyJsonBody(req.body)) {
        return res.status(400).json({ message: MISSING_JSON_BODY_MESSAGE });
      }

      const { title } = req.body;

      if (typeof title !== 'string' || !title.trim()) {
        return res.status(400).json({ message: 'title is required' });
      }

      const eventDate = parseEventDate(req.body.event_date);
      if (!eventDate.ok) {
        return res.status(400).json({ message: eventDate.message });
      }

      const description = parseOptionalString(req.body.description, 'description');
      if (!description.ok) {
        return res.status(400).json({ message: description.message });
      }

      const location = parseOptionalString(req.body.location, 'location');
      if (!location.ok) {
        return res.status(400).json({ message: location.message });
      }

      const eventType = parseEventType(req.body.event_type);
      if (!eventType.ok) {
        return res.status(400).json({ message: eventType.message });
      }

      const created = await prisma.events.create({
        data: {
          title: title.trim(),
          description: description.isOmitted ? null : description.value,
          location: location.isOmitted ? null : location.value,
          event_date: eventDate.value,
          event_type: eventType.isOmitted ? null : eventType.value,
          created_by: req.user.id,
        },
      });

      res.status(201).json(created);
    } catch (error) {
      console.error('Error creating event:', error);
      res.status(500).json({ message: 'Failed to create event' });
    }
  },

  updateEvent: async (req, res) => {
    try {
      const eventId = parseBigIntId(req.params.id);
      if (eventId === null) {
        return res.status(400).json({ message: 'Invalid event id' });
      }

      if (!hasNonEmptyJsonBody(req.body)) {
        return res.status(400).json({ message: MISSING_JSON_BODY_MESSAGE });
      }

      const data = {};

      if (Object.prototype.hasOwnProperty.call(req.body, 'title')) {
        if (typeof req.body.title !== 'string' || !req.body.title.trim()) {
          return res.status(400).json({ message: 'title must be a non-empty string' });
        }
        data.title = req.body.title.trim();
      }

      if (Object.prototype.hasOwnProperty.call(req.body, 'description')) {
        const parsed = parseOptionalString(req.body.description, 'description');
        if (!parsed.ok) {
          return res.status(400).json({ message: parsed.message });
        }
        data.description = parsed.value;
      }

      if (Object.prototype.hasOwnProperty.call(req.body, 'location')) {
        const parsed = parseOptionalString(req.body.location, 'location');
        if (!parsed.ok) {
          return res.status(400).json({ message: parsed.message });
        }
        data.location = parsed.value;
      }

      if (Object.prototype.hasOwnProperty.call(req.body, 'event_date')) {
        const parsed = parseEventDate(req.body.event_date);
        if (!parsed.ok) {
          return res.status(400).json({ message: parsed.message });
        }
        data.event_date = parsed.value;
      }

      if (Object.prototype.hasOwnProperty.call(req.body, 'event_type')) {
        const parsed = parseEventType(req.body.event_type);
        if (!parsed.ok) {
          return res.status(400).json({ message: parsed.message });
        }
        data.event_type = parsed.value;
      }

      if (Object.keys(data).length === 0) {
        return res.status(400).json({ message: 'No valid fields provided for update' });
      }

      const updated = await prisma.events.update({
        where: { id: eventId },
        data,
      });

      res.status(200).json(updated);
    } catch (error) {
      if (error.code === 'P2025') {
        return res.status(404).json({ message: 'Event not found' });
      }
      res.status(500).json({ message: error.message });
    }
  },

  deleteEvent: async (req, res) => {
    try {
      const eventId = parseBigIntId(req.params.id);
      if (eventId === null) {
        return res.status(400).json({ message: 'Invalid event id' });
      }

      await prisma.events.delete({ where: { id: eventId } });
      res.status(200).json({ message: 'Event deleted successfully' });
    } catch (error) {
      if (error.code === 'P2025') {
        return res.status(404).json({ message: 'Event not found' });
      }
      res.status(500).json({ message: error.message });
    }
  },
};

module.exports = eventsController;
