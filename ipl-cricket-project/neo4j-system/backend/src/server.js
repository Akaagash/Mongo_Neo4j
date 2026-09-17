require('dotenv').config();

const app = require('./app');
const { connectNeo4j, closeNeo4j } = require('./config/neo4j');

const port = Number(process.env.PORT) || 5002;

async function startServer() {
  app.listen(port, () => {
    console.log(`Neo4j backend running on http://localhost:${port}`);
  });

  try {
    await connectNeo4j();
  } catch (error) {
    console.error('Neo4j connection unavailable:', error.message);
  }
}

process.on('SIGINT', async () => {
  await closeNeo4j();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeNeo4j();
  process.exit(0);
});

startServer();