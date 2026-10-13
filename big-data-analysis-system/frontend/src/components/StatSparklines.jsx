import React from 'react';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';
import QueryCodeBlock from './QueryCodeBlock';

const sparklineData1 = [
  { v: 10 }, { v: 14 }, { v: 12 }, { v: 22 }, { v: 18 }, { v: 28 }, { v: 24 }, { v: 34 }, { v: 30 }, { v: 42 }
];

const sparklineData2 = [
  { v: 98.2 }, { v: 98.5 }, { v: 98.4 }, { v: 99.1 }, { v: 98.9 }, { v: 99.4 }, { v: 99.6 }, { v: 99.84 }
];

const sparklineData3 = [
  { v: 45 }, { v: 38 }, { v: 40 }, { v: 28 }, { v: 32 }, { v: 24 }, { v: 20 }, { v: 18 }
];

export default function StatSparklines({ overviewData, meta, isDetail = false }) {
  const volume = overviewData?.volume || {};
  const veracity = overviewData?.veracity || {};
  const total = volume.total_records || 12187;

  if (isDetail) {
    return (
      <div className="clean-card">
        <div className="clean-card-header">
          <span className="clean-card-title">Real-Time Ingestion & Veracity Pipeline Execution</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Extraction Engines</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginTop: '0.2rem' }}>MongoDB Atlas + Neo4j Aura</div>
          </div>
          <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Execution Latency</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#059669', marginTop: '0.2rem', fontFamily: 'var(--font-mono)' }}>
              {meta?.execution_stats?.latency_ms || 18} ms
            </div>
          </div>
          <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Cluster Shards</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#2563eb', marginTop: '0.2rem', fontFamily: 'var(--font-mono)' }}>
              3 Replica Shards + 1 Graph Leader
            </div>
          </div>
        </div>
        <QueryCodeBlock
          code={meta?.raw_query || '// Concurrent Multi-Engine Verification\ndb.deliveries.countDocuments({})\nMATCH (n) RETURN count(n);'}
          language="Federation Pipeline"
        />
      </div>
    );
  }

  return (
    <div className="sparkline-row">
      {/* Card 1: Real-time Telemetry Volume */}
      <div className="stat-sparkline-card">
        <div>
          <div className="sparkline-header">
            <span className="sparkline-label">Real-time Telemetry</span>
            <span className="sparkline-badge">+12.4%</span>
          </div>
          <div className="sparkline-value">{total.toLocaleString()}</div>
        </div>
        <div className="sparkline-chart-area">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparklineData1}>
              <defs>
                <linearGradient id="sparkGrad1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="v" stroke="#10b981" strokeWidth={2} fill="url(#sparkGrad1)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Card 2: Hawk-Eye Veracity */}
      <div className="stat-sparkline-card">
        <div>
          <div className="sparkline-header">
            <span className="sparkline-label">Hawk-Eye Veracity</span>
            <span className="sparkline-badge">+0.4%</span>
          </div>
          <div className="sparkline-value">{veracity.sensor_confidence_avg || '99.84%'}</div>
        </div>
        <div className="sparkline-chart-area">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparklineData2}>
              <defs>
                <linearGradient id="sparkGrad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="v" stroke="#3b82f6" strokeWidth={2} fill="url(#sparkGrad2)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Card 3: Query Latency */}
      <div className="stat-sparkline-card">
        <div>
          <div className="sparkline-header">
            <span className="sparkline-label">Cluster Query Latency</span>
            <span className="sparkline-badge" style={{ background: '#eff6ff', color: '#2563eb' }}>-15%</span>
          </div>
          <div className="sparkline-value">{meta?.execution_stats?.latency_ms || 18} ms</div>
        </div>
        <div className="sparkline-chart-area">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparklineData3}>
              <defs>
                <linearGradient id="sparkGrad3" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fb7185" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#fb7185" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="v" stroke="#fb7185" strokeWidth={2} fill="url(#sparkGrad3)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
