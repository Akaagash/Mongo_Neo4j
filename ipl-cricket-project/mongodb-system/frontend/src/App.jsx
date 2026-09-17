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
          <span>Data desk</span>
        </a>
        <div className={`status status-${status}`}>
          <span className="status-dot" aria-hidden="true" />
          {statusLabel}
        </div>
      </header>

      <section className="intro">
        <div>
          <p className="eyebrow">MongoDB / ipl_list</p>
          <h1>Teams at a glance.</h1>
          <p className="lede">
            A live view of your seeded IPL records, served directly from the MongoDB backend.
          </p>
        </div>
        <div className="intro-stat">
          <span className="stat-label">Records in collection</span>
          <strong>{status === 'connected' ? teams.length : '--'}</strong>
          <span className="stat-meta">/ipl_list</span>
        </div>
      </section>

      <section className="workspace" aria-label="IPL teams">
        <div className="toolbar">
          <label className="search-box">
            <span aria-hidden="true">⌕</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search teams, cities, captains"
              type="search"
            />
          </label>
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
              <article className="team-card" key={team._id || team.name}>
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

      <footer className="footer">
        <span>Source: Express API · {API_URL}</span>
        <span>{lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Waiting for data'}</span>
      </footer>
    </main>
  )
}

export default App
