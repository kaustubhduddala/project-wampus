const prisma = require('../db/db');

const parseBigIntId = (id) => {
  try {
    const parsed = BigInt(id);
    return parsed > 0n ? parsed : null;
  } catch {
    return null;
  }
};

const readOptionalString = (value, fieldName) => {
  if (value === undefined) return { ok: true, isOmitted: true };
  if (value === null || value === '') return { ok: true, value: null };
  if (typeof value !== 'string') {
    return { ok: false, message: `${fieldName} must be a string or null` };
  }
  return { ok: true, value: value.trim() };
};

const advocacyUpdatesController = {
  getAllUpdates: async (_req, res) => {
    try {
      const updates = await prisma.advocacy_updates.findMany({
        orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
      });

      res.status(200).json(updates);
    } catch (error) {
      console.error('Error fetching advocacy updates:', error);
      res.status(500).json({ message: 'Failed to retrieve advocacy updates' });
    }
  },

  getUpdateById: async (req, res) => {
    try {
      const id = parseBigIntId(req.params.id);
      if (id === null) {
        return res.status(400).json({ message: 'Invalid advocacy update id' });
      }

      const update = await prisma.advocacy_updates.findUnique({ where: { id } });
      if (!update) {
        return res.status(404).json({ message: 'Advocacy update not found' });
      }

      res.status(200).json(update);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  createUpdate: async (req, res) => {
    try {
      const { title, content } = req.body;

      if (typeof title !== 'string' || !title.trim()) {
        return res.status(400).json({ message: 'title is required' });
      }
      if (typeof content !== 'string' || !content.trim()) {
        return res.status(400).json({ message: 'content is required' });
      }

      const optionalFields = ['bill_number', 'status', 'impact', 'priority', 'action_taken', 'link_url'];
      const data = {
        title: title.trim(),
        content: content.trim(),
      };

      for (const field of optionalFields) {
        const parsed = readOptionalString(req.body[field], field);
        if (!parsed.ok) {
          return res.status(400).json({ message: parsed.message });
        }
        if (!parsed.isOmitted) {
          data[field] = parsed.value;
        }
      }

      const created = await prisma.advocacy_updates.create({ data });
      res.status(201).json(created);
    } catch (error) {
      console.error('Error creating advocacy update:', error);
      res.status(500).json({ message: 'Failed to create advocacy update' });
    }
  },

  updateUpdate: async (req, res) => {
    try {
      const id = parseBigIntId(req.params.id);
      if (id === null) {
        return res.status(400).json({ message: 'Invalid advocacy update id' });
      }

      const updatableFields = ['title', 'content', 'bill_number', 'status', 'impact', 'priority', 'action_taken', 'link_url'];
      const data = {};

      for (const field of updatableFields) {
        if (!Object.prototype.hasOwnProperty.call(req.body, field)) continue;

        if (field === 'title' || field === 'content') {
          const value = req.body[field];
          if (typeof value !== 'string' || !value.trim()) {
            return res.status(400).json({ message: `${field} must be a non-empty string` });
          }
          data[field] = value.trim();
          continue;
        }

        const parsed = readOptionalString(req.body[field], field);
        if (!parsed.ok) {
          return res.status(400).json({ message: parsed.message });
        }
        data[field] = parsed.value;
      }

      if (Object.keys(data).length === 0) {
        return res.status(400).json({ message: 'No valid fields provided for update' });
      }

      const updated = await prisma.advocacy_updates.update({
        where: { id },
        data,
      });

      res.status(200).json(updated);
    } catch (error) {
      if (error.code === 'P2025') {
        return res.status(404).json({ message: 'Advocacy update not found' });
      }
      res.status(500).json({ message: error.message });
    }
  },

  deleteUpdate: async (req, res) => {
    try {
      const id = parseBigIntId(req.params.id);
      if (id === null) {
        return res.status(400).json({ message: 'Invalid advocacy update id' });
      }

      await prisma.advocacy_updates.delete({ where: { id } });
      res.status(200).json({ message: 'Advocacy update deleted successfully' });
    } catch (error) {
      if (error.code === 'P2025') {
        return res.status(404).json({ message: 'Advocacy update not found' });
      }
      res.status(500).json({ message: error.message });
    }
  },
};

module.exports = advocacyUpdatesController;
