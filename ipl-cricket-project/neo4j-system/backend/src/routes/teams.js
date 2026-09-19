const express = require('express');
const { getDriver } = require('../config/neo4j');

const router = express.Router();

router.get('/', async (req, res) => {
  const session = getDriver().session();
  try {
    const result = await session.run(`
      MATCH (t:Team)
      OPTIONAL MATCH (p:Player)-[:PLAYS_FOR]->(t)
      WITH t, collect(p { .name, .role, .country }) as squad
      RETURN t, squad
      ORDER BY t.name
    `);
    const teams = result.records.map(record => {
      const node = record.get('t');
      const squad = record.get('squad');
      const props = flattenNeo4jValues(node.properties);
      
      // Reconstruct nested objects to match MongoDB format perfectly
      props.highest_paid_player = {
        name: props.highest_paid_player_name,
        salary: props.highest_paid_player_salary
      };
      props.highest_score = {
        score: props.highest_score_val,
        against: props.highest_score_against
      };
      props.lowest_score = {
        score: props.lowest_score_val,
        against: props.lowest_score_against
      };
      
      // Cleanup the flat fields used for Neo4j property storage
      delete props.highest_paid_player_name;
      delete props.highest_paid_player_salary;
      delete props.highest_score_val;
      delete props.highest_score_against;
      delete props.lowest_score_val;
      delete props.lowest_score_against;
      delete props.squad_json;
      
      props.squad = squad;
      
      return { _id: node.identity.toString(), ...props };
    });
    res.json({ success: true, count: teams.length, data: teams });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  } finally {
    await session.close();
  }
});

module.exports = router;

// Helpers to flatten Neo4j Integer types to plain JS
function flattenNeo4jValue(val) {
  if (val === null || val === undefined) return val;
  if (val.low !== undefined && val.high !== undefined) return val.toNumber ? val.toNumber() : val.low;
  if (Array.isArray(val)) return val.map(flattenNeo4jValue);
  if (typeof val === 'object' && val.constructor && val.constructor.name === 'Integer') return val.toNumber();
  return val;
}

function flattenNeo4jValues(props) {
  const result = {};
  for (const [key, val] of Object.entries(props)) {
    result[key] = flattenNeo4jValue(val);
  }
  return result;
}
