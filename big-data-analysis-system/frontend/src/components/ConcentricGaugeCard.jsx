import React from 'react';
import QueryCodeBlock from './QueryCodeBlock';

export default function ConcentricGaugeCard({ isDetail = false }) {
  // Outcomes data
  const data = [
    { label: 'Dot Balls', count: '4,620', color: '#10b981' },
    { label: 'Singles / Twos', count: '4,180', color: '#fb7185' },
    { label: 'Boundaries (4s/6s)', count: '2,480', color: '#fb923c' },
    { label: 'Dismissals', count: '720', color: '#f43f5e' }
  ];

  if (isDetail) {
    return (
      <div className="concentric-card">
        <div className="clean-card-header">
          <span className="clean-card-title">Ball Outcome Aggregation Blueprint</span>
        </div>
        <div style={{ padding: '0.5rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '0.75rem', fontSize: '0.75rem' }}>
          <span style={{ fontWeight: 600, color: '#0f172a' }}>Engine: MongoDB $facet & $group</span>
          <div style={{ color: '#059669', marginTop: '0.1rem' }}>12,000 Documents Aggregated</div>
        </div>
        <QueryCodeBlock
          code={`db.deliveries.aggregate([
  {
    $group: {
      _id: {
        $cond: [
          "$is_wicket", "Wicket",
          { $cond: ["$is_boundary", "Boundary", { $cond: ["$is_dot", "Dot", "Single"] }] }
        ]
      },
      total: { $sum: 1 }
    }
  }
]);`}
          language="MQL"
        />
      </div>
    );
  }

  return (
    <div className="concentric-card">
      <div className="clean-card-header">
        <span className="clean-card-title">Telemetry Outcomes</span>
      </div>

      <div className="concentric-rings-container">
        {/* SVG Concentric Multi-Ring Arcs matching mockup */}
        <svg width="220" height="200" viewBox="0 0 220 200">
          {/* Ring 1 (Outer - Mint/Emerald #10b981): 75% Arc */}
          <circle
            cx="110"
            cy="100"
            r="82"
            fill="none"
            stroke="#f1f5f9"
            strokeWidth="8"
          />
          <circle
            cx="110"
            cy="100"
            r="82"
            fill="none"
            stroke="#10b981"
            strokeWidth="8"
            strokeDasharray="515"
            strokeDashoffset="140"
            strokeLinecap="round"
            transform="rotate(-90 110 100)"
          />

          {/* Ring 2 (Middle - Coral/Rose #fb7185): 65% Arc */}
          <circle
            cx="110"
            cy="100"
            r="68"
            fill="none"
            stroke="#f1f5f9"
            strokeWidth="8"
          />
          <circle
            cx="110"
            cy="100"
            r="68"
            fill="none"
            stroke="#fb7185"
            strokeWidth="8"
            strokeDasharray="427"
            strokeDashoffset="135"
            strokeLinecap="round"
            transform="rotate(-90 110 100)"
          />

          {/* Ring 3 (Inner - Peach/Gold #fb923c): 50% Arc */}
          <circle
            cx="110"
            cy="100"
            r="54"
            fill="none"
            stroke="#f1f5f9"
            strokeWidth="8"
          />
          <circle
            cx="110"
            cy="100"
            r="54"
            fill="none"
            stroke="#fb923c"
            strokeWidth="8"
            strokeDasharray="339"
            strokeDashoffset="150"
            strokeLinecap="round"
            transform="rotate(-90 110 100)"
          />
        </svg>

        {/* Center Label matching mockup */}
        <div className="concentric-center-label">
          <div className="concentric-center-val">12.0k</div>
          <div className="concentric-center-sub">Balls</div>
        </div>
      </div>

      {/* Legend Grid with colored dots matching mockup */}
      <div className="concentric-legend-grid">
        {data.map((item, idx) => (
          <div key={idx} className="legend-dot-item">
            <span className="legend-dot" style={{ backgroundColor: item.color }} />
            <span className="legend-dot-name">{item.label}</span>
            <span className="legend-dot-val">{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
