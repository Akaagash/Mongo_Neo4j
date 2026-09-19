import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import './Browser.css';

// Syntax Highlighter
function syntaxHighlight(json) {
  if (typeof json != 'string') {
    json = JSON.stringify(json, undefined, 2);
  }
  json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
    let cls = 'json-value';
    if (/^"/.test(match)) {
      if (/:$/.test(match)) {
        cls = 'json-key';
      } else {
        cls = 'json-string';
      }
    } else if (/true|false/.test(match)) {
      cls = 'json-boolean';
    } else if (/null/.test(match)) {
      cls = 'json-null';
    } else {
      cls = 'json-number';
    }
    return '<span class="' + cls + '">' + match + '</span>';
  });
}

// Simple force-directed graph layout
function useForceLayout(nodes, relationships, width, height) {
  const [positions, setPositions] = useState([]);
  const animRef = useRef(null);

  useEffect(() => {
    if (!nodes.length) { setPositions([]); return; }

    const pos = nodes.map((n, i) => ({
      id: n.id,
      x: width / 2 + (Math.cos(i * 2 * Math.PI / nodes.length) * Math.min(width, height) * 0.3),
      y: height / 2 + (Math.sin(i * 2 * Math.PI / nodes.length) * Math.min(width, height) * 0.3),
      vx: 0, vy: 0
    }));

    let iteration = 0;
    const maxIterations = 200;

    function simulate() {
      if (iteration >= maxIterations) return;
      iteration++;

      // Repulsion between nodes
      for (let i = 0; i < pos.length; i++) {
        for (let j = i + 1; j < pos.length; j++) {
          const dx = pos[j].x - pos[i].x;
          const dy = pos[j].y - pos[i].y;
          const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
          const force = 8000 / (dist * dist);
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          pos[i].vx -= fx; pos[i].vy -= fy;
          pos[j].vx += fx; pos[j].vy += fy;
        }
      }

      // Attraction along edges
      relationships.forEach(rel => {
        const source = pos.find(p => p.id === rel.source);
        const target = pos.find(p => p.id === rel.target);
        if (!source || !target) return;
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
        const force = (dist - 150) * 0.02;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        source.vx += fx; source.vy += fy;
        target.vx -= fx; target.vy -= fy;
      });

      // Center gravity
      pos.forEach(p => {
        p.vx += (width / 2 - p.x) * 0.005;
        p.vy += (height / 2 - p.y) * 0.005;
      });

      // Apply velocities with damping
      const damping = 0.85;
      pos.forEach(p => {
        p.vx *= damping; p.vy *= damping;
        p.x += p.vx; p.y += p.vy;
        // Clamp within bounds
        p.x = Math.max(60, Math.min(width - 60, p.x));
        p.y = Math.max(60, Math.min(height - 60, p.y));
      });

      setPositions([...pos]);
      animRef.current = requestAnimationFrame(simulate);
    }

    animRef.current = requestAnimationFrame(simulate);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [nodes, relationships, width, height]);

  return positions;
}

// Color palette for different labels
const LABEL_COLORS = {
  Team: '#11698e',
  City: '#06b6d4',
  Player: '#8b5cf6',
  Stadium: '#f59e0b',
  default: '#6b7394'
};

function getLabelColor(labels) {
  if (!labels || !labels.length) return LABEL_COLORS.default;
  for (const l of labels) {
    if (LABEL_COLORS[l]) return LABEL_COLORS[l];
  }
  return LABEL_COLORS.default;
}

// Graph Visualization Component
function GraphView({ graphData, onNodeClick }) {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });

  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDimensions({ width: rect.width || 800, height: 500 });
    }
  }, [graphData]);

  const { nodes, relationships } = graphData;
  const positions = useForceLayout(nodes, relationships, dimensions.width, dimensions.height);

  const uniqueLabels = [...new Set(nodes.flatMap(n => n.labels || []))];

  return (
    <div className="graph-container" ref={containerRef} style={{ height: '500px' }}>
      <svg width={dimensions.width} height={500} viewBox={`0 0 ${dimensions.width} 500`}>
        {/* Draw relationships */}
        {relationships.map((rel, i) => {
          const source = positions.find(p => p.id === rel.source);
          const target = positions.find(p => p.id === rel.target);
          if (!source || !target) return null;
          const midX = (source.x + target.x) / 2;
          const midY = (source.y + target.y) / 2;
          return (
            <g key={`rel-${i}`}>
              <line
                className="graph-link"
                x1={source.x} y1={source.y}
                x2={target.x} y2={target.y}
                stroke="#d8dce8"
                strokeWidth={1.5}
                markerEnd="url(#arrowhead)"
              />
              <text className="graph-link-label" x={midX} y={midY - 5} textAnchor="middle">
                {rel.type}
              </text>
            </g>
          );
        })}

        {/* Arrow marker */}
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#9ca3af" />
          </marker>
        </defs>

        {/* Draw nodes */}
        {positions.map((pos) => {
          const node = nodes.find(n => n.id === pos.id);
          if (!node) return null;
          const color = getLabelColor(node.labels);
          const displayName = node.properties?.name || node.labels?.[0] || 'Node';
          return (
            <g key={pos.id} className="graph-node" transform={`translate(${pos.x}, ${pos.y})`} onClick={() => onNodeClick && onNodeClick(node)}>
              <circle r="22" fill={color} stroke="#fff" strokeWidth="2" />
              <text dy="4" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="700">
                {displayName.length > 8 ? displayName.substring(0, 7) + '..' : displayName}
              </text>
              <title>{displayName} ({node.labels?.join(', ')})</title>
            </g>
          );
        })}
      </svg>

      <div className="graph-legend">
        {uniqueLabels.map(label => (
          <div className="graph-legend-item" key={label}>
            <div className="graph-legend-dot" style={{ background: LABEL_COLORS[label] || LABEL_COLORS.default }} />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Property Builder for creating nodes
function PropertyBuilder({ fields, onChange }) {
  const handleUpdate = (index, key, val) => {
    const updated = [...fields];
    updated[index] = { ...updated[index], [key]: val };
    onChange(updated);
  };

  const handleRemove = (index) => {
    const updated = [...fields];
    updated.splice(index, 1);
    onChange(updated);
  };

  const handleAdd = () => {
    onChange([...fields, { key: '', value: '', type: 'String' }]);
  };

  return (
    <div>
      {fields.map((f, i) => (
        <div key={i} className="field-row">
          <input type="text" placeholder="Key" value={f.key} onChange={e => handleUpdate(i, 'key', e.target.value)} style={{ flex: 1 }} />
          <select value={f.type} onChange={e => handleUpdate(i, 'type', e.target.value)}>
            <option>String</option>
            <option>Number</option>
            <option>Boolean</option>
          </select>
          {f.type === 'Boolean' ? (
            <select value={f.value} onChange={e => handleUpdate(i, 'value', e.target.value)} style={{ flex: 1 }}>
              <option value="true">True</option>
              <option value="false">False</option>
              <option value="">(Select)</option>
            </select>
          ) : (
            <input type="text" placeholder="Value" value={f.value} onChange={e => handleUpdate(i, 'value', e.target.value)} style={{ flex: 2 }} />
          )}
          <button className="trash-btn" onClick={() => handleRemove(i)}>&#x2715;</button>
        </div>
      ))}
      <button className="browser-btn small" onClick={handleAdd} style={{ marginTop: '8px' }}>+ Add Property</button>
    </div>
  );
}

function serializeFields(fields) {
  const obj = {};
  for (const f of fields) {
    if (!f.key.trim()) continue;
    if (f.type === 'Number') obj[f.key] = Number(f.value);
    else if (f.type === 'Boolean') obj[f.key] = f.value === 'true';
    else obj[f.key] = f.value;
  }
  return obj;
}

export default function Browser({ apiUrl, onBack }) {
  const [labels, setLabels] = useState([]);
  const [activeLabel, setActiveLabel] = useState('');
  const [nodes, setNodes] = useState([]);
  const [graphData, setGraphData] = useState({ nodes: [], relationships: [] });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'graph' | 'cypher'
  const [listFilter, setListFilter] = useState('');
  
  const filteredNodes = useMemo(() => {
    if (!listFilter.trim()) return nodes;
    const lowerQuery = listFilter.toLowerCase();
    return nodes.filter(node => JSON.stringify(node).toLowerCase().includes(lowerQuery));
  }, [nodes, listFilter]);
  
  // Cypher
  const [cypherQuery, setCypherQuery] = useState('');
  const [cypherResults, setCypherResults] = useState([]);
  const [cypherFilter, setCypherFilter] = useState('');
  const [queryError, setQueryError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const filteredCypherResults = useMemo(() => {
    if (!cypherFilter.trim()) return cypherResults;
    const lowerQuery = cypherFilter.toLowerCase();
    return cypherResults.filter(row => JSON.stringify(row).toLowerCase().includes(lowerQuery));
  }, [cypherResults, cypherFilter]);
  
  // Modals
  const [showAddLabel, setShowAddLabel] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  
  const [showAddNode, setShowAddNode] = useState(false);
  const [newNodeFields, setNewNodeFields] = useState([{ key: '', value: '', type: 'String' }]);
  
  const [editingNodeId, setEditingNodeId] = useState(null);
  const [editingNodeText, setEditingNodeText] = useState('');
  
  const [showExecutionResult, setShowExecutionResult] = useState(false);
  const [executionLog, setExecutionLog] = useState('');

  useEffect(() => { fetchLabels(); }, []);
  
  useEffect(() => {
    if (activeLabel) {
      fetchNodes();
      fetchGraph();
    }
  }, [activeLabel]);

  const fetchLabels = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/browser/labels`);
      const payload = await res.json();
      if (payload.success) {
        setLabels(payload.data);
        if (payload.data.length > 0 && !activeLabel) {
          setActiveLabel(payload.data[0]);
        }
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const fetchNodes = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/browser/nodes/${activeLabel}`);
      const payload = await res.json();
      if (payload.success) setNodes(payload.data);
    } catch (e) { console.error(e); }
  };

  const fetchGraph = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/browser/graph/${activeLabel}`);
      const payload = await res.json();
      if (payload.success) setGraphData(payload.data);
    } catch (e) { console.error(e); }
  };

  const handleCreateLabel = async () => {
    if (!newLabelName) return;
    try {
      const res = await fetch(`${apiUrl}/api/browser/labels`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newLabelName })
      });
      const payload = await res.json();
      if (payload.success) {
        setExecutionLog(`CREATE (n:${newLabelName})\n\nResult: Success - Empty node created with label "${newLabelName}"`);
        setShowExecutionResult(true);
        setNewLabelName('');
        setShowAddLabel(false);
        fetchLabels();
      } else { alert(payload.error); }
    } catch (e) { alert(e.message); }
  };

  const handleDeleteLabel = async (name) => {
    if (!confirm(`Delete ALL nodes with label "${name}"?`)) return;
    try {
      const res = await fetch(`${apiUrl}/api/browser/labels/${name}`, { method: 'DELETE' });
      const payload = await res.json();
      if (payload.success) {
        setExecutionLog(`MATCH (n:${name}) DETACH DELETE n\n\nResult: Success`);
        setShowExecutionResult(true);
        if (activeLabel === name) { setActiveLabel(''); setNodes([]); setGraphData({ nodes: [], relationships: [] }); }
        fetchLabels();
      }
    } catch (e) { alert(e.message); }
  };

  const handleRunCypher = async () => {
    if (!cypherQuery.trim()) return;
    setLoading(true);
    setQueryError('');
    try {
      const res = await fetch(`${apiUrl}/api/browser/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cypher: cypherQuery })
      });
      const payload = await res.json();
      if (payload.success) {
        setCypherResults(payload.data);
        setExecutionLog(`${cypherQuery}\n\nResult: Success (${payload.data.length} records returned)`);
        setShowExecutionResult(true);
      } else { throw new Error(payload.error); }
    } catch (e) { setQueryError(e.message); }
    setLoading(false);
  };

  const handleCreateNode = async () => {
    const props = serializeFields(newNodeFields);
    if (Object.keys(props).length === 0) { alert('Node must have at least one property'); return; }
    try {
      const res = await fetch(`${apiUrl}/api/browser/nodes/${activeLabel}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ properties: props })
      });
      const payload = await res.json();
      if (payload.success) {
        setExecutionLog(`CREATE (n:${activeLabel} ${JSON.stringify(props, null, 2)})\n\nResult: Success`);
        setShowExecutionResult(true);
        setShowAddNode(false);
        setNewNodeFields([{ key: '', value: '', type: 'String' }]);
        fetchNodes();
        fetchGraph();
      } else { alert(payload.error); }
    } catch (e) { alert(e.message); }
  };

  const handleDeleteNode = async (id) => {
    if (!confirm('Delete this node?')) return;
    try {
      const res = await fetch(`${apiUrl}/api/browser/nodes/${id}`, { method: 'DELETE' });
      const payload = await res.json();
      if (payload.success) {
        setExecutionLog(`MATCH (n) WHERE id(n) = ${id} DETACH DELETE n\n\nResult: Success`);
        setShowExecutionResult(true);
        fetchNodes();
        fetchGraph();
      }
    } catch (e) { alert(e.message); }
  };

  const handleUpdateNode = async (id) => {
    try {
      const parsed = JSON.parse(editingNodeText);
      const { _id, _labels, ...props } = parsed;
      const res = await fetch(`${apiUrl}/api/browser/nodes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ properties: props })
      });
      const payload = await res.json();
      if (payload.success) {
        setExecutionLog(`MATCH (n) WHERE id(n) = ${id}\nSET n = ${JSON.stringify(props, null, 2)}\n\nResult: Success`);
        setShowExecutionResult(true);
        setEditingNodeId(null);
        fetchNodes();
        fetchGraph();
      } else { alert(payload.error); }
    } catch (e) { alert('Invalid JSON: ' + e.message); }
  };

  return (
    <div className="browser-layout">
      <div className={`browser-sidebar ${!isSidebarOpen ? 'collapsed' : ''}`}>
        <div className="sidebar-header" style={{ padding: '15px' }}>
          {isSidebarOpen ? (
            <>
              <h3>Labels</h3>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button className="browser-btn small secondary icon-btn" onClick={fetchLabels} title="Refresh Labels">&#x21BB;</button>
                <button className="browser-btn small icon-btn" onClick={() => setShowAddLabel(true)} title="Add Label">+</button>
                <button className="browser-btn small secondary icon-btn" onClick={() => setIsSidebarOpen(false)} title="Collapse">&#x2039;</button>
              </div>
            </>
          ) : (
            <button className="browser-btn small secondary" onClick={() => setIsSidebarOpen(true)} title="Open Sidebar" style={{ fontSize: '16px' }}>&#x2630;</button>
          )}
        </div>
        {isSidebarOpen && (
          <ul className="label-list">
            {labels.map(l => (
              <li key={l} className={l === activeLabel ? 'active' : ''}>
                <span onClick={() => setActiveLabel(l)}>{l}</span>
                <button className="trash-btn" onClick={() => handleDeleteLabel(l)}>&#x2715;</button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="browser-main">
        <div className="browser-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <h2>{activeLabel ? `:${activeLabel}` : 'Select a label'}</h2>
            {activeLabel && (
              <div className="view-toggle">
                <button className={viewMode === 'list' ? 'active' : ''} onClick={() => setViewMode('list')}>List</button>
                <button className={viewMode === 'graph' ? 'active' : ''} onClick={() => setViewMode('graph')}>Graph</button>
                <button className={viewMode === 'cypher' ? 'active' : ''} onClick={() => setViewMode('cypher')}>Cypher</button>
              </div>
            )}
          </div>
          <div className="actions">
            <button className="browser-btn secondary" onClick={() => { fetchNodes(); fetchGraph(); }} title="Refresh">&#x21BB; Refresh</button>
            <button className="browser-btn" onClick={() => setShowAddNode(true)} disabled={!activeLabel}>+ Add Node</button>
            <button className="browser-btn secondary" onClick={onBack}>Back to Home</button>
          </div>
        </div>

        {activeLabel && (
          <div className="browser-workspace">
            {/* Cypher Query Mode */}
            {viewMode === 'cypher' && (
              <div className="query-builder">
                <label>Cypher Query</label>
                <textarea
                  value={cypherQuery}
                  onChange={e => setCypherQuery(e.target.value)}
                  placeholder={`MATCH (n:${activeLabel}) RETURN n LIMIT 25`}
                />
                {queryError && <div className="query-error">Error: {queryError}</div>}
                <button className="browser-btn" onClick={handleRunCypher} disabled={loading}>
                  {loading ? 'Running...' : 'Execute Cypher'}
                </button>
                
                {cypherResults.length > 0 && (
                  <div className="documents-view" style={{ marginTop: '15px' }}>
                    <div className="doc-meta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{cypherResults.length} Records returned</span>
                      <input 
                        type="search" 
                        placeholder="Filter results..." 
                        value={cypherFilter}
                        onChange={e => setCypherFilter(e.target.value)}
                        style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid var(--accent)', background: 'var(--paper)', color: 'var(--ink)' }}
                      />
                    </div>
                    <div className="doc-list">
                      {filteredCypherResults.map((row, i) => (
                        <div key={i} className="document-card">
                          <pre dangerouslySetInnerHTML={{ __html: syntaxHighlight(row) }}></pre>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Graph View */}
            {viewMode === 'graph' && (
              <GraphView graphData={graphData} onNodeClick={(node) => {
                const doc = nodes.find(n => n._id === node.id);
                if (doc) {
                  setEditingNodeId(null);
                }
              }} />
            )}

            {/* List View */}
            {viewMode === 'list' && (
              <div className="documents-view">
                <div className="doc-meta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{nodes.length} Nodes with label :{activeLabel}</span>
                  <input 
                    type="search" 
                    placeholder="Filter nodes..." 
                    value={listFilter}
                    onChange={e => setListFilter(e.target.value)}
                    style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid var(--accent)', background: 'var(--paper)', color: 'var(--ink)' }}
                  />
                </div>
                <div className="doc-list">
                  {filteredNodes.map(node => (
                    <div key={node._id} className="document-card">
                      <div className="doc-actions">
                        {editingNodeId === node._id ? (
                          <>
                            <button className="browser-btn small" style={{ marginRight: '5px' }} onClick={() => handleUpdateNode(node._id)}>Save</button>
                            <button className="browser-btn small secondary" onClick={() => setEditingNodeId(null)}>Cancel</button>
                          </>
                        ) : (
                          <>
                            <button className="browser-btn small secondary" style={{ marginRight: '5px' }} onClick={() => { setEditingNodeId(node._id); setEditingNodeText(JSON.stringify(node, null, 2)); }}>Edit</button>
                            <button className="trash-btn" onClick={() => handleDeleteNode(node._id)}>Delete</button>
                          </>
                        )}
                      </div>
                      {editingNodeId === node._id ? (
                        <textarea
                          value={editingNodeText}
                          onChange={(e) => setEditingNodeText(e.target.value)}
                          style={{ width: '100%', minHeight: '300px', fontFamily: 'monospace', padding: '10px', marginTop: '10px', border: '1px solid var(--accent)' }}
                        />
                      ) : (
                        <pre dangerouslySetInnerHTML={{ __html: syntaxHighlight(node) }}></pre>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Label Modal */}
      {showAddLabel && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Create Label</h3>
              <button className="exit-btn" onClick={() => setShowAddLabel(false)}>&#x2715;</button>
            </div>
            <div className="modal-body">
              <input type="text" placeholder="Label Name (e.g. Player, Stadium)" value={newLabelName} onChange={e => setNewLabelName(e.target.value)} />
              <div className="modal-actions">
                <button className="browser-btn" onClick={handleCreateLabel}>Create</button>
                <button className="browser-btn secondary" onClick={() => setShowAddLabel(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Node Modal */}
      {showAddNode && (
        <div className="modal-overlay">
          <div className="modal large-modal">
            <div className="modal-header">
              <h3>Create Node (:{activeLabel})</h3>
              <button className="exit-btn" onClick={() => setShowAddNode(false)}>&#x2715;</button>
            </div>
            <div className="modal-body">
              <div style={{ maxHeight: '50vh', overflowY: 'auto' }}>
                <PropertyBuilder fields={newNodeFields} onChange={setNewNodeFields} />
              </div>
              <div className="modal-actions">
                <button className="browser-btn" onClick={handleCreateNode}>Create Node</button>
                <button className="browser-btn secondary" onClick={() => setShowAddNode(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Execution Result Modal */}
      {showExecutionResult && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Execution Result</h3>
              <button className="exit-btn" onClick={() => setShowExecutionResult(false)}>&#x2715;</button>
            </div>
            <div className="modal-body">
              <pre className="execution-log">{executionLog}</pre>
              <div className="modal-actions">
                <button className="browser-btn" onClick={() => setShowExecutionResult(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
