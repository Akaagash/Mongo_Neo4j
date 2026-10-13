import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function QueryCodeBlock({ code, language = 'cypher' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ position: 'relative', marginTop: '0.75rem', marginBottom: '0.75rem' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.4rem 0.75rem',
        background: '#1e293b',
        borderTopLeftRadius: '6px',
        borderTopRightRadius: '6px',
        borderBottom: '1px solid #334155'
      }}>
        <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
          {language} Executable Query
        </span>
        <button
          onClick={handleCopy}
          style={{
            background: 'transparent',
            border: 'none',
            color: copied ? '#34d399' : '#94a3b8',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            fontSize: '0.7rem'
          }}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <pre className="code-block-container" style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0, margin: 0, maxHeight: '280px', overflowY: 'auto' }}>
        <code>{code}</code>
      </pre>
    </div>
  );
}
