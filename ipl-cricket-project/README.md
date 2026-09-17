# IPL Cricket Database Project

This project contains two independent IPL database systems. Stage 1 sets up the MongoDB backend, and Stage 2 sets up the Neo4j backend.

## Current structure

```text
ipl-cricket-project/
  mongodb-system/
    backend/
  neo4j-system/
  dataset/
```

The MongoDB backend uses Express, Mongoose, dotenv, and CORS. It runs on port `5001` and has no Neo4j dependency or configuration.

## Configure MongoDB

Open `mongodb-system/backend/.env` and set:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/ipl_cricket
PORT=5001
```

For MongoDB Atlas, replace `MONGODB_URI` with the connection string from Atlas. Do not commit `.env`.

## Run Stage 1

```powershell
cd C:\Users\aagas\Mongo_Neo4j\ipl-cricket-project\mongodb-system\backend
npm install
npm start
```

Test the health endpoint at `http://localhost:5001/api/health`. A successful response requires MongoDB to be running and reports `databaseStatus: "connected"`.

## Run the MongoDB frontend

The React frontend reads seeded team data from `http://localhost:5001/api/teams` and displays connection status, record count, search, and refresh controls.

```powershell
cd C:\Users\aagas\Mongo_Neo4j\ipl-cricket-project\mongodb-system\frontend
npm install
npm run dev
```

Open `http://localhost:5173/`. To use another backend URL, copy `.env.example` to `.env` and change `VITE_API_URL`.

## Run Stage 2: Neo4j

Copy `neo4j-system/backend/.env.example` to `.env` and set `NEO4J_PASSWORD` to the password for your local Neo4j instance. Then run:

```powershell
cd C:\Users\aagas\Mongo_Neo4j\ipl-cricket-project\neo4j-system\backend
npm install
npm start
```

Test the health endpoint at `http://localhost:5002/api/health`. A successful response requires Neo4j to be running and reports `databaseStatus: "connected"`.
