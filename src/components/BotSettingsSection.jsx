import React, { useState, useEffect } from 'react';
import { Sliders, ShieldAlert, Target, DollarSign, CheckCircle2, Save } from 'lucide-react';

export default function BotSettingsSection({ onSettingsSaved }) {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('quantam_bot_settings');
      return saved ? JSON.parse(saved) : {
        lotSize: 0.02,
        dailyLossLimit: 150.0,
        dailyProfitLimit: 300.0,
        autoHaltOnLoss: true,
        maxOpenTrades: 3
      };
    } catch {
      return {
        lotSize: 0.02,
        dailyLossLimit: 150.0,
        dailyProfitLimit: 300.0,
        autoHaltOnLoss: true,
        maxOpenTrades: 3
      };
    }
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('quantam_bot_settings', JSON.stringify(settings));
    setSavedSuccess(true);
    if (onSettingsSaved) {
      onSettingsSaved(settings);
    }
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="card animate-fade-in" style={{ marginBottom: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(0,255,102,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sliders size={18} color="var(--accent-green)" />
          </div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 800 }}>Bot Trading & Risk Settings</h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Configure execution parameters & daily risk controls</p>
          </div>
        </div>

        {savedSuccess && (
          <span className="badge badge-green" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <CheckCircle2 size={12} /> SETTINGS SAVED
          </span>
        )}
      </div>

      <form onSubmit={handleSave}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 16 }}>
          {/* 1. Lot Size */}
          <div>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
              TRADING LOT SIZE
            </label>
            <div style={{ position: 'relative', marginTop: 6 }}>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max="10.00"
                className="input-field mono"
                value={settings.lotSize}
                onChange={e => setSettings(s => ({ ...s, lotSize: parseFloat(e.target.value) || 0.01 }))}
                required
                style={{ fontSize: 14 }}
              />
            </div>
            <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
              {[0.01, 0.02, 0.05, 0.10, 0.50].map(lot => (
                <button
                  key={lot}
                  type="button"
                  onClick={() => setSettings(s => ({ ...s, lotSize: lot }))}
                  className="btn-secondary btn-sm"
                  style={{ flex: 1, padding: '3px 4px', fontSize: 10 }}
                >
                  {lot}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Daily Loss Limit */}
          <div>
            <label style={{ fontSize: 11, color: '#FF6666', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
              <ShieldAlert size={12} /> DAILY LOSS LIMIT (USD)
            </label>
            <div style={{ position: 'relative', marginTop: 6 }}>
              <input
                type="number"
                step="1"
                min="10"
                className="input-field mono"
                value={settings.dailyLossLimit}
                onChange={e => setSettings(s => ({ ...s, dailyLossLimit: parseFloat(e.target.value) || 0 }))}
                placeholder="e.g. 150"
                required
                style={{ fontSize: 14, borderColor: 'rgba(255,68,68,0.2)' }}
              />
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
              Bot will automatically halt if daily drawdown hits ${settings.dailyLossLimit}
            </div>
          </div>

          {/* 3. Daily Profit Limit */}
          <div>
            <label style={{ fontSize: 11, color: 'var(--accent-green)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Target size={12} /> DAILY PROFIT TARGET (USD)
            </label>
            <div style={{ position: 'relative', marginTop: 6 }}>
              <input
                type="number"
                step="1"
                min="10"
                className="input-field mono"
                value={settings.dailyProfitLimit}
                onChange={e => setSettings(s => ({ ...s, dailyProfitLimit: parseFloat(e.target.value) || 0 }))}
                placeholder="e.g. 300"
                required
                style={{ fontSize: 14, borderColor: 'rgba(0,255,102,0.2)' }}
              />
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
              Bot locks in gains and stops when today's profit reaches ${settings.dailyProfitLimit}
            </div>
          </div>
        </div>

        {/* Save button row */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 10, borderTop: '1px solid var(--border-subtle)' }}>
          <button type="submit" className="btn-primary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Save size={13} /> Save Bot Parameters
          </button>
        </div>
      </form>
    </div>
  );
}
