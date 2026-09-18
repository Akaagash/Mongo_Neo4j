import { useEffect, useMemo, useState } from 'react'
import Compass from './Compass'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001'

function App() {
  const [currentRoute, setCurrentRoute] = useState('home')
  const [teams, setTeams] = useState([])
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('loading')
  const [lastUpdated, setLastUpdated] = useState(null)
  const [error, setError] = useState('')
  
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [isClosing, setIsClosing] = useState(false)

  const handleCloseModal = () => {
    setIsClosing(true)
    setTimeout(() => {
      setSelectedTeam(null)
      setIsClosing(false)
    }, 600) // Match animation duration
  }

  async function loadTeams() {
    setStatus('loading')
    setError('')

    try {
      const response = await fetch(`${API_URL}/api/teams`)
      if (!response.ok) throw new Error('The MongoDB API did not respond successfully.')

      const payload = await response.json()
      setTeams(payload.data || [])
      setLastUpdated(new Date())
      setStatus('connected')
    } catch (requestError) {
      setStatus('error')
      setError(requestError.message)
    }
  }

  async function seedData() {
    setStatus('loading')
    setError('')

    try {
      const response = await fetch(`${API_URL}/api/seed`, { method: 'POST' })
      if (!response.ok) throw new Error('The MongoDB API did not respond successfully to the seed request.')
      
      await loadTeams()
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
        value.toLowerCase().includes(normalizedQuery),
      ),
    )
  }, [query, teams])

  const statusLabel = {
    connected: 'MongoDB connected',
    error: 'Connection issue',
    loading: 'Checking database',
  }[status]

  if (currentRoute === 'compass') {
    return <Compass apiUrl={API_URL} onBack={() => setCurrentRoute('home')} />
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="IPL Data home">
          <span className="brand-mark">IPL</span>
          <span className="eyebrow" style={{ margin: 0 }}>MONGODB / IPL_LIST</span>
        </a>
        <div className={`status status-${status}`}>
          <span className="status-dot" aria-hidden="true" />
          {statusLabel}
        </div>
      </header>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '15px 0' }}>
        <label className="search-box">
          <span aria-hidden="true">⌕</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search teams, cities, captains"
            type="search"
          />
        </label>
        <div className="intro-stat">
          <span className="stat-label">Records in collection</span>
          <strong>{status === 'connected' ? teams.length : '--'}</strong>
          <span className="stat-meta">/ipl_list</span>
        </div>
      </div>

      <section className="workspace" aria-label="IPL teams">
        <div className="toolbar" style={{ justifyContent: 'flex-end' }}>
          <div className="toolbar-actions">
            <span className="result-count">
              {filteredTeams.length} {filteredTeams.length === 1 ? 'match' : 'matches'}
            </span>
            <button className="refresh-button" type="button" onClick={loadTeams} disabled={status === 'loading'}>
              <span aria-hidden="true">↻</span> Refresh
            </button>
            <button className="seed-button" type="button" onClick={() => setCurrentRoute('compass')}>
              Manage Data
            </button>
          </div>
        </div>

        {status === 'error' && (
          <div className="notice notice-error" role="alert">
            <strong>Could not reach the MongoDB backend.</strong>
            <span>{error} Check that `npm start` is running in the backend folder.</span>
            <button type="button" onClick={loadTeams}>Try again</button>
          </div>
        )}

        {status === 'loading' && <div className="loading-state">Loading records from MongoDB...</div>}

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
                  <span className="team-chip">IPL</span>
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
            <strong>No teams match “{query}”.</strong>
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
          >
             <button className="exit-btn" onClick={handleCloseModal}>✕</button>
             <h2 style={{ marginTop: 0, color: 'var(--green-dark)', fontSize: '32px', marginBottom: '25px' }}>{selectedTeam?.name}</h2>
             
             <div style={{ display: 'grid', gap: '20px' }}>
                {selectedTeam?.city && <div><span className="eyebrow" style={{display:'block', marginBottom:'5px'}}>City</span> <strong style={{ fontSize: '18px' }}>{selectedTeam.city}</strong></div>}
                {selectedTeam?.score !== undefined && <div><span className="eyebrow" style={{display:'block', marginBottom:'5px'}}>Score</span> <strong style={{ fontSize: '18px' }}>{selectedTeam.score}</strong></div>}
                
                {selectedTeam?.tags && selectedTeam.tags.length > 0 && (
                    <div>
                        <span className="eyebrow" style={{display:'block', marginBottom:'8px'}}>Tags</span>
                        <div style={{display:'flex', gap:'8px', flexWrap:'wrap'}}>
                           {selectedTeam.tags.map(t => <span key={t} className="team-chip">{t}</span>)}
                        </div>
                    </div>
                )}

                {selectedTeam?.stats && (
                    <div>
                        <span className="eyebrow" style={{display:'block', marginBottom:'5px'}}>Stats</span>
                        <div style={{ display: 'flex', gap: '30px', fontSize: '16px' }}>
                           <span>Wins: <strong>{selectedTeam.stats.wins}</strong></span>
                           <span>Losses: <strong>{selectedTeam.stats.losses}</strong></span>
                        </div>
                    </div>
                )}

                {selectedTeam?.players && selectedTeam.players.length > 0 && (
                    <div>
                        <span className="eyebrow" style={{display:'block', marginBottom:'5px'}}>Players</span>
                        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '16px', lineHeight: '1.6' }}>
                           {selectedTeam.players.map((p, i) => (
                               <li key={i}><strong>{p.name}</strong> <span style={{ color: 'var(--muted)' }}>({p.role})</span></li>
                           ))}
                        </ul>
                    </div>
                )}
             </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default App
