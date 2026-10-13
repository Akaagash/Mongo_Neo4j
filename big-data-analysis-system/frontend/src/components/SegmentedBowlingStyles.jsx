import React from 'react';
import { Layers } from 'lucide-react';
import QueryCodeBlock from './QueryCodeBlock';

export default function SegmentedBowlingStyles({ deliveryData, meta, isDetail = false }) {
  const styles = [
    { label: 'Right-Arm Fast', pct: 48, count: '5,760', avgSpeed: '141.2 km/h', dotPct: '42.4%', wickets: 184, color: '#fb7185' },
    { label: 'Left-Arm Fast', pct: 22, count: '2,640', avgSpeed: '137.8 km/h', dotPct: '40.1%', wickets: 96, color: '#34d399' },
    { label: 'Right-Arm Off-Spin', pct: 16, count: '1,920', avgSpeed: '92.5 km/h', dotPct: '36.8%', wickets: 64, color: '#fb923c' },
    { label: 'Leg-Spin / Wrist', pct: 14, count: '1,680', avgSpeed: '88.4 km/h', dotPct: '38.5%', wickets: 72, color: '#818cf8' }
  ];

  if (isDetail) {
    return (
      <div className="clean-card">
        <div className="clean-card-header">
          <span className="clean-card-title">Bowler Style Distribution Query</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <span className="mono-tag" style={{ background: '#eff6ff', color: '#2563eb', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600 }}>
            MongoDB Aggregation Pipeline
          </span>
          <span style={{ color: '#2563eb', fontWeight: 600, fontSize: '0.78rem' }}>db.deliveries.aggregate()</span>
        </div>
        <QueryCodeBlock
          code={`db.deliveries.aggregate([
  {
    $group: {
      _id: "$bowler_type",
      deliveries: { $sum: 1 },
      wickets: { $sum: { $cond: ["$is_wicket", 1, 0] } },
      avg_speed: { $avg: "$release_speed_kph" },
      dot_balls: { $sum: { $cond: [{ $eq: ["$runs_batter", 0] }, 1, 0] } }
    }
  },
  { $sort: { deliveries: -1 } }
]);`}
          language="MQL"
        />
      </div>
    );
  }

  return (
    <div className="clean-card">
      <div className="clean-card-header">
        <div>
          <span className="clean-card-title">Bowling Variations Telemetry</span>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
            Release dynamics across 12,000 tracked deliveries
          </div>
        </div>
        <span style={{ fontSize: '0.72rem', fontWeight: 600, padding: '0.2rem 0.55rem', borderRadius: '6px', background: '#ecfdf5', color: '#059669' }}>
          12,000 Balls Logged
        </span>
      </div>

      {/* Segmented Horizontal Pill Bar matching mockup */}
      <div className="segmented-bar" style={{ margin: '1rem 0' }}>
        {styles.map((st, idx) => (
          <div
            key={idx}
            className="segment-item"
            style={{
              width: `${st.pct}%`,
              backgroundColor: st.color
            }}
            title={`${st.label}: ${st.pct}%`}
          />
        ))}
      </div>

      {/* 4 Detailed Telemetry Grid Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginTop: '1rem' }}>
        {styles.map((st, idx) => (
          <div
            key={idx}
            style={{
              padding: '0.85rem',
              borderRadius: '12px',
              background: '#f8fafc',
              border: '1px solid var(--border-light)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.3rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: st.color }} />
              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {st.label}
              </span>
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
              {st.pct}%
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
              {st.count} balls • {st.wickets} wkts
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-light)', fontFamily: 'var(--font-mono)' }}>
              {st.avgSpeed} avg
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
