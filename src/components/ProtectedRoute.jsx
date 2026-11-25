import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function ProtectedRoute({ requireAdmin = false }) {
  const { user, profile, loading } = useAuth();

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid rgba(0,255,102,0.2)', borderTopColor: 'var(--accent-green)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading...</div>
      </div>
    </div>
  );

  if (!user) return <Navigate to="/" replace />;

  if (profile?.status === 'suspended') return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
      <div style={{ textAlign: 'center', maxWidth: 400, padding: 40 }}>
        <div style={{ fontSize: 48, marginBottom: 20 }}>🚫</div>
        <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, color: 'var(--danger)' }}>Account Suspended</div>
        <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Your account has been suspended. Please contact your administrator.</div>
      </div>
    </div>
  );

  if (requireAdmin && profile?.role !== 'admin') return <Navigate to="/dashboard" replace />;

  return <Outlet />;
}
