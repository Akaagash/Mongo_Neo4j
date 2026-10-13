import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreHorizontal, ArrowUpRight } from 'lucide-react';
import QueryCodeBlock from './QueryCodeBlock';

export default function BottomCards({ playerImpacts = [], metaImpact, isDetail = false }) {
  const navigate = useNavigate();
  const topImpacts = playerImpacts.slice(0, 5);

  const getPlayerColor = (idx) => {
    const colors = [
      'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', // Gold/Amber (Dhoni)
      'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', // Blue (Bumrah)
      'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', // Purple (Narine)
      'linear-gradient(135deg, #10b981 0%, #047857 100%)', // Emerald (Rashid)
      'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)'  // Red (Pant)
    ];
    return colors[idx % colors.length];
  };

  if (isDetail) {
    return (
      <div className="clean-card">
        <div className="clean-card-header">
          <span className="clean-card-title">Key Player Causal Impact (Neo4j Graph)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <span className="mono-tag" style={{ background: '#ecfdf5', color: '#059669', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600 }}>
            Neo4j [:KEY_FACTOR] Causal Graph
          </span>
          <span style={{ color: '#059669', fontWeight: 600, fontSize: '0.78rem' }}>Win Delta Analysis</span>
        </div>
        <QueryCodeBlock
          code={`// Player Presence Impact Delta
MATCH (p:Player)-[k:KEY_FACTOR]->(t:Team)
RETURN p.name as player_name,
       t.name as team_name,
       k.win_pct_with as win_with,
       k.win_pct_without as win_without,
       k.impact_delta as delta
ORDER BY k.impact_delta DESC;`}
          language="Cypher"
        />
      </div>
    );
  }

  return (
    <div className="clean-card">
      <div className="clean-card-header">
        <span className="clean-card-title">Key Player Causal Impact</span>
        <button className="more-btn" onClick={() => navigate('/matchup-duels')}>
          <MoreHorizontal size={16} />
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        {topImpacts.map((item, idx) => (
          <div key={idx} className="list-item-row">
            <div className="list-item-left">
              <div className="list-item-icon" style={{ background: getPlayerColor(idx) }}>
                {item.player.split(' ').map(p => p[0]).join('').slice(0, 2)}
              </div>
              <div>
                <div className="list-item-title">{item.player}</div>
                <div className="list-item-sub">{item.team} ({item.matches_with} matches)</div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{
                fontSize: '0.82rem',
                fontWeight: 700,
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '0.2rem',
                fontFamily: 'var(--font-mono)'
              }}>
                <ArrowUpRight size={13} />
                +{item.impact_delta}%
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-light)' }}>
                {item.win_pct_with}% vs {item.win_pct_without}%
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        className="full-action-btn"
        onClick={() => navigate('/matchup-duels')}
        style={{ marginTop: '1rem', width: '100%', border: 'none', cursor: 'pointer' }}
      >
        View all player impact factors
      </button>
    </div>
  );
}
