const prisma = require('../db/db');
const stripe = require('stripe')(process.env.STRIPE_API_KEY);
const { findItemById } = require("./storeItemsController");

/**
 * validates that the requested data follows the format { "items": [{ "id": "1", "qty": 1 }] }
 */
const validateData = (data) => {
  return (
    // 1. Check if it's an object and has 'items'
    typeof data === 'object' && data !== null && 
    Array.isArray(data.items) &&
    // 2. Check every element in the 'items' array
    data.items.every(item => 
      typeof item === 'object' && 
      item !== null &&
      typeof item.id === 'number' && // Check if id is a string
      typeof item.qty === 'number'   // Check if qty is a number
    )
  );
};

/**
 * Searches through the database to find the associated product id to the id of the item
 * 
 * @param id the id of the store item
 * @returns the product id of the item
 */
async function get_product_id(id) {
    const item = await findItemById(id);
    return item.product_id;
}

/**
 * Gets the associated product_id for the id of the item passed in
 * 
 * @param items the items list in the format of [{ "id": "1", "qty": 1 }]
 * @returns an array of objects of stripe's product_id and the original qty
 */
const get_requested_orders = async (items) => {
    return await Promise.all(items.map(async (item) => ({
        product_id: await get_product_id(item.id),
        qty: item.qty
    })));
};


/**
 * Makes a list of price ids and quanties. Used in the final stripe checkout call.
 * 
 * @param unprocessed_order_list the list that contains objects of product_ids and qty
 * @param product_list the list of Stripe Product objects of the products that were requested
 * @returns a list of price_ids and qtys for each product that was requested
 */
function build_order_list(unprocessed_order_list, product_list) {
    return unprocessed_order_list.map(order => {
        
        // Find the product in the Stripe list that matches this order's ID
        const stripeProduct = product_list.find(p => p.id === order.product_id);

        return {
            price: stripeProduct.default_price,
            quantity: order.qty
        };
    });
}

const checkoutController = {

    checkout: async (req, res) => {
        // data should be in the form of { "items": [{ "id": "1", "qty": 1 }] }

        if (!validateData(req.body)){
            return res.status(400).json({ message: 'Body is malformed' });
        }

        const requested_orders = await get_requested_orders(req.body.items);

        // getting the product objects from stripe to have access to the product's price_ids
        const requested_product_ids = requested_orders.map(order => order.product_id);
        const requested_products_list = (await stripe.products.list({
            ids: requested_product_ids,
        })).data;

        const final_order_list = build_order_list(requested_orders, requested_products_list);

        const session = await stripe.checkout.sessions.create({
            line_items: final_order_list,
            mode: 'payment',
            success_url: 'http://localhost:3001/',
        });

        // returns the redirect url that the checkout session is live on
        res.status(200).json({"url": session.url});
        }
};

module.exports = checkoutController;