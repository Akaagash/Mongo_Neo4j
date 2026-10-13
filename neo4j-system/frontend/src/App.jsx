import { useEffect, useMemo, useState } from 'react'
import Browser from './Browser'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002'

function App() {
  const [currentRoute, setCurrentRoute] = useState('home')
  const [teams, setTeams] = useState([])
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [isClosing, setIsClosing] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(1)

  const handleCloseModal = () => {
    setIsClosing(true)
    setTimeout(() => {
      setSelectedTeam(null)
      setIsClosing(false)
      setCurrentSlide(1)
    }, 600)
  }

  async function loadTeams() {
    setStatus('loading')
    setError('')

    try {
      const response = await fetch(`${API_URL}/api/teams`)
      if (!response.ok) throw new Error('The Neo4j API did not respond successfully.')

      const payload = await response.json()
      setTeams(payload.data || [])
      setStatus('connected')
    } catch (requestError) {
      setStatus('error')
      setError(requestError.message)
    }
  }

  useEffect(() => {
    loadTeams()
  }, [])

  const filteredTeams = useMemo(() => {
    const normalizedQuery = query.toLowerCase().trim()
    if (!normalizedQuery) return teams

    return teams.filter((team) =>
      [team.name, team.city, team.captain].some((value) =>
        (value || '').toLowerCase().includes(normalizedQuery),
      ),
    )
  }, [query, teams])

  const statusLabel = {
    connected: 'Neo4j connected',
    error: 'Connection issue',
    loading: 'Checking database',
  }[status]

  if (currentRoute === 'browser') {
    return <Browser apiUrl={API_URL} onBack={() => { setCurrentRoute('home'); loadTeams(); }} />
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="IPL Neo4j home">
          <span className="brand-mark">IPL</span>
          <span className="eyebrow" style={{ margin: 0 }}>NEO4J / IPL_LIST</span>
        </a>
        <div className={`status status-${status}`}>
          <span className="status-dot" aria-hidden="true" />
          {statusLabel}
        </div>
      </header>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '15px 0' }}>
        <label className="search-box">
          <span aria-hidden="true">&#x2315;</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search teams, cities, captains"
            type="search"
          />
        </label>
        <div className="intro-stat">
          <span className="stat-label">Nodes in graph</span>
          <strong>{status === 'connected' ? teams.length : '--'}</strong>
          <span className="stat-meta">/Team</span>
        </div>
      </div>

      <section className="workspace" aria-label="IPL teams">
        <div className="toolbar" style={{ justifyContent: 'flex-end' }}>
          <div className="toolbar-actions">
            <span className="result-count">
              {filteredTeams.length} {filteredTeams.length === 1 ? 'match' : 'matches'}
            </span>
            <button className="refresh-button" type="button" onClick={loadTeams} disabled={status === 'loading'}>
              <span aria-hidden="true">&#x21BB;</span> Refresh
            </button>
            <button className="seed-button" type="button" onClick={() => setCurrentRoute('browser')}>
              Manage Data
            </button>
          </div>
        </div>

        {status === 'error' && (
          <div className="notice notice-error" role="alert">
            <strong>Could not reach the Neo4j backend.</strong>
            <span>{error} Check that the backend is running on port 5002.</span>
            <button type="button" onClick={loadTeams}>Try again</button>
          </div>
        )}

        {status === 'loading' && <div className="loading-state">Loading nodes from Neo4j...</div>}

        {status === 'connected' && filteredTeams.length > 0 && (
          <div className="team-grid">
            {filteredTeams.map((team, index) => (
              <article 
                className="team-card" 
                key={team._id || team.name}
                onClick={() => setSelectedTeam(team)}
                style={{ cursor: 'pointer' }}
              >
                <div className="team-card-top">
                  <span className="team-index">{String(index + 1).padStart(2, '0')}</span>
                  <span className="team-chip">NODE</span>
                </div>
                <h2>{team.name}</h2>
                <div className="team-details">
                  <div><span>City</span><strong>{team.city}</strong></div>
                  <div><span>Captain</span><strong>{team.captain}</strong></div>
                </div>
              </article>
            ))}
          </div>
        )}

        {status === 'connected' && filteredTeams.length === 0 && (
          <div className="empty-state">
            <strong>No teams match &ldquo;{query}&rdquo;.</strong>
            <button type="button" onClick={() => setQuery('')}>Clear search</button>
          </div>
        )}
      </section>

      {/* Team Details Modal */}
      {(selectedTeam || isClosing) && (
        <div className="app-modal-overlay" onClick={handleCloseModal}>
          <div 
            className={`app-modal ${isClosing ? 'closing' : ''} team-modal-content`} 
            onClick={e => e.stopPropagation()}
            style={{ width: '600px', maxWidth: '90vw' }}
          >
             <button className="exit-btn" onClick={handleCloseModal}>&#x2715;</button>
             <h2 style={{ marginTop: 0, color: 'var(--accent-dark)', fontSize: '32px', marginBottom: '5px' }}>{selectedTeam?.name}</h2>
             <div style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '25px', fontFamily: "'DM Mono', monospace" }}>Page {currentSlide} of 3</div>
             
             {/* Slide 1 */}
             {currentSlide === 1 && (
               <div className="slide-content" style={{ animation: 'slideInRight 0.3s ease-out' }}>
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    {selectedTeam?.city && <div><span className="eyebrow" style={{display:'block', marginBottom:'5px'}}>City</span> <strong style={{ fontSize: '18px' }}>{selectedTeam.city}</strong></div>}
                    {selectedTeam?.captain && <div><span className="eyebrow" style={{display:'block', marginBottom:'5px'}}>Captain</span> <strong style={{ fontSize: '18px' }}>{selectedTeam.captain}</strong></div>}
                    {selectedTeam?.coach && <div><span className="eyebrow" style={{display:'block', marginBottom:'5px'}}>Head Coach</span> <strong style={{ fontSize: '18px' }}>{selectedTeam.coach}</strong></div>}
                    {selectedTeam?.founded && <div><span className="eyebrow" style={{display:'block', marginBottom:'5px'}}>Founded</span> <strong style={{ fontSize: '18px' }}>{selectedTeam.founded}</strong></div>}
                    {selectedTeam?.home_ground && <div><span className="eyebrow" style={{display:'block', marginBottom:'5px'}}>Home Ground</span> <strong style={{ fontSize: '18px' }}>{selectedTeam.home_ground}</strong></div>}
                    {selectedTeam?.capacity && <div><span className="eyebrow" style={{display:'block', marginBottom:'5px'}}>Capacity</span> <strong style={{ fontSize: '18px' }}>{selectedTeam.capacity.toLocaleString()}</strong></div>}
                    {selectedTeam?.followers_millions !== undefined && <div><span className="eyebrow" style={{display:'block', marginBottom:'5px'}}>Followers (M)</span> <strong style={{ fontSize: '18px' }}>{selectedTeam.followers_millions}</strong></div>}
                 </div>
               </div>
             )}

             {/* Slide 2 */}
             {currentSlide === 2 && (
               <div className="slide-content" style={{ animation: 'slideInRight 0.3s ease-out' }}>
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    {selectedTeam?.matches && <div><span className="eyebrow" style={{display:'block', marginBottom:'5px'}}>Matches Played</span> <strong style={{ fontSize: '18px' }}>{selectedTeam.matches}</strong></div>}
                    {selectedTeam?.win_percentage && <div><span className="eyebrow" style={{display:'block', marginBottom:'5px'}}>Win Percentage</span> <strong style={{ fontSize: '18px' }}>{selectedTeam.win_percentage}%</strong></div>}
                    {selectedTeam?.wins !== undefined && <div><span className="eyebrow" style={{display:'block', marginBottom:'5px'}}>Wins / Losses</span> <strong style={{ fontSize: '18px' }}>{selectedTeam.wins} / {selectedTeam.losses}</strong></div>}
                    {selectedTeam?.titles !== undefined && <div><span className="eyebrow" style={{display:'block', marginBottom:'5px'}}>Titles</span> <strong style={{ fontSize: '18px' }}>{selectedTeam.titles}</strong></div>}
                    {selectedTeam?.playoff_appearances !== undefined && <div><span className="eyebrow" style={{display:'block', marginBottom:'5px'}}>Playoffs</span> <strong style={{ fontSize: '18px' }}>{selectedTeam.playoff_appearances}</strong></div>}
                    {selectedTeam?.franchise_value_usd && <div><span className="eyebrow" style={{display:'block', marginBottom:'5px'}}>Franchise Value</span> <strong style={{ fontSize: '18px' }}>${selectedTeam.franchise_value_usd}</strong></div>}
                    {selectedTeam?.highest_paid_player?.name && <div><span className="eyebrow" style={{display:'block', marginBottom:'5px'}}>Top Earner</span> <strong style={{ fontSize: '18px' }}>{selectedTeam.highest_paid_player.name} ({selectedTeam.highest_paid_player.salary})</strong></div>}
                 </div>
               </div>
             )}

             {/* Slide 3 */}
             {currentSlide === 3 && (
               <div className="slide-content" style={{ animation: 'slideInRight 0.3s ease-out' }}>
                 <div style={{ display: 'grid', gap: '10px' }}>
                    {selectedTeam?.squad?.map((player, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'var(--paper)', borderRadius: '6px' }}>
                        <strong style={{ fontSize: '15px' }}>{player.name}</strong>
                        <div style={{ textAlign: 'right' }}>
                           <div style={{ fontSize: '13px', color: 'var(--accent-dark)', fontWeight: 'bold' }}>{player.role}</div>
                           <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{player.country}</div>
                        </div>
                      </div>
                    ))}
                 </div>
               </div>
             )}

             <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px', paddingTop: '20px', borderTop: '1px solid var(--line)' }}>
               <button 
                 onClick={() => setCurrentSlide(prev => Math.max(1, prev - 1))} 
                 disabled={currentSlide === 1}
                 className="refresh-button"
                 style={{ background: currentSlide === 1 ? 'var(--muted)' : 'var(--accent)', color: 'white', border: 'none' }}
               >
                 &larr; Previous
               </button>
               <button 
                 onClick={() => setCurrentSlide(prev => Math.min(3, prev + 1))} 
                 disabled={currentSlide === 3}
                 className="refresh-button"
                 style={{ background: currentSlide === 3 ? 'var(--muted)' : 'var(--accent)', color: 'white', border: 'none' }}
               >
                 Next &rarr;
               </button>
             </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default App
