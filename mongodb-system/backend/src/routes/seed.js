const express = require('express');
const Team = require('../models/team');

const router = express.Router();

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

router.post('/', async (req, res) => {
  try {
    await Team.bulkWrite(
      teams.map((team) => ({
        updateOne: {
          filter: { name: team.name },
          update: { $set: team },
          upsert: true,
        },
      })),
    );
    res.json({ success: true, message: `Seeded ${teams.length} IPL teams successfully.` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
