import React, { useState } from 'react';
import QueryCodeBlock from './QueryCodeBlock';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Database, Network, Target, Activity, Swords, Layers, Compass, Flame, Shield, ArrowUpRight } from 'lucide-react';

// 1. Delivery Dynamics View
export function DeliveryDynamicsView({ deliveryData, meta, isDetail = false }) {
  const [activeTab, setActiveTab] = useState('lengths'); // 'lengths' | 'speeds'
  const lengths = deliveryData?.lengths || [];
  const speeds = deliveryData?.speeds || [];

  const chartLengths = lengths.map(l => ({
    name: l.length.replace(/_/g, ' '),
    deliveries: l.deliveries_count,
    wickets: l.wickets,
    economy: l.economy,
    dotPct: l.dot_pct,
    avgSpeed: l.avg_speed
  }));

  const chartSpeeds = speeds.map(s => ({
    name: s.speed_bracket.replace(/_/g, ' '),
    balls: s.balls,
    strikeRate: s.strike_rate,
    runRate: s.run_rate,
    dotPct: s.dot_pct,
    wickets: s.wickets
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div className="clean-card" style={{ padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Target size={18} style={{ color: '#10b981' }} />
              <span>Delivery Length & Speed Dynamics</span>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              Kinematic ball tracking: release velocities, length distribution, and dismissal probabilities
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button
              onClick={() => setActiveTab('lengths')}
              style={{
                backgroundColor: activeTab === 'lengths' ? '#0f172a' : '#f1f5f9',
                color: activeTab === 'lengths' ? '#ffffff' : '#334155',
                border: 'none',
                padding: '0.4rem 0.85rem',
                borderRadius: '20px',
                fontSize: '0.78rem',
                fontWeight: activeTab === 'lengths' ? 600 : 500,
                cursor: 'pointer'
              }}
            >
              Delivery Lengths
            </button>
            <button
              onClick={() => setActiveTab('speeds')}
              style={{
                backgroundColor: activeTab === 'speeds' ? '#0f172a' : '#f1f5f9',
                color: activeTab === 'speeds' ? '#ffffff' : '#334155',
                border: 'none',
                padding: '0.4rem 0.85rem',
                borderRadius: '20px',
                fontSize: '0.78rem',
                fontWeight: activeTab === 'speeds' ? 600 : 500,
                cursor: 'pointer'
              }}
            >
              Speed Brackets
            </button>
          </div>
        </div>
      </div>

      {isDetail ? (
        <div className="clean-card">
          <div className="clean-card-header">
            <span className="clean-card-title">Delivery Mechanics Query Blueprint</span>
          </div>
          <div style={{ padding: '0.5rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '0.75rem', fontSize: '0.75rem' }}>
            <span style={{ fontWeight: 600, color: '#0f172a' }}>Engine: MongoDB Compound Index Multi-Bucket</span>
            <div style={{ color: '#059669', marginTop: '0.1rem' }}>Index Hit: {'{ delivery_length: 1, speed_bracket: 1 }'}</div>
          </div>
          <QueryCodeBlock code={meta?.raw_query || ''} language="MQL" />
        </div>
      ) : (
        <>
          <div className="clean-card">
            <div className="clean-card-header">
              <span className="clean-card-title">
                {activeTab === 'lengths' ? 'Delivery Length Volume & Wicket Frequency' : 'Speed Bracket Strike Rate & Run Rate'}
              </span>
            </div>
            <div style={{ height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                {activeTab === 'lengths' ? (
                  <BarChart data={chartLengths} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.72rem' }} />
                    <Legend wrapperStyle={{ fontSize: '0.72rem', paddingTop: '0.5rem' }} />
                    <Bar dataKey="deliveries" name="Ball Count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="wickets" name="Dismissals" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="economy" name="Economy Conceded" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                ) : (
                  <BarChart data={chartSpeeds} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.72rem' }} />
                    <Legend wrapperStyle={{ fontSize: '0.72rem', paddingTop: '0.5rem' }} />
                    <Bar dataKey="strikeRate" name="Batting Strike Rate" fill="#fb923c" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="runRate" name="Run Rate (RPO)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="wickets" name="Wickets Taken" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          <div className="clean-card">
            <div className="clean-card-header">
              <span className="clean-card-title">Granular Mechanics Data Breakdown</span>
            </div>
            <div className="table-responsive">
              <table className="clean-table">
                <thead>
                  <tr>
                    <th>{activeTab === 'lengths' ? 'Delivery Length' : 'Speed Bracket'}</th>
                    <th>Ball Count</th>
                    <th>Dismissals</th>
                    <th>Dot Ball %</th>
                    <th>{activeTab === 'lengths' ? 'Economy Rate' : 'Strike Rate'}</th>
                    <th>Tactical Observation</th>
                  </tr>
                </thead>
                <tbody>
                  {activeTab === 'lengths' ? (
                    lengths.map((l, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 600 }}>{l.length.replace(/_/g, ' ')}</td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>{l.deliveries_count.toLocaleString()}</td>
                        <td style={{ fontFamily: 'var(--font-mono)', color: '#f43f5e', fontWeight: 700 }}>{l.wickets}</td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>{l.dot_pct}%</td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{l.economy}</td>
                        <td>
                          {l.length === 'Yorker' ? (
                            <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', background: '#ecfdf5', color: '#059669', borderRadius: '4px', fontWeight: 600 }}>
                              Elite Death Delivery
                            </span>
                          ) : l.length === 'Good_Length' ? (
                            <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', background: '#eff6ff', color: '#2563eb', borderRadius: '4px', fontWeight: 600 }}>
                              Primary Penetration
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', background: '#fef3c7', color: '#d97706', borderRadius: '4px' }}>
                              Scoring Opportunity
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    speeds.map((s, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 600 }}>{s.speed_bracket.replace(/_/g, ' ')}</td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>{s.balls.toLocaleString()}</td>
                        <td style={{ fontFamily: 'var(--font-mono)', color: '#f43f5e', fontWeight: 700 }}>{s.wickets}</td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>{s.dot_pct}%</td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{s.strike_rate}</td>
                        <td>
                          {s.speed_bracket === '>145_kmh' ? (
                            <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', background: '#fee2e2', color: '#b91c1c', borderRadius: '4px', fontWeight: 600 }}>
                              High Disruption Pace
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', background: '#f1f5f9', color: '#64748b', borderRadius: '4px' }}>
                              Controlled Variation
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// 2. Phase Telemetry View
export function PhaseTelemetryView({ isDetail = false }) {
  const phaseData = [
    { phase: 'Powerplay (Overs 1-6)', runs: 4120, balls: 3840, sr: 132.4, rpo: 7.94, dotPct: 44.2, wickets: 198, boundaries: 890 },
    { phase: 'Middle Overs (7-15)', runs: 5240, balls: 5760, sr: 124.8, rpo: 7.48, dotPct: 37.8, wickets: 242, boundaries: 920 },
    { phase: 'Death Phase (16-20)', runs: 2640, balls: 2400, sr: 178.6, rpo: 10.71, dotPct: 28.5, wickets: 280, boundaries: 670 }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div className="clean-card" style={{ padding: '1.25rem 1.5rem' }}>
        <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Activity size={18} style={{ color: '#3b82f6' }} />
          <span>Match Phase Telemetry & Temporal Momentum</span>
        </div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
          Scoring acceleration, boundary frequencies, and wicket clusters across match phases
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
        {phaseData.map((p, idx) => (
          <div key={idx} className="clean-card">
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>{p.phase}</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: idx === 2 ? '#f43f5e' : '#3b82f6', marginTop: '0.4rem', fontFamily: 'var(--font-mono)' }}>
              {p.rpo} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>RPO</span>
            </div>
            <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.78rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Strike Rate:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{p.sr}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Dot Ball Rate:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{p.dotPct}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Wickets Lost:</span>
                <span style={{ fontWeight: 700, color: '#f43f5e' }}>{p.wickets}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="clean-card">
        <div className="clean-card-header">
          <span className="clean-card-title">Phase Strike Rate Momentum Curve</span>
        </div>
        <div style={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={phaseData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="phaseAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="phase" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} domain={[100, 200]} />
              <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.72rem' }} />
              <Area type="monotone" dataKey="sr" name="Strike Rate" stroke="#3b82f6" strokeWidth={2.5} fill="url(#phaseAreaGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// 3. Matchup Duels View
export function MatchupDuelsView({ matchups = [], playerImpacts = [], isDetail = false }) {
  const derbies = [
    { teamA: 'Chennai Super Kings', teamB: 'Mumbai Indians', matches: 36, winsA: 16, winsB: 20, name: 'El Clasico' },
    { teamA: 'Chennai Super Kings', teamB: 'Royal Challengers Bangalore', matches: 32, winsA: 21, winsB: 10, name: 'Southern Derby' },
    { teamA: 'Mumbai Indians', teamB: 'Kolkata Knight Riders', matches: 32, winsA: 23, winsB: 9, name: 'Harbor Rivalry' },
    { teamA: 'Royal Challengers Bangalore', teamB: 'Kolkata Knight Riders', matches: 34, winsA: 14, winsB: 20, name: 'Heritage Derby' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div className="clean-card" style={{ padding: '1.25rem 1.5rem' }}>
        <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Swords size={18} style={{ color: '#f43f5e' }} />
          <span>Head-to-Head Duels & Franchise Rivalry Graph</span>
        </div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
          Graph adjacency traversals mapping bowler-batter head-to-heads and marquee player presence deltas
        </div>
      </div>

      <div className="split-layout-grid" style={{ gridTemplateColumns: '1.5fr 1fr' }}>
        <div className="clean-card">
          <div className="clean-card-header">
            <span className="clean-card-title">Bowler vs Batter Duels</span>
          </div>
          <div className="table-responsive">
            <table className="clean-table">
              <thead>
                <tr>
                  <th>Bowler</th>
                  <th>Batter</th>
                  <th>Balls</th>
                  <th>Runs</th>
                  <th>Wkts</th>
                  <th>SR</th>
                  <th>Result</th>
                </tr>
              </thead>
              <tbody>
                {matchups.slice(0, 8).map((m, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600, color: '#f43f5e' }}>{m.bowler}</td>
                    <td style={{ fontWeight: 600, color: '#3b82f6' }}>{m.batsman}</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{m.balls}</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{m.runs}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#f43f5e' }}>{m.dismissals}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{m.strike_rate}</td>
                    <td>
                      {m.dismissals >= 4 ? (
                        <span style={{ fontSize: '0.68rem', padding: '0.15rem 0.45rem', background: '#fee2e2', color: '#b91c1c', borderRadius: '4px', fontWeight: 600 }}>
                          Bowler Edge ({m.dismissals}x)
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.68rem', padding: '0.15rem 0.45rem', background: '#ecfdf5', color: '#059669', borderRadius: '4px' }}>
                          Batter Ahead
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="clean-card">
          <div className="clean-card-header">
            <span className="clean-card-title">Franchise Rivalry Links</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {derbies.map((d, idx) => (
              <div key={idx} style={{ padding: '0.85rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#7c3aed', background: '#f5f3ff', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                    {d.name}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{d.matches} matches</span>
                </div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '0.4rem' }}>
                  {d.teamA} vs {d.teamB}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Wins: <span style={{ color: '#3b82f6', fontWeight: 600 }}>{d.winsA}</span> - <span style={{ color: '#7c3aed', fontWeight: 600 }}>{d.winsB}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// 4. Pitch Surface Matrix View
export function PitchMatrixView({ deliveryData, isDetail = false }) {
  const pitches = deliveryData?.pitches || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div className="clean-card" style={{ padding: '1.25rem 1.5rem' }}>
        <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Layers size={18} style={{ color: '#10b981' }} />
          <span>Pitch Surface Characteristics & Ground Telemetry</span>
        </div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
          Surface-dependent wicket distribution comparing Chepauk, Wankhede, Chinnaswamy, and Ekana
        </div>
      </div>

      <div className="clean-card">
        <div className="clean-card-header">
          <span className="clean-card-title">Pitch Surface Matrix</span>
        </div>
        <div className="table-responsive">
          <table className="clean-table">
            <thead>
              <tr>
                <th>Surface / Ground Type</th>
                <th>Sample Deliveries</th>
                <th>Wickets Taken</th>
                <th>Run Rate (RPO)</th>
                <th>Pace Share</th>
                <th>Spin Share</th>
                <th>Dominant Dynamic</th>
              </tr>
            </thead>
            <tbody>
              {pitches.map((p, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 600 }}>{p.pitch_type.replace(/_/g, ' ')}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{p.balls.toLocaleString()}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: '#f43f5e', fontWeight: 700 }}>{p.wickets}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{p.runs_per_over}</td>
                  <td>
                    <span style={{ fontSize: '0.72rem', padding: '0.15rem 0.45rem', background: '#eff6ff', color: '#2563eb', borderRadius: '4px', fontWeight: 600 }}>
                      {p.pace_wicket_pct}% Pace
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.72rem', padding: '0.15rem 0.45rem', background: '#f5f3ff', color: '#7c3aed', borderRadius: '4px', fontWeight: 600 }}>
                      {p.spin_wicket_pct}% Spin
                    </span>
                  </td>
                  <td>
                    {p.pace_wicket_pct > 60 ? (
                      <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.45rem', background: '#ecfdf5', color: '#059669', borderRadius: '4px', fontWeight: 600 }}>
                        Pace & Bounce Friendly
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.45rem', background: '#fef3c7', color: '#d97706', borderRadius: '4px', fontWeight: 600 }}>
                        Turn & Grip Track
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// 5. MongoDB Store View
export function MongoStoreView({ overviewData }) {
  const deliveriesCount = overviewData?.volume?.mongodb_deliveries_count || 12000;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div className="clean-card" style={{ padding: '1.25rem 1.5rem' }}>
        <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Database size={18} style={{ color: '#2563eb' }} />
          <span>MongoDB Atlas High-Velocity Telemetry Store</span>
        </div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
          Collection statistics, compound B-Tree indexes, and BSON document storage architecture
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
        <div className="clean-card">
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Collection Deliveries</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#2563eb', marginTop: '0.35rem', fontFamily: 'var(--font-mono)' }}>
            {deliveriesCount.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-light)', marginTop: '0.15rem' }}>Documents Ingested</div>
        </div>

        <div className="clean-card">
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Active B-Tree Indexes</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#10b981', marginTop: '0.35rem', fontFamily: 'var(--font-mono)' }}>
            5 Indexes
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-light)', marginTop: '0.15rem' }}>Sub-2ms Access Latency</div>
        </div>

        <div className="clean-card">
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Replica Cluster</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#7c3aed', marginTop: '0.35rem', fontFamily: 'var(--font-mono)' }}>
            3 Nodes
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-light)', marginTop: '0.15rem' }}>High-Availability Set</div>
        </div>
      </div>

      <div className="clean-card">
        <div className="clean-card-header">
          <span className="clean-card-title">Active MongoDB Indexes</span>
        </div>
        <div className="table-responsive">
          <table className="clean-table">
            <thead>
              <tr>
                <th>Index Name</th>
                <th>Keys</th>
                <th>Latency</th>
                <th>Optimization Target</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontWeight: 600 }}>idx_batsman_bowler</td>
                <td style={{ fontFamily: 'var(--font-mono)' }}>{'{ batsman: 1, bowler: 1 }'}</td>
                <td style={{ color: '#10b981', fontWeight: 600 }}>&lt; 2 ms</td>
                <td>Head-to-head bowler-batter queries</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>idx_length_speed</td>
                <td style={{ fontFamily: 'var(--font-mono)' }}>{'{ delivery_length: 1, speed_bracket: 1 }'}</td>
                <td style={{ color: '#10b981', fontWeight: 600 }}>&lt; 3 ms</td>
                <td>Kinematic ball length and velocity scans</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>idx_pitch_phase</td>
                <td style={{ fontFamily: 'var(--font-mono)' }}>{'{ pitch_type: 1, phase: 1 }'}</td>
                <td style={{ color: '#10b981', fontWeight: 600 }}>&lt; 2 ms</td>
                <td>Surface and phase temporal momentum</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// 6. Neo4j Graph View
export function Neo4jGraphView({ overviewData }) {
  const nodes = overviewData?.volume?.neo4j_nodes || 79;
  const rels = overviewData?.volume?.neo4j_relationships || 96;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div className="clean-card" style={{ padding: '1.25rem 1.5rem' }}>
        <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Network size={18} style={{ color: '#7c3aed' }} />
          <span>Neo4j Aura Labeled Property Graph Topology</span>
        </div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
          Entity nodes, multi-hop relationship edges, and graph path index statistics
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
        <div className="clean-card">
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Graph Nodes</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#7c3aed', marginTop: '0.35rem', fontFamily: 'var(--font-mono)' }}>
            {nodes}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-light)', marginTop: '0.15rem' }}>Team, Player, Venue Entities</div>
        </div>

        <div className="clean-card">
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Directed Relationships</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#2563eb', marginTop: '0.35rem', fontFamily: 'var(--font-mono)' }}>
            {rels}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-light)', marginTop: '0.15rem' }}>Adjacency Edges</div>
        </div>

        <div className="clean-card">
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Graph Engine</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#10b981', marginTop: '0.35rem', fontFamily: 'var(--font-mono)' }}>
            Neo4j Aura
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-light)', marginTop: '0.15rem' }}>Cypher Traversal Engine</div>
        </div>
      </div>

      <div className="clean-card">
        <div className="clean-card-header">
          <span className="clean-card-title">Graph Relationship Types</span>
        </div>
        <div className="table-responsive">
          <table className="clean-table">
            <thead>
              <tr>
                <th>Edge Label</th>
                <th>Source</th>
                <th>Target</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontWeight: 600, color: '#4f46e5' }}>:PLAYS_FOR</td>
                <td>(:Player)</td>
                <td>(:Team)</td>
                <td>Franchise Roster Mapping</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600, color: '#f43f5e' }}>:HEAD_TO_HEAD</td>
                <td>(:Team)</td>
                <td>(:Team)</td>
                <td>Franchise Rivalry Graph</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600, color: '#10b981' }}>:KEY_FACTOR</td>
                <td>(:Player)</td>
                <td>(:Team)</td>
                <td>Player Causal Impact Delta</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600, color: '#fb923c' }}>:RIVAL_BATSMAN</td>
                <td>(:Player [Bowler])</td>
                <td>(:Player [Batter])</td>
                <td>Suppression Duels</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600, color: '#06b6d4' }}>:HOME_VENUE</td>
                <td>(:Team)</td>
                <td>(:Venue)</td>
                <td>Stadium Surface Link</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
