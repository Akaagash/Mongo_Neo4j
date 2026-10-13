import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutGrid,
  UserCheck,
  Target,
  Activity,
  Swords,
  Layers,
  Database,
  Network
} from 'lucide-react';

export default function Sidebar() {
  return (
    <aside className="app-sidebar">
      {/* Brand - Clean minimalist text with no AI icon */}
      <div className="brand-header">
        <div className="brand-title">analytics.</div>
      </div>

      {/* Navigation Links - Simple, clean, no "new" text */}
      <NavLink
        to="/"
        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        end
      >
        <LayoutGrid size={17} />
        <span>Dashboard</span>
      </NavLink>

      <NavLink
        to="/player-analytics"
        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
      >
        <UserCheck size={17} />
        <span>Player Analytics</span>
      </NavLink>

      <NavLink
        to="/delivery-dynamics"
        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
      >
        <Target size={17} />
        <span>Delivery Dynamics</span>
      </NavLink>

      <NavLink
        to="/phase-telemetry"
        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
      >
        <Activity size={17} />
        <span>Phase Telemetry</span>
      </NavLink>

      <NavLink
        to="/matchup-duels"
        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
      >
        <Swords size={17} />
        <span>Matchup Duels</span>
      </NavLink>

      <NavLink
        to="/pitch-matrix"
        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
      >
        <Layers size={17} />
        <span>Pitch Matrix</span>
      </NavLink>

      <div className="nav-group-title">Data Engines</div>

      <NavLink
        to="/mongo-store"
        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
      >
        <Database size={15} style={{ color: '#2563eb' }} />
        <span>MongoDB Atlas</span>
      </NavLink>

      <NavLink
        to="/neo4j-graph"
        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
      >
        <Network size={15} style={{ color: '#7c3aed' }} />
        <span>Neo4j Aura</span>
      </NavLink>
    </aside>
  );
}
