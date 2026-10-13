import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import DashboardHeader from './components/DashboardHeader';
import ConcentricGaugeCard from './components/ConcentricGaugeCard';
import CapsulePillarsChart from './components/CapsulePillarsChart';
import SegmentedBowlingStyles from './components/SegmentedBowlingStyles';
import BottomCards from './components/BottomCards';
import PlayerDeepDive from './components/PlayerDeepDive';
import {
  DeliveryDynamicsView,
  PhaseTelemetryView,
  MatchupDuelsView,
  PitchMatrixView,
  MongoStoreView,
  Neo4jGraphView
} from './components/TelemetryViews';
import ViewDetail from './components/ViewDetail';

export default function App() {
  const location = useLocation();
  const isDetail = location.pathname === '/view-detail';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [overview, setOverview] = useState(null);
  const [playerPerf, setPlayerPerf] = useState(null);
  const [teamPerf, setTeamPerf] = useState(null);
  const [playerImpact, setPlayerImpact] = useState(null);
  const [matchups, setMatchups] = useState(null);
  const [deliveryAnalytics, setDeliveryAnalytics] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [resOverview, resPlayer, resTeam, resImpact, resMatch, resDelivery] = await Promise.all([
        fetch('/api/v1/overview').then(r => r.json()),
        fetch('/api/v1/player-performance').then(r => r.json()),
        fetch('/api/v1/team-performance').then(r => r.json()),
        fetch('/api/v1/player-impact').then(r => r.json()),
        fetch('/api/v1/matchups').then(r => r.json()),
        fetch('/api/v1/delivery-analytics').then(r => r.json())
      ]);

      if (resOverview.success) setOverview(resOverview);
      if (resPlayer.success) setPlayerPerf(resPlayer);
      if (resTeam.success) setTeamPerf(resTeam);
      if (resImpact.success) setPlayerImpact(resImpact);
      if (resMatch.success) setMatchups(resMatch);
      if (resDelivery.success) setDeliveryAnalytics(resDelivery);
    } catch (err) {
      console.error('Data fetch error:', err);
      setError('Backend connection error. Make sure port 5003 is active.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const renderDashboard = (detailMode = false) => (
    <div className="dashboard-canvas">
      {error && (
        <div style={{
          background: '#fee2e2',
          border: '1px solid #fecaca',
          color: '#b91c1c',
          padding: '0.85rem 1.25rem',
          borderRadius: '12px',
          fontSize: '0.8125rem'
        }}>
          {error}
        </div>
      )}

      {/* Row 1: Split Grid (Left: Capsule Pillars | Right: Concentric Rings) */}
      <div className="split-layout-grid">
        <CapsulePillarsChart
          deliveryData={deliveryAnalytics?.data}
          meta={deliveryAnalytics?.meta}
          isDetail={detailMode}
        />
        <ConcentricGaugeCard
          isDetail={detailMode}
        />
      </div>

      {/* Row 3: Split Grid (Left: Active Bowling Variations | Right: Key Player Causal Impact) */}
      <div className="split-layout-grid">
        <SegmentedBowlingStyles
          deliveryData={deliveryAnalytics?.data}
          meta={deliveryAnalytics?.meta}
          isDetail={detailMode}
        />
        <BottomCards
          playerImpacts={playerImpact?.data}
          metaImpact={playerImpact?.meta}
          isDetail={detailMode}
        />
      </div>
    </div>
  );

  const getPageTitle = () => {
    if (isDetail) return 'Data Processing Architecture';
    switch (location.pathname) {
      case '/player-analytics': return 'Player Deep Dive Analytics';
      case '/delivery-dynamics': return 'Delivery Dynamics';
      case '/phase-telemetry': return 'Phase Telemetry';
      case '/matchup-duels': return 'Matchup Duels';
      case '/pitch-matrix': return 'Pitch Surface Matrix';
      case '/mongo-store': return 'MongoDB Telemetry Store';
      case '/neo4j-graph': return 'Neo4j Aura Graph Engine';
      default: return 'Dashboard';
    }
  };

  return (
    <div className="app-shell">
      {/* Sidebar matching reference */}
      {!isDetail && <Sidebar />}

      {/* Main Viewport */}
      <div className="main-viewport" style={{ padding: isDetail ? '0' : undefined, height: isDetail ? '100vh' : undefined, overflowY: isDetail ? 'auto' : undefined }}>
        {!isDetail && (
          <DashboardHeader
            title={getPageTitle()}
            isDetail={isDetail}
          />
        )}

        <Routes>
          {/* Main Dashboard */}
          <Route path="/" element={renderDashboard(false)} />

          {/* Direct Route for View Detail */}
          <Route path="/view-detail" element={
            <div className="dashboard-canvas">
              <ViewDetail />
            </div>
          } />

          {/* Granular Per-Player Analytics Route */}
          <Route path="/player-analytics" element={
            <div className="dashboard-canvas">
              <PlayerDeepDive isDetail={isDetail} />
            </div>
          } />

          {/* Delivery Dynamics Route */}
          <Route path="/delivery-dynamics" element={
            <div className="dashboard-canvas">
              <DeliveryDynamicsView deliveryData={deliveryAnalytics?.data} meta={deliveryAnalytics?.meta} isDetail={isDetail} />
            </div>
          } />

          {/* Phase Telemetry Route */}
          <Route path="/phase-telemetry" element={
            <div className="dashboard-canvas">
              <PhaseTelemetryView
                deliveryData={deliveryAnalytics?.data}
                playerPerfData={playerPerf?.data}
                metaDelivery={deliveryAnalytics?.meta}
                metaPlayer={playerPerf?.meta}
                isDetail={isDetail}
              />
            </div>
          } />

          {/* Matchup Duels Route */}
          <Route path="/matchup-duels" element={
            <div className="dashboard-canvas">
              <MatchupDuelsView
                matchups={matchups?.data}
                playerImpacts={playerImpact?.data}
                metaMatchups={matchups?.meta}
                metaImpact={playerImpact?.meta}
                isDetail={isDetail}
              />
            </div>
          } />

          {/* Pitch Surface Matrix Route */}
          <Route path="/pitch-matrix" element={
            <div className="dashboard-canvas">
              <PitchMatrixView deliveryData={deliveryAnalytics?.data} meta={deliveryAnalytics?.meta} isDetail={isDetail} />
            </div>
          } />

          {/* MongoDB Store Route */}
          <Route path="/mongo-store" element={
            <div className="dashboard-canvas">
              <MongoStoreView overviewData={overview?.data} isDetail={isDetail} />
            </div>
          } />

          {/* Neo4j Graph Route */}
          <Route path="/neo4j-graph" element={
            <div className="dashboard-canvas">
              <Neo4jGraphView overviewData={overview?.data} isDetail={isDetail} />
            </div>
          } />
        </Routes>
      </div>
    </div>
  );
}
