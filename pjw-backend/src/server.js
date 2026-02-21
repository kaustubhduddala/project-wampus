require('dotenv').config();

// needed for JSON stringifying the BigInts in the Prisma Scheme
BigInt.prototype.toJSON = function() {
  return this.toString();
};

const express = require('express');
const cors = require('cors');
// initialize prisma
const prisma = require('./db/db');

// --- 2. VERIFY ENV & DB CONNECTION ---
if (!process.env.DATABASE_URL) {
  console.error("FATAL ERROR: DATABASE_URL is missing in .env");
  process.exit(1);
} else {
  console.log("SUCCESS: .env loaded.");
}

const app = express();

// --- Middleware ---
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' })); // Allow all for dev, restrict in prod
app.use(express.json());

// --- ROUTES ---


// Example: Health Check
app.get('/', (req, res) => {res.send('Hello World');});

const storeItemsRouter = require('./routes/storeItemsRoutes');
app.use('/items', storeItemsRouter);

const ordersRouter = require('./routes/ordersRoutes')
app.use('/orders', ordersRouter);

const sponsorsRouter = require('./routes/sponsorsRoutes');
app.use('/sponsors', sponsorsRouter);

const logosRouter = require('./routes/logosRoutes');
app.use('/logos', logosRouter);

const moneyRaised = require('./routes/moneyRaisedRoutes')
app.use('/money-raised', moneyRaised);

const mealsDonated = require('./routes/mealsDonatedRoutes')
app.use('/meals-donated', mealsDonated);

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
                const response = await fetch('http://localhost:3001/checkout', {
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

const checkoutRouter = require('./routes/checkoutRoutes')
app.use('/checkout', checkoutRouter);

// start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
