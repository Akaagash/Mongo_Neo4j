const express = require('express');
const cors = require('cors');
const { getMongoDBStats, getMongoDBStatus } = require('./config/mongodb');
const teamsRouter = require('./routes/teams');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/teams', teamsRouter);

app.get('/', (req, res) => {
  res.json({ service: 'MongoDB IPL backend', health: '/api/health' });
});

app.get('/api/health', async (req, res) => {
  const databaseStatus = getMongoDBStatus();
  const isDatabaseConnected = databaseStatus === 'connected';
  const stats = await getMongoDBStats();

  res.status(isDatabaseConnected ? 200 : 503).json({
    success: isDatabaseConnected,
    service: 'MongoDB IPL backend',
    database: 'MongoDB',
    databaseStatus,
    ...stats,
  });
});

module.exports = app;
