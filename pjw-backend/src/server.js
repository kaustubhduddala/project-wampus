require('dotenv').config();

// needed for JSON stringifying the BigInts in the Prisma Scheme
BigInt.prototype.toJSON = function() {
  return this.toString();
};

const express = require('express');
const cors = require('cors');

// --- 2. VERIFY ENV & DB CONNECTION ---
if (!process.env.DATABASE_URL) {
  console.error("FATAL ERROR: DATABASE_URL is missing in .env");
  process.exit(1);
} else {
  console.log("SUCCESS: .env loaded.");
}

const app = express();

// --- Middleware ---
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' })); 
app.use(express.json());

// ROUTES (grouped, consistent naming)
const adminStatsRouter = require('./routes/adminStatsRoutes');
const authRouter = require('./routes/authRoutes');
const ordersRouter = require('./routes/ordersRoutes');
const fundraisingRouter = require('./routes/fundraisingRoutes');
const rolesRouter = require('./routes/rolesRoutes');
const petitionRouter = require('./routes/petitionRoutes');
const chatRouter = require('./routes/chatRoutes');
const storeItemsRouter = require('./routes/storeItemsRoutes');
const sponsorsRouter = require('./routes/sponsorsRoutes');
const logosRouter = require('./routes/logosRoutes');
const moneyRaisedRouter = require('./routes/moneyRaisedRoutes');
const mealsDonatedRouter = require('./routes/mealsDonatedRoutes');
const teamPhotoRouter = require('./routes/teamPhotoRoutes');
const aboutRouter = require('./routes/aboutRoutes');
const checkoutRouter = require('./routes/checkoutRoutes');
const heatmapRouter = require('./routes/heatmapRoutes');

// --- MOUNT ROUTES ---
app.use('/api/auth', authRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/admin-stats', adminStatsRouter);
app.use('/api/petitions', petitionRouter);
app.use('/api/chat', chatRouter);
app.use('/api/items', storeItemsRouter);
app.use('/api/sponsors', sponsorsRouter);
app.use('/api/logos', logosRouter);
app.use('/api/money-raised', moneyRaisedRouter);
app.use('/api/meals-donated', mealsDonatedRouter);
app.use('/api/team-photo', teamPhotoRouter);
app.use('/api/about', aboutRouter);
app.use('/api/checkout', checkoutRouter);
app.use('/api/heatmap', heatmapRouter);
app.use('/api/roles', rolesRouter);
app.use('/api/fundraising', fundraisingRouter);

// Health Check
app.get('/', (req, res) => {res.send('Hello World');});

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
        const response = await fetch('/api/checkout', {
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
