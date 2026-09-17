require('dotenv').config({ override: true });

const { connectMongoDB } = require('../config/mongodb');
const Team = require('../models/team');

const teams = [
  { name: 'Chennai Super Kings', city: 'Chennai', captain: 'Ruturaj Gaikwad' },
  { name: 'Delhi Capitals', city: 'Delhi', captain: 'Axar Patel' },
  { name: 'Gujarat Titans', city: 'Ahmedabad', captain: 'Shubman Gill' },
  { name: 'Lucknow Super Giants', city: 'Lucknow', captain: 'Rishabh Pant' },
  { name: 'Mumbai Indians', city: 'Mumbai', captain: 'Hardik Pandya' },
  { name: 'Punjab Kings', city: 'Mullanpur', captain: 'Shreyas Iyer' },
  { name: 'Rajasthan Royals', city: 'Jaipur', captain: 'Sanju Samson' },
  { name: 'Royal Challengers Bengaluru', city: 'Bengaluru', captain: 'Rajat Patidar' },
  { name: 'Sunrisers Hyderabad', city: 'Hyderabad', captain: 'Pat Cummins' },
  { name: 'Kolkata Knight Riders', city: 'Kolkata', captain: 'Ajinkya Rahane' },
];

async function seedTeams() {
  await connectMongoDB();
  await Team.bulkWrite(
    teams.map((team) => ({
      updateOne: {
        filter: { name: team.name },
        update: { $set: team },
        upsert: true,
      },
    })),
  );
  console.log(`Seeded ${teams.length} IPL teams`);
  process.exit(0);
}

seedTeams().catch((error) => {
  console.error('Team seed failed:', error.message);
  process.exit(1);
});