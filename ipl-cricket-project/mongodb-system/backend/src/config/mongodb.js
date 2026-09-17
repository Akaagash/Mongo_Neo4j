const mongoose = require('mongoose');

async function connectMongoDB() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error('MONGODB_URI is not set in the environment');
  }

  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
  console.log('MongoDB connected');
}

function getMongoDBStatus() {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  return states[mongoose.connection.readyState] || 'unknown';
}

async function getMongoDBStats() {
  if (getMongoDBStatus() !== 'connected') {
    return { teamsCount: 0 };
  }

  const teamsCount = await mongoose.connection.collection('ipl_list').countDocuments();
  return { teamsCount };
}

module.exports = { connectMongoDB, getMongoDBStats, getMongoDBStatus };
