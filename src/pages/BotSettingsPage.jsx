import React from 'react';
import BotSettingsSection from '../components/BotSettingsSection';
import { Sliders, Zap, ShieldAlert, Award } from 'lucide-react';

export default function BotSettingsPage() {
  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Bot Settings & Risk Management</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          Fine-tune lot sizing, daily drawdown stop limits, and automated profit targets
        </p>
      </div>

      <BotSettingsSection />

      {/* Strategy and Risk Rules breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(255,179,71,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldAlert size={18} color="var(--warning)" />
            </div>
            <h3 style={{ fontSize: 14, fontWeight: 700 }}>Capital Preservation Rule</h3>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
            When the daily loss limit is hit, the algorithm immediately executes protective market stops, closes exposed floating positions, and halts trading until the next daily session.
          </p>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(0,255,102,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={18} color="var(--accent-green)" />
            </div>
            <h3 style={{ fontSize: 14, fontWeight: 700 }}>Target Lock Mechanism</h3>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Once the configured Daily Profit Target is achieved, all remaining partials are secured into the balance, safeguarding gains from high-impact market reversals.
          </p>
        </div>
      </div>
    </div>
  );
}
