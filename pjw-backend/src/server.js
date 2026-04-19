require('dotenv').config();

// needed for JSON stringifying the BigInts in the Prisma Scheme
if (typeof BigInt.prototype.toJSON !== 'function') {
    BigInt.prototype.toJSON = function() {
        return this.toString();
    };
}

const express = require('express');
const cors = require('cors');

const MALFORMED_JSON_BODY_MESSAGE =
    'Request body missing or invalid JSON. Ensure Content-Type: application/json is set.';

// --- 2. VERIFY ENV & DB CONNECTION ---
if (!process.env.DATABASE_URL) {
  console.error("FATAL ERROR: DATABASE_URL is missing in .env");
  process.exit(1);
} else {
  console.log("SUCCESS: .env loaded.");
}

const app = express();

// ROUTES
const adminStatsRouter = require('./routes/adminStatsRoutes');
const authRoutes = require('./routes/authRoutes');    
const ordersRoutes = require('./routes/ordersRoutes');
const fundraisingRoutes = require('./routes/fundraisingRoutes');
const rolesRoutes = require('./routes/rolesRoutes');
const chatRoutes = require('./routes/chatRoutes');
const storeItemsRouter = require('./routes/storeItemsRoutes');
const sponsorsRouter = require('./routes/sponsorsRoutes');
const logosRouter = require('./routes/logosRoutes');
const moneyRaisedRoutes = require('./routes/moneyRaisedRoutes');
const mealsDonatedRoutes = require('./routes/mealsDonatedRoutes');
const checkoutRouter = require('./routes/checkoutRoutes');
const heatmapRouter = require('./routes/heatmapRoutes');
const advocacyUpdatesRoutes = require('./routes/advocacyUpdatesRoutes');
const deliveriesRoutes = require('./routes/deliveriesRoutes');
const volunteersRoutes = require('./routes/volunteersRoutes');
const publicStatsRoutes = require('./routes/publicStatsRoutes');
const eventsRoutes = require('./routes/eventsRoutes');
const inviteRoutes = require('./routes/inviteRoutes');


// --- Middleware ---
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' })); 
app.use(express.json());

// Example: Health Check
app.get('/', (req, res) => {res.send('Hello World');});

// --- MOUNT API ROUTES (canonical) ---
const apiRouter = express.Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/orders', ordersRoutes);
apiRouter.use('/admin-stats', adminStatsRouter);
apiRouter.use('/chat', chatRoutes);
apiRouter.use('/items', storeItemsRouter);
apiRouter.use('/sponsors', sponsorsRouter);
apiRouter.use('/logos', logosRouter);
apiRouter.use('/money-raised', moneyRaisedRoutes);
apiRouter.use('/meals-donated', mealsDonatedRoutes);
apiRouter.use('/checkout', checkoutRouter);
apiRouter.use('/heatmap', heatmapRouter);
apiRouter.use('/roles', rolesRoutes);
apiRouter.use('/fundraising', fundraisingRoutes);
apiRouter.use('/advocacy-updates', advocacyUpdatesRoutes);
apiRouter.use('/deliveries', deliveriesRoutes);
apiRouter.use('/volunteers', volunteersRoutes);
apiRouter.use('/stats', publicStatsRoutes);
apiRouter.use('/events', eventsRoutes);
apiRouter.use('/invite', inviteRoutes);

app.use('/api', apiRouter);

// --- Legacy compatibility routes (non-/api) ---
app.use('/items', storeItemsRouter);
app.use('/sponsors', sponsorsRouter);
app.use('/logos', logosRouter);
app.use('/money-raised', moneyRaisedRoutes);
app.use('/meals-donated', mealsDonatedRoutes);
app.use('/checkout', checkoutRouter);
app.use('/heatmap', heatmapRouter);
app.use('/roles', rolesRoutes);
app.use('/fundraising', fundraisingRoutes);

// Standardize malformed JSON parse errors from express.json().
app.use((err, _req, res, next) => {
    const isMalformedJsonError =
        err instanceof SyntaxError && err.status === 400 && Object.prototype.hasOwnProperty.call(err, 'body');

    if (isMalformedJsonError) {
        return res.status(400).json({ message: MALFORMED_JSON_BODY_MESSAGE });
    }

    return next(err);
});

// testing page for checkout endpoint
app.get('/checkout-test',(req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="en">
<body>

    <button id="checkout-btn">Checkout Now</button>

    <script>
        const checkoutBtn = document.getElementById('checkout-btn');

        checkoutBtn.addEventListener('click', async () => {
            // Disable button to prevent double clicks
            checkoutBtn.disabled = true;
            checkoutBtn.innerText = 'Loading...';

            const orderData = {
                items: [
                    { id: 2, qty: 1 }
                ]
            };

            try {
                // Send the POST request to your local server
                const response = await fetch('http://localhost:3001/api/checkout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(orderData)
                });

                if (response.ok) {
                    data = await response.json()
                    window.location.assign(data.url);
                } else {
                    const error = await response.json();
                    alert('Error: ' + error.message);
                    checkoutBtn.disabled = false;
                    checkoutBtn.innerText = 'Checkout Now';
                }
            } catch (err) {
                console.error('Network Error:', err);
                alert('Could not connect to the server. Is your backend running?');
                checkoutBtn.disabled = false;
                checkoutBtn.innerText = 'Checkout Now';
            }
        });
    </script>
</body>
</html>`)
})

// start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
