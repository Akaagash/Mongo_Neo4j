require('dotenv').config({ override: true });

const app = require('./app');
const { connectMongoDB } = require('./config/mongodb');

const port = Number(process.env.PORT) || 5001;

async function startServer() {
  app.listen(port, () => {
    console.log(`MongoDB backend running on http://localhost:${port}`);
  });

  try {
    await connectMongoDB();
  } catch (error) {
    console.error('MongoDB connection unavailable:', error.message);
  }
}

startServer();
