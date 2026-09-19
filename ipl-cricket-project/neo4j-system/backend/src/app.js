const cors = require('cors');
const express = require('express');
const { getNeo4jStatus, getDriver } = require('./config/neo4j');
const teamsRouter = require('./routes/teams');
const browserRouter = require('./routes/browser');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/teams', teamsRouter);
app.use('/api/browser', browserRouter);

app.get('/', (req, res) => {
  res.json({ service: 'Neo4j IPL backend', health: '/api/health' });
});

app.get('/api/health', async (req, res) => {
  const databaseStatus = await getNeo4jStatus();
  const isDatabaseConnected = databaseStatus === 'connected';

  let nodeCount = 0;
  if (isDatabaseConnected) {
    const session = getDriver().session();
    try {
      const result = await session.run('MATCH (n) RETURN count(n) AS count');
      nodeCount = result.records[0].get('count').toNumber ? result.records[0].get('count').toNumber() : result.records[0].get('count');
    } catch (e) { /* ignore */ }
    finally { await session.close(); }
  }

  res.status(isDatabaseConnected ? 200 : 503).json({
    success: isDatabaseConnected,
    service: 'Neo4j IPL backend',
    database: 'Neo4j',
    databaseStatus,
    nodeCount,
  });
});

module.exports = app;