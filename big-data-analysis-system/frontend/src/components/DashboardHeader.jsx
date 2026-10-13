import React from 'react';
import { Search } from 'lucide-react';

export default function DashboardHeader({ title, isDetail = false }) {
  return (
    <header className="dashboard-header">
      <div className="greeting-text">
        {isDetail ? 'Data Processing Architecture' : (title || 'Dashboard')}
      </div>

      <div className="search-box-pill">
        <Search size={15} style={{ color: 'var(--text-light)' }} />
        <input type="text" placeholder="Search telemetry, players, matches..." readOnly />
      </div>
    </header>
  );
}
