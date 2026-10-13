import React, { useState, useEffect } from 'react';

const XMLNode = ({ node, depth = 0 }) => {
  if (node.nodeType === 3) {
    const text = node.nodeValue.trim();
    return text ? <span style={{ color: '#94a3b8', fontSize: '0.85rem', paddingLeft: '1.5rem', display: 'block' }}>{text}</span> : null;
  }
  
  if (node.nodeType !== 1) return null;

  const isLeaf = node.children.length === 0;
  const hasTextOnly = node.childNodes.length === 1 && node.childNodes[0].nodeType === 3;
  
  let tagColor = '#f43f5e';
  if (node.nodeName === 'MongoDB' || node.nodeName === 'Neo4j') tagColor = '#06b6d4';
  if (node.nodeName === 'Collection' || node.nodeName === 'Nodes' || node.nodeName === 'Relationships') tagColor = '#10b981';
  if (node.nodeName === 'Field' || node.nodeName === 'Property') tagColor = '#8b5cf6';

  return (
    <div style={{ 
      marginLeft: depth > 0 ? '1.5rem' : '0', 
      borderLeft: depth > 0 ? '1px solid rgba(255,255,255,0.1)' : 'none', 
      paddingLeft: depth > 0 ? '0.75rem' : '0', 
      marginTop: '0.25rem',
      fontFamily: 'var(--font-mono)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
        <span style={{ color: tagColor, fontWeight: 600 }}>&lt;{node.nodeName}</span>
        {Array.from(node.attributes).map(attr => (
          <span key={attr.name} style={{ fontSize: '0.85rem' }}>
            <span style={{ color: '#34d399' }}>{attr.name}</span>
            <span style={{ color: '#64748b' }}>=</span>
            <span style={{ color: '#fbbf24' }}>"{attr.value}"</span>
          </span>
        ))}
        <span style={{ color: tagColor, fontWeight: 600 }}>{isLeaf && !hasTextOnly ? '/&gt;' : '&gt;'}</span>
      </div>
      
      {!isLeaf && !hasTextOnly && (
        <div style={{ padding: '0.1rem 0' }}>
          {Array.from(node.childNodes).map((child, idx) => <XMLNode key={idx} node={child} depth={depth + 1} />)}
        </div>
      )}

      {hasTextOnly && (
        <span style={{ color: '#e2e8f0', fontSize: '0.85rem', paddingLeft: '0.5rem' }}>{node.childNodes[0].nodeValue}</span>
      )}
      
      {(!isLeaf || hasTextOnly) && (
        <div style={{ color: tagColor, fontWeight: 600, display: hasTextOnly ? 'inline-block' : 'block' }}>&lt;/{node.nodeName}&gt;</div>
      )}
    </div>
  );
};

export default function ViewDetail() {
  const [parsedSchema, setParsedSchema] = useState(null);
  
  useEffect(() => {
    fetch('/src/data/schema.xml')
      .then(res => res.text())
      .then(text => {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(text, "text/xml");
        setParsedSchema(xmlDoc.documentElement);
      })
      .catch(err => console.error('Failed to load schema', err));
  }, []);

  return (
    <div className="view-detail-container" style={{ padding: '3rem', maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      <div className="schema-section" style={{ background: '#fff', padding: '2rem', borderRadius: '24px', border: '1px solid var(--border-light)', boxShadow: 'var(--card-shadow)' }}>
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.02em' }}>XML Schema</h2>
        
        <div style={{ 
          background: '#0f172a', 
          padding: '1.5rem 2rem', 
          borderRadius: '16px', 
          overflowX: 'auto',
          boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)'
        }}>
          {parsedSchema ? (
            <div style={{ fontSize: '0.9rem', lineHeight: '1.7' }}>
              <XMLNode node={parsedSchema} />
            </div>
          ) : (
            <div style={{ color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>Loading schema...</div>
          )}
        </div>
      </div>
    </div>
  );
}
