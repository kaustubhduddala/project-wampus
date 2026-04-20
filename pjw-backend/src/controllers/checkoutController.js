const Stripe = require('stripe');
const { findItemById } = require("./storeItemsController");

function getStripeClient() {
    const apiKey = process.env.STRIPE_API_KEY;
    if (!apiKey) return null;
    return new Stripe(apiKey);
}

/**
 * Validates that the body follows format { items: [{ id, qty }] }
 */
const validateData = (data) => {
  return (
        typeof data === 'object' && data !== null &&
    Array.isArray(data.items) &&
        data.items.length > 0 &&
        data.items.every(item =>
            typeof item === 'object' &&
      item !== null &&
            (typeof item.id === 'number' || typeof item.id === 'string') &&
            typeof item.qty === 'number' &&
            Number.isFinite(item.qty) &&
            item.qty > 0
    )
  );
};

/**
 * Coerces a request id into a safe BigInt input for Prisma item lookup.
 */
const normalizeItemId = (id) => {
    try {
        const parsed = BigInt(id);
        return parsed > 0n ? parsed : null;
    } catch {
        return null;
    }
}

/**
 * Resolves requested cart entries to Stripe line_items using store_items.product_id as Stripe price_id.
 */
const getRequestedLineItems = async (items) => {
    const lineItems = [];

    for (const item of items) {
        const normalizedId = normalizeItemId(item.id);
        if (normalizedId === null) {
            return { ok: false, message: `Invalid item id: ${item.id}` };
        }

        const record = await findItemById(normalizedId);
        if (!record) {
            return { ok: false, message: `Store item not found for id ${item.id}` };
        }

        const priceId = String(record.product_id ?? '').trim();
        if (!priceId) {
            return { ok: false, message: `Store item ${item.id} is missing Stripe price_id (product_id)` };
        }

        lineItems.push({
            price: priceId,
            quantity: item.qty,
        });
    }

    return { ok: true, lineItems };
};

const checkoutController = {

    checkout: async (req, res) => {
        const stripe = getStripeClient();
        if (!stripe) {
                        return res.status(500).json({ message: 'STRIPE_API_KEY is not configured' });
                }

        if (!validateData(req.body)){
            return res.status(400).json({ message: 'Body is malformed' });
        }

                const resolved = await getRequestedLineItems(req.body.items);
                if (!resolved.ok) {
                        return res.status(400).json({ message: resolved.message });
                }

                const frontendBaseUrl = process.env.FRONTEND_URL ?? 'http://localhost:5173';

        const session = await stripe.checkout.sessions.create({
                        line_items: resolved.lineItems,
            mode: 'payment',
                        success_url: `${frontendBaseUrl}/shop?checkout=success`,
                        cancel_url: `${frontendBaseUrl}/shop`,
        });

        // returns the redirect url that the checkout session is live on
                res.status(200).json({"url": session.url});
        }
};

module.exports = checkoutController;