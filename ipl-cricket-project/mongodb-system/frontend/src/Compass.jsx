import { useState, useEffect } from 'react';
import './Compass.css';

// Recursive Builder Component
function RecursiveBuilder({ nodes, onChange, isArray = false, level = 0 }) {
  const handleUpdate = (index, field, val) => {
    const updated = [...nodes];
    updated[index] = { ...updated[index], [field]: val };
    
    // Auto-initialize empty array/object when type changes
    if (field === 'type' && (val === 'Object' || val === 'Array')) {
      if (!Array.isArray(updated[index].value)) {
        updated[index].value = [{ key: '', value: '', type: 'String' }];
      }
    } else if (field === 'type' && val !== 'Object' && val !== 'Array') {
      if (Array.isArray(updated[index].value)) {
        updated[index].value = '';
      }
    }
    
    onChange(updated);
  };

  const handleRemove = (index) => {
    const updated = [...nodes];
    updated.splice(index, 1);
    onChange(updated);
  };

  const handleAdd = () => {
    onChange([...nodes, { key: '', value: '', type: 'String' }]);
  };

  const handleChildChange = (index, newChildren) => {
    const updated = [...nodes];
    updated[index] = { ...updated[index], value: newChildren };
    onChange(updated);
  };

  return (
    <div className="recursive-builder" style={{ marginLeft: level > 0 ? '20px' : '0', borderLeft: level > 0 ? '2px solid var(--paper)' : 'none', paddingLeft: level > 0 ? '10px' : '0' }}>
      {nodes.map((node, i) => (
        <div key={i} className="builder-node">
          <div className="field-row">
            {!isArray && (
              <input 
                type="text" 
                placeholder="Key (e.g. $gt, city, score)" 
                value={node.key} 
                onChange={e => handleUpdate(i, 'key', e.target.value)} 
                style={{ flex: 1, minWidth: '150px' }}
              />
            )}
            <select value={node.type} onChange={e => handleUpdate(i, 'type', e.target.value)}>
              <option>String</option>
              <option>Number</option>
              <option>Boolean</option>
              <option>Object</option>
              <option>Array</option>
            </select>
            
            {node.type === 'Boolean' ? (
              <select value={node.value} onChange={e => handleUpdate(i, 'value', e.target.value)} style={{ flex: 1 }}>
                <option value="true">True</option>
                <option value="false">False</option>
                <option value="">(Select)</option>
              </select>
            ) : node.type !== 'Object' && node.type !== 'Array' ? (
              <input 
                type="text" 
                placeholder="Value" 
                value={node.value} 
                onChange={e => handleUpdate(i, 'value', e.target.value)} 
                style={{ flex: 2, minWidth: '150px' }}
              />
            ) : (
              <span className="type-label">{node.type} Items</span>
            )}
            <button className="trash-btn" onClick={() => handleRemove(i)}>✕</button>
          </div>
          
          {(node.type === 'Object' || node.type === 'Array') && Array.isArray(node.value) && (
            <RecursiveBuilder 
              nodes={node.value} 
              onChange={(newChildren) => handleChildChange(i, newChildren)} 
              isArray={node.type === 'Array'}
              level={level + 1}
            />
          )}
        </div>
      ))}
      <button className="compass-btn small add-field-btn" onClick={handleAdd}>
        + Add {isArray ? 'Item' : 'Field'}
      </button>
    </div>
  );
}

// Utility to convert builder nodes to a real JS object
function serializeNodes(nodes, isArray = false) {
  if (isArray) {
    return nodes.map(n => {
      if (n.type === 'Object' || n.type === 'Array') return serializeNodes(n.value, n.type === 'Array');
      if (n.type === 'Number') return Number(n.value);
      if (n.type === 'Boolean') return n.value === 'true';
      return n.value;
    });
  } else {
    const obj = {};
    for (const n of nodes) {
      if (!n.key.trim()) continue;
      if (n.type === 'Object' || n.type === 'Array') {
         obj[n.key] = serializeNodes(n.value, n.type === 'Array');
      } else if (n.type === 'Number') {
         obj[n.key] = Number(n.value);
      } else if (n.type === 'Boolean') {
         obj[n.key] = n.value === 'true';
      } else {
         obj[n.key] = n.value;
      }
    }
    return obj;
  }
}

export default function Compass({ apiUrl, onBack }) {
  const [collections, setCollections] = useState([]);
  const [activeCollection, setActiveCollection] = useState('');
  const [documents, setDocuments] = useState([]);
  
  // Visual Query State
  const [queryNodes, setQueryNodes] = useState([]);
  const [queryError, setQueryError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Modals
  const [showAddCollection, setShowAddCollection] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  
  const [showAddDocument, setShowAddDocument] = useState(false);
  const [newDocNodes, setNewDocNodes] = useState([{ key: '', value: '', type: 'String' }]);
  
  const [showExecutionResult, setShowExecutionResult] = useState(false);
  const [executionLog, setExecutionLog] = useState('');

  // Fetch Collections
  useEffect(() => {
    fetchCollections();
  }, []);

  useEffect(() => {
    if (activeCollection) {
      runQuery(); // default fetch all
    }
  }, [activeCollection]);

  const fetchCollections = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/compass/collections`);
      const payload = await res.json();
      if (payload.success) {
        setCollections(payload.data);
        if (payload.data.length > 0 && !activeCollection) {
          setActiveCollection(payload.data[0]);
        }
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleCreateCollection = async () => {
    if (!newCollectionName) return;
    try {
      const res = await fetch(`${apiUrl}/api/compass/collections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCollectionName })
      });
      const payload = await res.json();
      if (payload.success) {
        setExecutionLog(`db.createCollection("${newCollectionName}")\n\nResult: Success`);
        setShowExecutionResult(true);
        setNewCollectionName('');
        setShowAddCollection(false);
        fetchCollections();
      } else {
        alert(payload.error);
      }
    } catch (e) {
      alert(e.message);
    }
  };

  const handleDeleteCollection = async (name) => {
    if (!confirm(`Are you sure you want to drop collection ${name}?`)) return;
    try {
      const res = await fetch(`${apiUrl}/api/compass/collections/${name}`, { method: 'DELETE' });
      const payload = await res.json();
      if (payload.success) {
        setExecutionLog(`db.${name}.drop()\n\nResult: Success`);
        setShowExecutionResult(true);
        if (activeCollection === name) setActiveCollection('');
        fetchCollections();
      }
    } catch (e) {
      alert(e.message);
    }
  };

  const runQuery = async () => {
    setLoading(true);
    setQueryError('');
    try {
      const parsedQuery = serializeNodes(queryNodes);

      const res = await fetch(`${apiUrl}/api/compass/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collection: activeCollection, query: parsedQuery })
      });
      const payload = await res.json();
      if (payload.success) {
        setDocuments(payload.data);
      } else {
        throw new Error(payload.error);
      }
    } catch (e) {
      setQueryError(e.message);
    }
    setLoading(false);
  };

  const handleDeleteDocument = async (id) => {
    if (!confirm('Delete this document?')) return;
    try {
      const res = await fetch(`${apiUrl}/api/compass/documents/${activeCollection}/${id}`, { method: 'DELETE' });
      const payload = await res.json();
      if (payload.success) {
        setExecutionLog(`db.${activeCollection}.deleteOne({ _id: ObjectId("${id}") })\n\nResult: Success`);
        setShowExecutionResult(true);
        runQuery(); // refresh
      }
    } catch (e) {
      alert(e.message);
    }
  };

  const handleSaveDocument = async () => {
    const docToSave = serializeNodes(newDocNodes);
    if (Object.keys(docToSave).length === 0) {
      alert("Document cannot be empty");
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/api/compass/documents/${activeCollection}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ document: docToSave })
      });
      const payload = await res.json();
      if (payload.success) {
        setExecutionLog(`db.${activeCollection}.insertOne(${JSON.stringify(docToSave, null, 2)})\n\nResult: Success`);
        setShowExecutionResult(true);
        setShowAddDocument(false);
        setNewDocNodes([{ key: '', value: '', type: 'String' }]);
        runQuery();
      } else {
        alert(payload.error);
      }
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="compass-layout">
      <div className="compass-sidebar">
        <div className="sidebar-header">
          <h3>Collections</h3>
          <button className="compass-btn small" onClick={() => setShowAddCollection(true)}>+</button>
        </div>
        <ul className="collection-list">
          {collections.map(c => (
            <li key={c} className={c === activeCollection ? 'active' : ''}>
              <span onClick={() => setActiveCollection(c)}>{c}</span>
              <button className="trash-btn" onClick={() => handleDeleteCollection(c)}>✕</button>
            </li>
          ))}
        </ul>
      </div>

      <div className="compass-main">
        <div className="compass-topbar">
          <h2>{activeCollection || 'Select a collection'}</h2>
          <div className="actions">
            <button className="compass-btn" onClick={() => setShowAddDocument(true)} disabled={!activeCollection}>+ Add Data</button>
            <button className="compass-btn secondary" onClick={onBack}>Back to Home</button>
          </div>
        </div>

        {activeCollection && (
          <div className="compass-workspace">
            <div className="query-builder">
              <label>Visual Filter Builder</label>
              <div className="builder-container" style={{ padding: '15px', background: '#fff', border: '1px solid var(--paper)', borderRadius: '4px', marginBottom: '15px' }}>
                <RecursiveBuilder nodes={queryNodes} onChange={setQueryNodes} />
              </div>
              {queryError && <div className="query-error">Error: {queryError}</div>}
              <button className="compass-btn" onClick={runQuery} disabled={loading}>
                {loading ? 'Running...' : 'Find Documents'}
              </button>
            </div>

            <div className="documents-view">
              <div className="doc-meta">{documents.length} Documents matched</div>
              <div className="doc-list">
                {documents.map(doc => (
                  <div key={doc._id} className="document-card">
                    <div className="doc-actions">
                      <button className="trash-btn" onClick={() => handleDeleteDocument(doc._id)}>Delete</button>
                    </div>
                    <pre>{JSON.stringify(doc, null, 2)}</pre>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddCollection && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Create Collection</h3>
              <button className="exit-btn" onClick={() => setShowAddCollection(false)}>✕</button>
            </div>
            <div className="modal-body">
              <input 
                type="text" 
                placeholder="Collection Name" 
                value={newCollectionName} 
                onChange={e => setNewCollectionName(e.target.value)} 
              />
              <div className="modal-actions">
                <button className="compass-btn" onClick={handleCreateCollection}>Create</button>
                <button className="compass-btn secondary" onClick={() => setShowAddCollection(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddDocument && (
        <div className="modal-overlay">
          <div className="modal large-modal">
            <div className="modal-header">
              <h3>Insert Document</h3>
              <button className="exit-btn" onClick={() => setShowAddDocument(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="builder-container" style={{ padding: '15px', background: '#fcfcfc', border: '1px solid var(--paper)', borderRadius: '4px', marginBottom: '15px', maxHeight: '50vh', overflowY: 'auto' }}>
                <RecursiveBuilder nodes={newDocNodes} onChange={setNewDocNodes} />
              </div>
              <div className="modal-actions">
                <button className="compass-btn" onClick={handleSaveDocument}>Insert</button>
                <button className="compass-btn secondary" onClick={() => setShowAddDocument(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showExecutionResult && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Execution Result</h3>
              <button className="exit-btn" onClick={() => setShowExecutionResult(false)}>✕</button>
            </div>
            <div className="modal-body">
              <pre className="execution-log">{executionLog}</pre>
              <div className="modal-actions">
                <button className="compass-btn" onClick={() => setShowExecutionResult(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

