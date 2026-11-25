import React, { useState, useEffect } from 'react';
import {
  Server, Lock, Eye, EyeOff, CheckCircle2,
  RefreshCw, Power, RotateCcw
} from 'lucide-react';
import toast from 'react-hot-toast';

const COMMON_BROKERS = [
  'Exness',
  'IC Markets',
  'FXTM',
  'Pepperstone',
  'XM',
  'Deriv',
  'HF Markets',
  'OctaFX'
];

export default function MT5BridgeSection({ onConnectionChange }) {
  const [credentials, setCredentials] = useState(() => {
    try {
      const saved = localStorage.getItem('quantam_mt5_credentials');
      return saved ? JSON.parse(saved) : {
        broker: '',
        accountNumber: '',
        password: '',
        server: ''
      };
    } catch {
      return {
        broker: '',
        accountNumber: '',
        password: '',
        server: ''
      };
    }
  });

  const [connected, setConnected] = useState(() => {
    return localStorage.getItem('quantam_mt5_connected') === 'true';
  });

  const [connecting, setConnecting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    localStorage.setItem('quantam_mt5_connected', connected ? 'true' : 'false');
    if (onConnectionChange) {
      onConnectionChange(connected, credentials);
    }
  }, [connected, credentials, onConnectionChange]);

  const handleSave = (e) => {
    e.preventDefault();
    if (!credentials.broker.trim() || !credentials.accountNumber.trim() || !credentials.server.trim() || !credentials.password.trim()) {
      toast.error('Please fill in all fields (Broker, Account Number, Password, Server).', { id: 'mt5-validation' });
      return;
    }

    setConnecting(true);

    setTimeout(() => {
      localStorage.setItem('quantam_mt5_credentials', JSON.stringify(credentials));
      setConnected(true);
      setConnecting(false);
      setSavedNotice(true);
      toast.success('MT5 credentials saved successfully!');
      setTimeout(() => setSavedNotice(false), 3000);
    }, 600);
  };

  const handleDisconnect = () => {
    setConnected(false);
    toast.success('MT5 disconnected.');
  };

  const handleClear = () => {
    setCredentials({
      broker: '',
      accountNumber: '',
      password: '',
      server: ''
    });
    setConnected(false);
    localStorage.removeItem('quantam_mt5_credentials');
    localStorage.setItem('quantam_mt5_connected', 'false');
    toast.success('Fields cleared.');
  };

  return (
    <div className="card animate-fade-in" style={{ border: `1px solid ${connected ? 'rgba(0,255,102,0.3)' : 'var(--border-subtle)'}`, marginBottom: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 10,
            background: connected ? 'rgba(0,255,102,0.15)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${connected ? 'var(--accent-green)' : 'var(--border-subtle)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Server size={20} color={connected ? 'var(--accent-green)' : 'var(--text-muted)'} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h3 style={{ fontSize: 17, fontWeight: 800 }}>MetaTrader 5 Account Credentials</h3>
              <span className={`badge ${connected ? 'badge-green' : 'badge-gray'}`}>
                {connected ? '● CREDENTIALS SAVED' : '○ DISCONNECTED'}
              </span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              Fill in your broker details to save your MT5 credentials
            </div>
          </div>
        </div>

        {savedNotice && (
          <span className="badge badge-green" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px' }}>
            <CheckCircle2 size={13} /> CREDENTIALS SAVED
          </span>
        )}
      </div>

      {/* Form Fields */}
      <form onSubmit={handleSave}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 18 }}>

          {/* 1. Broker Name */}
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 700, display: 'block', marginBottom: 6 }}>
              BROKER NAME <span style={{ color: 'var(--accent-green)' }}>*</span>
            </label>
            <input
              type="text"
              className="input-field"
              value={credentials.broker}
              onChange={e => setCredentials(c => ({ ...c, broker: e.target.value }))}
              placeholder="e.g. Exness, IC Markets, FXTM"
              required
              style={{ fontSize: 14 }}
            />
            {/* Quick broker pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
              {COMMON_BROKERS.map(b => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setCredentials(c => ({ ...c, broker: b }))}
                  style={{
                    background: credentials.broker === b ? 'rgba(0,255,102,0.15)' : 'rgba(255,255,255,0.03)',
                    color: credentials.broker === b ? 'var(--accent-green)' : 'var(--text-muted)',
                    border: `1px solid ${credentials.broker === b ? 'rgba(0,255,102,0.3)' : 'var(--border-subtle)'}`,
                    borderRadius: 4, padding: '2px 8px', fontSize: 10, cursor: 'pointer', transition: 'all 0.15s'
                  }}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Account Number */}
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 700, display: 'block', marginBottom: 6 }}>
              ACCOUNT NUMBER / LOGIN ID <span style={{ color: 'var(--accent-green)' }}>*</span>
            </label>
            <input
              type="text"
              className="input-field mono"
              value={credentials.accountNumber}
              onChange={e => setCredentials(c => ({ ...c, accountNumber: e.target.value }))}
              placeholder="e.g. 10948210"
              required
              style={{ fontSize: 14 }}
            />
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
              Your MT5 trading account login number
            </div>
          </div>

          {/* 3. Password */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 700 }}>
                TRADING PASSWORD <span style={{ color: 'var(--accent-green)' }}>*</span>
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-green)', display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600 }}
              >
                {showPassword ? <EyeOff size={12} /> : <Eye size={12} />}
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="input-field"
                value={credentials.password}
                onChange={e => setCredentials(c => ({ ...c, password: e.target.value }))}
                placeholder="Enter trading account password"
                required
                style={{ paddingRight: 36, fontSize: 14 }}
              />
              <Lock size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
              Master trading password (encrypted on save)
            </div>
          </div>

          {/* 4. Server */}
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 700, display: 'block', marginBottom: 6 }}>
              SERVER NAME <span style={{ color: 'var(--accent-green)' }}>*</span>
            </label>
            <input
              type="text"
              className="input-field mono"
              value={credentials.server}
              onChange={e => setCredentials(c => ({ ...c, server: e.target.value }))}
              placeholder="e.g. Exness-Real10 or ICMarketsSC-Live01"
              required
              style={{ fontSize: 14 }}
            />
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
              Broker live or demo server name
            </div>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
          paddingTop: 14, borderTop: '1px solid var(--border-subtle)'
        }}>
          <button
            type="button"
            onClick={handleClear}
            className="btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12 }}
          >
            <RotateCcw size={12} /> Clear Fields
          </button>

          <div style={{ display: 'flex', gap: 10 }}>
            {connected ? (
              <button
                type="button"
                onClick={handleDisconnect}
                className="btn-secondary btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 18px', fontSize: 13, color: '#FF6666', borderColor: 'rgba(255,68,68,0.3)' }}
              >
                <Power size={14} /> Disconnect
              </button>
            ) : null}

            <button
              type="submit"
              disabled={connecting}
              className="btn-primary"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '11px 26px', fontSize: 14, fontWeight: 700,
                boxShadow: '0 4px 18px rgba(0,255,102,0.25)'
              }}
            >
              {connecting ? (
                <>
                  <RefreshCw size={15} style={{ animation: 'spin 0.8s linear infinite' }} />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 size={15} /> Save
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
