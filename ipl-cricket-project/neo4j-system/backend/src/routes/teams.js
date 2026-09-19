const express = require('express');
const { getDriver } = require('../config/neo4j');

const router = express.Router();

router.get('/', async (req, res) => {
  const session = getDriver().session();
  try {
    const result = await session.run('MATCH (t:Team) RETURN t ORDER BY t.name');
    const teams = result.records.map(record => {
      const node = record.get('t');
      return { _id: node.identity.toString(), ...flattenNeo4jValues(node.properties) };
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
