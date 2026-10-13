import React, { useState } from 'react';
import QueryCodeBlock from './QueryCodeBlock';

export default function CapsulePillarsChart({ deliveryData, meta, isDetail = false }) {
  const [activeTab, setActiveTab] = useState('Deliveries'); // 'Deliveries' | 'Wickets' | 'Economy'
  const lengths = deliveryData?.lengths || [];

  // Default values if data not yet loaded
  const pillars = [
    { label: 'Yorker', count: 1840, wickets: 172, economy: 6.84, pct: 65, color: '#fb7185' },
    { label: 'Full', count: 3260, wickets: 148, economy: 8.92, pct: 85, color: '#34d399' },
    { label: 'Good Length', count: 4420, wickets: 246, economy: 7.21, pct: 95, color: '#fb7185' },
    { label: 'Back of Length', count: 1540, wickets: 88, economy: 8.14, pct: 55, color: '#34d399' },
    { label: 'Short', count: 940, wickets: 66, economy: 9.45, pct: 40, color: '#fb7185' }
  ];

  if (isDetail) {
    return (
      <div className="clean-card">
        <div className="clean-card-header">
          <span className="clean-card-title">Delivery Length Kinematics Query Blueprint</span>
        </div>
        <div style={{ padding: '0.5rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '0.75rem', fontSize: '0.75rem' }}>
          <span style={{ fontWeight: 600, color: '#0f172a' }}>Engine: MongoDB Compound Index Scan</span>
          <div style={{ color: '#2563eb', marginTop: '0.1rem' }}>Index: {'{ delivery_length: 1, speed_bracket: 1 }'}</div>
        </div>
        <QueryCodeBlock
          code={`db.deliveries.aggregate([
  {
    $group: {
      _id: "$delivery_length",
      deliveries: { $sum: 1 },
      wickets: { $sum: { $cond: ["$is_wicket", 1, 0] } },
      economy: { $round: [{ $multiply: [{ $divide: ["$total_runs", { $cond: [{ $eq: ["$deliveries", 0] }, 1, "$deliveries"] }] }, 6] }, 2] }
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
        <span className="clean-card-title">Delivery Length Dynamics</span>
        <div style={{ display: 'flex', gap: '0.35rem', background: '#f1f5f9', padding: '0.2rem', borderRadius: '10px' }}>
          {['Deliveries', 'Wickets', 'Economy'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                border: 'none',
                background: activeTab === tab ? '#ffffff' : 'transparent',
                color: activeTab === tab ? 'var(--text-main)' : 'var(--text-muted)',
                fontWeight: activeTab === tab ? 600 : 500,
                fontSize: '0.72rem',
                padding: '0.25rem 0.65rem',
                borderRadius: '8px',
                cursor: 'pointer',
                boxShadow: activeTab === tab ? '0 1px 3px rgba(0,0,0,0.05)' : 'none'
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Capsule Pillars matching mockup */}
      <div className="capsule-pillars-container">
        {pillars.map((item, idx) => {
          let fillHeight = item.pct;
          let displayVal = `${item.count} balls`;
          if (activeTab === 'Wickets') {
            fillHeight = Math.round((item.wickets / 246) * 100);
            displayVal = `${item.wickets} wkts`;
          } else if (activeTab === 'Economy') {
            fillHeight = Math.round((item.economy / 10) * 100);
            displayVal = `${item.economy} econ`;
          }

          return (
            <div key={idx} className="pillar-col">
              <div className="pillar-track">
                <div
                  className="pillar-fill"
                  style={{
                    height: `${fillHeight}%`,
                    backgroundColor: item.color
                  }}
                />
              </div>
              <div className="pillar-label">{item.label}</div>
              <div className="pillar-stat">{displayVal}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
