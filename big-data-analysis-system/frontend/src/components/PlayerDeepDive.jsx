import React, { useState, useEffect } from 'react';
import { UserCheck, Target, Zap, Shield, Crosshair, BarChart3, Clock, Database, Network, RefreshCw } from 'lucide-react';
import {
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import QueryCodeBlock from './QueryCodeBlock';

const PLAYERS = [
  "Virat Kohli",
  "Rohit Sharma",
  "MS Dhoni",
  "Suryakumar Yadav",
  "Andre Russell",
  "Heinrich Klaasen",
  "Shubman Gill",
  "Rishabh Pant",
  "Sanju Samson",
  "KL Rahul"
];

export default function PlayerDeepDive({ isDetail = false }) {
  const [selectedPlayer, setSelectedPlayer] = useState("Virat Kohli");
  const [playerData, setPlayerData] = useState(null);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPlayerDetail = async (player) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/player-detail?player=${encodeURIComponent(player)}`);
      const json = await res.json();
      if (json.success) {
        setPlayerData(json.data);
        setMeta(json.meta);
      }
    } catch (err) {
      console.error('Error fetching player detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayerDetail(selectedPlayer);
  }, [selectedPlayer]);

  const summary = playerData?.summary || {};
  const byLength = (playerData?.byLength || []).map(l => ({
    name: l.length.replace(/_/g, ' '),
    strikeRate: l.strike_rate,
    runs: l.runs,
    balls: l.balls,
    dismissals: l.dismissals
  }));

  const byPaceSpin = (playerData?.byPaceSpin || []).map(p => ({
    name: p.type,
    strikeRate: p.strike_rate,
    runs: p.runs,
    balls: p.balls,
    boundaryPct: p.boundary_pct
  }));

  const pitchCoords = (playerData?.pitchCoordinates || []).map(pt => ({
    x: pt.pitch_coordinate_x,
    y: pt.pitch_coordinate_y,
    runs: pt.runs_batter,
    isWicket: pt.is_wicket,
    speed: pt.release_speed_kmh,
    bowler: pt.bowler,
    length: pt.delivery_length
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Player Selector Bar */}
      <div className="clean-card" style={{ padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <UserCheck size={18} style={{ color: '#10b981' }} />
              <span>Select Marquee Batter for Granular Analysis</span>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              Kinematic trajectory coordinates, length metrics, pace/spin splits, and bowler duels
            </div>
          </div>

          {/* Clean Player Selection Pills */}
          <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
            {PLAYERS.map(p => {
              const isSelected = selectedPlayer === p;
              return (
                <button
                  key={p}
                  onClick={() => setSelectedPlayer(p)}
                  style={{
                    backgroundColor: isSelected ? '#0f172a' : '#f1f5f9',
                    color: isSelected ? '#ffffff' : '#334155',
                    border: isSelected ? '1px solid #0f172a' : '1px solid #e2e8f0',
                    padding: '0.4rem 0.85rem',
                    borderRadius: '20px',
                    fontSize: '0.78rem',
                    fontWeight: isSelected ? 600 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: isSelected ? '0 2px 6px rgba(15,23,42,0.12)' : 'none'
                  }}
                >
                  {p}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {loading && !playerData ? (
        <div className="clean-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 0.75rem auto', color: '#10b981' }} />
          <div>Aggregating live ball telemetry for {selectedPlayer}...</div>
        </div>
      ) : (
        <>
          {/* Summary Metric Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '1rem' }}>
            <div className="clean-card" style={{ padding: '1.15rem' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Total Runs</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#3b82f6', marginTop: '0.2rem' }}>
                {summary.total_runs ?? '...'}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-light)', marginTop: '0.1rem' }}>Career Ingested</div>
            </div>

            <div className="clean-card" style={{ padding: '1.15rem' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Balls Faced</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.2rem' }}>
                {summary.balls_faced ?? '...'}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-light)', marginTop: '0.1rem' }}>Deliveries Faced</div>
            </div>

            <div className="clean-card" style={{ padding: '1.15rem' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Strike Rate</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#10b981', marginTop: '0.2rem' }}>
                {summary.strike_rate ?? '...'}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-light)', marginTop: '0.1rem' }}>Runs Per 100 Balls</div>
            </div>

            <div className="clean-card" style={{ padding: '1.15rem' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Fours / Sixes</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.2rem' }}>
                {summary.fours || 0} / {summary.sixes || 0}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-light)', marginTop: '0.1rem' }}>Boundaries</div>
            </div>

            <div className="clean-card" style={{ padding: '1.15rem' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Dot Ball Rate</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.2rem' }}>
                {summary.dot_pct || 0}%
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-light)', marginTop: '0.1rem' }}>Dot Frequency</div>
            </div>

            <div className="clean-card" style={{ padding: '1.15rem' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Dismissals</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#f43f5e', marginTop: '0.2rem' }}>
                {summary.dismissals || 0}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-light)', marginTop: '0.1rem' }}>Wickets Lost</div>
            </div>
          </div>

          {isDetail ? (
            <div className="clean-card">
              <div className="clean-card-header">
                <span className="clean-card-title">Per-Player MQL Facet Pipeline & Graph Query</span>
              </div>
              <div style={{ padding: '0.5rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '0.75rem', fontSize: '0.75rem' }}>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>Engine: MongoDB $match + $facet Branching</span>
                <div style={{ color: '#059669', marginTop: '0.1rem' }}>Execution: {meta?.execution_stats?.latency_ms || 14} ms</div>
              </div>
              <QueryCodeBlock code={meta?.raw_query || ''} language="MQL & Cypher" />
            </div>
          ) : (
            <>
              {/* Row 2: Pace vs Spin & Delivery Length Charts */}
              <div className="split-layout-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div className="clean-card">
                  <div className="clean-card-header">
                    <span className="clean-card-title">{selectedPlayer} vs Bowling Style (Pace vs Spin)</span>
                  </div>
                  <div style={{ height: 210 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={byPaceSpin} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                        <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.72rem' }} />
                        <Bar dataKey="strikeRate" name="Strike Rate" fill="#10b981" radius={[6, 6, 0, 0]} barSize={28} />
                        <Bar dataKey="runs" name="Runs Scored" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={28} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="clean-card">
                  <div className="clean-card-header">
                    <span className="clean-card-title">Strike Rate & Dismissals by Delivery Length</span>
                  </div>
                  <div style={{ height: 210 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={byLength} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                        <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.72rem' }} />
                        <Bar dataKey="strikeRate" name="Strike Rate" fill="#fb7185" radius={[6, 6, 0, 0]} barSize={20} />
                        <Bar dataKey="dismissals" name="Dismissals" fill="#f43f5e" radius={[6, 6, 0, 0]} barSize={20} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Row 3: Hawk-Eye 3D Pitch Scatter Map */}
              <div className="clean-card">
                <div className="clean-card-header">
                  <div>
                    <span className="clean-card-title">Hawk-Eye 3D Pitch Impact Trajectory Map</span>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                      Lateral Deviation (-0.8m to +0.8m) vs Pitch Length from Batting Crease (1.2m Yorker to 14m Short)
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <span style={{ fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#f43f5e' }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f43f5e' }} /> Wicket
                    </span>
                    <span style={{ fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#10b981' }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} /> Boundary
                    </span>
                    <span style={{ fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#3b82f6' }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6' }} /> Run
                    </span>
                    <span style={{ fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#94a3b8' }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#cbd5e1' }} /> Dot
                    </span>
                  </div>
                </div>

                <div style={{ height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis
                        type="number"
                        dataKey="x"
                        name="Lateral Deviation"
                        unit="m"
                        domain={[-0.8, 0.8]}
                        stroke="#94a3b8"
                        fontSize={10}
                      />
                      <YAxis
                        type="number"
                        dataKey="y"
                        name="Pitch Length"
                        unit="m"
                        domain={[1, 14]}
                        stroke="#94a3b8"
                        fontSize={10}
                      />
                      <Tooltip
                        cursor={{ strokeDasharray: '3 3' }}
                        contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.72rem' }}
                        formatter={(value, name) => [value, name === 'x' ? 'Lateral Off-Stump (m)' : 'Length from Crease (m)']}
                      />
                      <Scatter name="Deliveries" data={pitchCoords}>
                        {pitchCoords.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.isWicket ? '#f43f5e' : entry.runs >= 4 ? '#10b981' : entry.runs > 0 ? '#3b82f6' : '#cbd5e1'}
                            opacity={0.85}
                          />
                        ))}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Row 4: Bowler Nemesis Duels Table */}
              <div className="clean-card">
                <div className="clean-card-header">
                  <span className="clean-card-title">{selectedPlayer} Head-to-Head Duels (Neo4j Graph Network)</span>
                </div>
                <div className="table-responsive">
                  <table className="clean-table">
                    <thead>
                      <tr>
                        <th>Rival Bowler</th>
                        <th>Balls Faced</th>
                        <th>Runs Scored</th>
                        <th>Dismissals</th>
                        <th>Batter Strike Rate</th>
                        <th>Dot Ball %</th>
                        <th>Tactical Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(playerData?.bowlerMatchups || []).map((bm, idx) => (
                        <tr key={idx}>
                          <td style={{ fontWeight: 600, color: '#f43f5e' }}>{bm.bowler}</td>
                          <td style={{ fontFamily: 'var(--font-mono)' }}>{bm.balls}</td>
                          <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{bm.runs}</td>
                          <td style={{ fontFamily: 'var(--font-mono)', color: '#f43f5e', fontWeight: 700 }}>{bm.dismissals}</td>
                          <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{bm.strike_rate}</td>
                          <td style={{ fontFamily: 'var(--font-mono)' }}>{bm.dot_pct}%</td>
                          <td>
                            {bm.dismissals >= 3 ? (
                              <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', background: '#fee2e2', color: '#b91c1c', borderRadius: '4px', fontWeight: 600 }}>
                                Bowler Nemesis ({bm.dismissals}x)
                              </span>
                            ) : bm.strike_rate > 140 ? (
                              <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', background: '#ecfdf5', color: '#059669', borderRadius: '4px', fontWeight: 600 }}>
                                Batter Dominates
                              </span>
                            ) : (
                              <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', background: '#f1f5f9', color: '#64748b', borderRadius: '4px' }}>
                                Contested Battle
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
