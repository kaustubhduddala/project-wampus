require('dotenv').config();

// needed for JSON stringifying the BigInts in the Prisma Scheme
BigInt.prototype.toJSON = function() {
  return this.toString();
};

const express = require('express');
const cors = require('cors');
const prisma = require('./db/db');

// --- 2. VERIFY ENV & DB CONNECTION ---
if (!process.env.DATABASE_URL) {
  console.error("FATAL ERROR: DATABASE_URL is missing in .env");
  process.exit(1);
} else {
  console.log("SUCCESS: .env loaded.");
}

const app = express();

// ROUTES
const authRoutes = require('./routes/authRoutes');    
const ordersRoutes = require('./routes/ordersRoutes');


// --- Middleware ---
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' })); 
app.use(express.json());

// --- MOUNT ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/orders', ordersRoutes);


// Example: Health Check
app.get('/', (req, res) => {
  res.send('Hello World');
});

const storeItemsRouter = require('./routes/storeItemsRoutes');
app.use('/items', storeItemsRouter);

const ordersRouter = require('./routes/ordersRoutes')
app.use('/orders', ordersRouter);

const heatmapRouter = require('./routes/heatmapRoutes');
app.use('/heatmap', heatmapRouter);

const rolesRouter = require('./routes/rolesRoutes');
app.use('/roles', rolesRouter);

// start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
