const cors = require('cors');
const express = require('express');
const { getNeo4jStatus } = require('./config/neo4j');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ service: 'Neo4j IPL backend', health: '/api/health' });
});

app.get('/api/health', async (req, res) => {
  const databaseStatus = await getNeo4jStatus();
  const isDatabaseConnected = databaseStatus === 'connected';

  res.status(isDatabaseConnected ? 200 : 503).json({
    success: isDatabaseConnected,
    service: 'Neo4j IPL backend',
    database: 'Neo4j',
    databaseStatus,
  });
});

module.exports = app;