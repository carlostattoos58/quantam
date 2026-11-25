import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import ActivationGate from './pages/ActivationGate';
import AuthPage from './pages/AuthPage';
import AppLayout from './layouts/AppLayout';
import Dashboard from './pages/Dashboard';
import TradingSignals from './pages/TradingSignals';
import MarketAnalysis from './pages/MarketAnalysis';
import EAInfo from './pages/EAInfo';
import Performance from './pages/Performance';
import LearningCentre from './pages/LearningCentre';
import Announcements from './pages/Announcements';
import Community from './pages/Community';
import MyProfile from './pages/MyProfile';
import Support from './pages/Support';
import MT5ConnectionPage from './pages/MT5ConnectionPage';
import BotSettingsPage from './pages/BotSettingsPage';
import AdminPanel from './pages/admin/AdminPanel';
import './index.css';

function AppRouter() {
  const { user, loading } = useAuth();
  const [activationData, setActivationData] = useState(null);

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
      <div style={{ width: 48, height: 48, border: '3px solid rgba(0,255,102,0.2)', borderTopColor: 'var(--accent-green)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  return (
    <Routes>
      {/* Public entry point */}
      <Route path="/" element={
        user ? <Navigate to="/dashboard" replace /> :
        activationData ? (
          <AuthPage activationData={activationData} onBackToGate={() => setActivationData(null)} />
        ) : (
          <ActivationGate onActivated={setActivationData} />
        )
      } />

      {/* Protected member routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/mt5-connection" element={<MT5ConnectionPage />} />
          <Route path="/bot-settings" element={<BotSettingsPage />} />
          <Route path="/signals" element={<TradingSignals />} />
          <Route path="/analysis" element={<MarketAnalysis />} />
          <Route path="/ea-info" element={<EAInfo />} />
          <Route path="/performance" element={<Performance />} />
          <Route path="/learn" element={<LearningCentre />} />
          <Route path="/announcements" element={<Announcements />} />
          <Route path="/community" element={<Community />} />
          <Route path="/profile" element={<MyProfile />} />
          <Route path="/support" element={<Support />} />
        </Route>
      </Route>

      {/* Admin routes - strictly protected with @Slime25 passcode inside AdminPanel */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/admin" element={<AdminPanel />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRouter />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              border: '1px solid rgba(0,255,102,0.2)',
              borderRadius: '10px',
              fontSize: '14px'
            },
            success: { iconTheme: { primary: 'var(--accent-green)', secondary: '#000' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
