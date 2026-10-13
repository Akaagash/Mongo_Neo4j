const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

// Helper to check DB connection
function checkDB(req, res, next) {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ success: false, error: 'Database not connected' });
  }
  next();
}

router.use(checkDB);

// Get all collections
router.get('/collections', async (req, res) => {
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    res.json({ success: true, data: collections.map(c => c.name) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create a collection
router.post('/collections', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, error: 'Collection name required' });
    await mongoose.connection.db.createCollection(name);
    res.json({ success: true, message: `Collection ${name} created` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Drop a collection
router.delete('/collections/:name', async (req, res) => {
  try {
    const { name } = req.params;
    await mongoose.connection.db.collection(name).drop();
    res.json({ success: true, message: `Collection ${name} deleted` });
  } catch (error) {
    // Ignore error if it's "ns not found" which means already dropped/doesn't exist
    if (error.codeName === 'NamespaceNotFound') {
        res.json({ success: true, message: `Collection ${name} deleted` });
    } else {
        res.status(500).json({ success: false, error: error.message });
    }
  }
});

// Raw Query on a collection
router.post('/query', async (req, res) => {
  try {
    const { collection, query } = req.body;
    if (!collection || !query) return res.status(400).json({ success: false, error: 'Collection and query required' });
    
    // query is a parsed JSON object
    const result = await mongoose.connection.db.collection(collection).find(query).toArray();
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Insert a document
router.post('/documents/:collection', async (req, res) => {
  try {
    const { collection } = req.params;
    const { document } = req.body;
    if (!document) return res.status(400).json({ success: false, error: 'Document required' });
    
    const result = await mongoose.connection.db.collection(collection).insertOne(document);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete a document
router.delete('/documents/:collection/:id', async (req, res) => {
  try {
    const { collection, id } = req.params;
    const { ObjectId } = require('mongodb');
    const result = await mongoose.connection.db.collection(collection).deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update a document
router.put('/documents/:collection/:id', async (req, res) => {
  try {
    const { collection, id } = req.params;
    const { document } = req.body;
    if (!document) return res.status(400).json({ success: false, error: 'Document required' });
    
    const { ObjectId } = require('mongodb');
    const { _id, ...updatePayload } = document;
    
    const result = await mongoose.connection.db.collection(collection).replaceOne(
      { _id: new ObjectId(id) },
      updatePayload
    );
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
