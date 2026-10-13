const { MongoClient } = require('mongodb');
const neo4j = require('neo4j-driver');
require('dotenv').config();

let mongoClient = null;
let mongoDb = null;
let neo4jDriver = null;

async function connectMongo() {
  if (!mongoDb) {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI not configured in .env');
    mongoClient = new MongoClient(uri, { serverSelectionTimeoutMS: 15000 });
    await mongoClient.connect();
    mongoDb = mongoClient.db();
    console.log('[BigData] Connected to MongoDB Atlas');
  }
  return mongoDb;
}

function getNeo4jDriver() {
  if (!neo4jDriver) {
    const uri = process.env.NEO4J_URI;
    const username = process.env.NEO4J_USERNAME;
    const password = process.env.NEO4J_PASSWORD;
    if (!uri || !username || !password) {
      throw new Error('Neo4j credentials not configured in .env');
    }
    neo4jDriver = neo4j.driver(uri, neo4j.auth.basic(username, password), {
      maxConnectionPoolSize: 50,
      connectionTimeout: 15000
    });
    console.log('[BigData] Connected to Neo4j Aura Graph Engine');
  }
  return neo4jDriver;
}

function getNeo4jSession() {
  return getNeo4jDriver().session();
}

async function checkDatabases() {
  const status = {
    mongodb: { connected: false, latency_ms: 0, count: 0 },
    neo4j: { connected: false, latency_ms: 0, nodes: 0, relationships: 0 }
  };

  try {
    const t0 = Date.now();
    const db = await connectMongo();
    await db.command({ ping: 1 });
    status.mongodb.latency_ms = Date.now() - t0;
    status.mongodb.connected = true;
    status.mongodb.count = await db.collection('deliveries').countDocuments();
  } catch (err) {
    status.mongodb.error = err.message;
  }

  try {
    const t0 = Date.now();
    const session = getNeo4jSession();
    const resNodes = await session.run('MATCH (n) RETURN count(n) as nodeCount');
    const resRels = await session.run('MATCH ()-[r]->() RETURN count(r) as relCount');
    await session.close();
    status.neo4j.latency_ms = Date.now() - t0;
    status.neo4j.connected = true;
    status.neo4j.nodes = resNodes.records[0].get('nodeCount').toNumber();
    status.neo4j.relationships = resRels.records[0].get('relCount').toNumber();
  } catch (err) {
    status.neo4j.error = err.message;
  }

  return status;
}

module.exports = {
  connectMongo,
  getNeo4jDriver,
  getNeo4jSession,
  checkDatabases
};
