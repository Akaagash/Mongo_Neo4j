const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { connectMongo, getNeo4jDriver } = require('./db');
const analysisRoutes = require('./routes/analysisRoutes');

const app = express();
const PORT = process.env.PORT || 5003;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/v1', analysisRoutes);

// Health check endpoint
app.get('/health', async (req, res) => {
  res.json({
    status: 'ONLINE',
    system: 'Big Data Management & Analytics System',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

async function startServer() {
  try {
    console.log('[BigData] Initializing Dual-Database Federation...');
    await connectMongo();
    getNeo4jDriver();

    app.listen(PORT, () => {
      console.log(`==================================================`);
      console.log(`[BigData Backend] Server active on port ${PORT}`);
      console.log(`[BigData Backend] API Base: http://localhost:${PORT}/api/v1`);
      console.log(`==================================================`);
    });
  } catch (err) {
    console.error('[BigData Backend] Initialization failed:', err.message);
    process.exit(1);
  }
}

startServer();
