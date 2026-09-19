const express = require('express');
const { getDriver } = require('../config/neo4j');

const router = express.Router();

// Get all node labels
router.get('/labels', async (req, res) => {
  const session = getDriver().session();
  try {
    const result = await session.run('CALL db.labels() YIELD label RETURN label ORDER BY label');
    const labels = result.records.map(r => r.get('label'));
    res.json({ success: true, data: labels });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  } finally {
    await session.close();
  }
});

// Create a node with a new label
router.post('/labels', async (req, res) => {
  const session = getDriver().session();
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, error: 'Label name required' });
    await session.run(`CREATE (n:\`${name}\`) RETURN n`);
    res.json({ success: true, message: `Label ${name} created with an empty node` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  } finally {
    await session.close();
  }
});

// Delete all nodes with a given label
router.delete('/labels/:name', async (req, res) => {
  const session = getDriver().session();
  try {
    const { name } = req.params;
    await session.run(`MATCH (n:\`${name}\`) DETACH DELETE n`);
    res.json({ success: true, message: `All nodes with label ${name} deleted` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  } finally {
    await session.close();
  }
});

// Execute a raw Cypher query
router.post('/query', async (req, res) => {
  const session = getDriver().session();
  try {
    const { cypher } = req.body;
    if (!cypher) return res.status(400).json({ success: false, error: 'Cypher query required' });
    
    const result = await session.run(cypher);
    const data = result.records.map(record => {
      const obj = {};
      record.keys.forEach(key => {
        const val = record.get(key);
        if (val && val.identity !== undefined && val.properties) {
          // It's a node
          obj[key] = { _id: val.identity.toString(), _labels: val.labels, ...flattenNeo4jValues(val.properties) };
        } else if (val && val.start !== undefined && val.end !== undefined && val.type) {
          // It's a relationship
          obj[key] = { _id: val.identity.toString(), _type: val.type, _start: val.start.toString(), _end: val.end.toString(), ...flattenNeo4jValues(val.properties) };
        } else {
          obj[key] = flattenNeo4jValue(val);
        }
      });
      return obj;
    });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  } finally {
    await session.close();
  }
});

// Get all nodes for a label
router.get('/nodes/:label', async (req, res) => {
  const session = getDriver().session();
  try {
    const { label } = req.params;
    const result = await session.run(`MATCH (n:\`${label}\`) RETURN n`);
    const nodes = result.records.map(record => {
      const node = record.get('n');
      return { _id: node.identity.toString(), _labels: node.labels, ...flattenNeo4jValues(node.properties) };
    });
    res.json({ success: true, data: nodes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  } finally {
    await session.close();
  }
});

// Create a node
router.post('/nodes/:label', async (req, res) => {
  const session = getDriver().session();
  try {
    const { label } = req.params;
    const { properties } = req.body;
    if (!properties) return res.status(400).json({ success: false, error: 'Properties required' });
    
    const result = await session.run(`CREATE (n:\`${label}\` $props) RETURN n`, { props: properties });
    const node = result.records[0].get('n');
    res.json({ success: true, data: { _id: node.identity.toString(), ...node.properties } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  } finally {
    await session.close();
  }
});

// Delete a node by ID
router.delete('/nodes/:id', async (req, res) => {
  const session = getDriver().session();
  try {
    const { id } = req.params;
    const neo4j = require('neo4j-driver');
    await session.run('MATCH (n) WHERE id(n) = $id DETACH DELETE n', { id: neo4j.int(parseInt(id)) });
    res.json({ success: true, message: 'Node deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  } finally {
    await session.close();
  }
});

// Update a node by ID
router.put('/nodes/:id', async (req, res) => {
  const session = getDriver().session();
  try {
    const { id } = req.params;
    const { properties } = req.body;
    if (!properties) return res.status(400).json({ success: false, error: 'Properties required' });
    
    const neo4j = require('neo4j-driver');
    // Remove all old properties and set new ones
    const result = await session.run(
      'MATCH (n) WHERE id(n) = $id SET n = $props RETURN n',
      { id: neo4j.int(parseInt(id)), props: properties }
    );
    if (result.records.length === 0) {
      return res.status(404).json({ success: false, error: 'Node not found' });
    }
    const node = result.records[0].get('n');
    res.json({ success: true, data: { _id: node.identity.toString(), ...node.properties } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  } finally {
    await session.close();
  }
});

// Get graph data (nodes + relationships) for a label
router.get('/graph/:label', async (req, res) => {
  const session = getDriver().session();
  try {
    const { label } = req.params;
    // Get nodes
    const nodesResult = await session.run(`MATCH (n:\`${label}\`) RETURN n`);
    const nodes = nodesResult.records.map(r => {
      const node = r.get('n');
      return { id: node.identity.toString(), labels: node.labels, properties: flattenNeo4jValues(node.properties) };
    });
    
    // Get relationships between nodes of this label
    const relsResult = await session.run(
      `MATCH (a:\`${label}\`)-[r]->(b) RETURN a, r, b`
    );
    const relationships = relsResult.records.map(r => {
      const rel = r.get('r');
      const target = r.get('b');
      return {
        id: rel.identity.toString(),
        type: rel.type,
        source: rel.start.toString(),
        target: rel.end.toString(),
        targetLabels: target.labels,
        properties: flattenNeo4jValues(rel.properties)
      };
    });
    
    // Also include target nodes that may not be of the same label
    const extraNodesMap = {};
    relsResult.records.forEach(r => {
      const b = r.get('b');
      const bid = b.identity.toString();
      if (!nodes.find(n => n.id === bid) && !extraNodesMap[bid]) {
        extraNodesMap[bid] = { id: bid, labels: b.labels, properties: flattenNeo4jValues(b.properties) };
      }
    });
    const allNodes = [...nodes, ...Object.values(extraNodesMap)];
    
    res.json({ success: true, data: { nodes: allNodes, relationships } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  } finally {
    await session.close();
  }
});

// Helpers to flatten Neo4j Integer types to plain JS
function flattenNeo4jValue(val) {
  if (val === null || val === undefined) return val;
  // Neo4j integers
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

module.exports = router;
