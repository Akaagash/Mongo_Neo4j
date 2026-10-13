const neo4j = require('neo4j-driver');

let driver;

function getDriver() {
  if (!driver) {
    const uri = process.env.NEO4J_URI;
    const username = process.env.NEO4J_USERNAME;
    const password = process.env.NEO4J_PASSWORD;

    if (!uri || !username || !password) {
      throw new Error('NEO4J_URI, NEO4J_USERNAME, and NEO4J_PASSWORD are required');
    }

    driver = neo4j.driver(uri, neo4j.auth.basic(username, password));
  }

  return driver;
}

async function connectNeo4j() {
  const session = getDriver().session();

  try {
    await session.run('RETURN 1 AS connected');
    console.log('Neo4j connected');
  } finally {
    await session.close();
  }
}

async function closeNeo4j() {
  if (driver) {
    await driver.close();
    driver = undefined;
  }
}

async function getNeo4jStatus() {
  try {
    await connectNeo4j();
    return 'connected';
  } catch (error) {
    return 'disconnected';
  }
}

module.exports = { closeNeo4j, connectNeo4j, getDriver, getNeo4jStatus };