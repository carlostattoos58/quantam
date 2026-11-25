import React, { useState } from 'react';
import { Wallet, Shield, AlertTriangle, Lock, PlusCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function AccountBalanceCard({ balance, profitToday, onUpdateBalance }) {
  const { isAdmin } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [newAmount, setNewAmount] = useState('');

  const equity = Math.max(0, balance + (profitToday || 0));
  const profitPercent = balance > 0 ? (((profitToday || 0) / balance) * 100).toFixed(2) : 0;
  const isProfit = (profitToday || 0) >= 0;
  const isZeroBalance = balance <= 0;

  const handleSetBalance = (e) => {
    e.preventDefault();
    const parsed = parseFloat(newAmount);
    if (!isNaN(parsed) && parsed >= 0) {
      onUpdateBalance(parsed);
      setModalOpen(false);
      setNewAmount('');
    }
  };

  return (
    <>
      <div className="card animate-fade-in" style={{ borderTop: `2px solid ${isZeroBalance ? 'var(--warning)' : 'var(--accent-green)'}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14, marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 10,
              background: isZeroBalance ? 'rgba(255,179,71,0.12)' : 'rgba(0,255,102,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Wallet size={22} color={isZeroBalance ? 'var(--warning)' : 'var(--accent-green)'} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>TRADING ACCOUNT BALANCE</span>
                <span className={`badge ${isZeroBalance ? 'badge-yellow' : 'badge-green'}`} style={{ fontSize: 10 }}>
                  {isZeroBalance ? 'UNALLOCATED ($0.00)' : 'ACTIVE CAPITAL'}
                </span>
              </div>
              <div style={{
                fontSize: 28, fontWeight: 900,
                color: isZeroBalance ? 'var(--warning)' : 'var(--text-primary)',
                fontFamily: "'JetBrains Mono', monospace", marginTop: 2
              }}>
                ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {isAdmin ? (
              <button
                onClick={() => setModalOpen(true)}
                className="btn-secondary btn-sm"
                style={{ fontSize: 12, padding: '6px 12px' }}
              >
                <PlusCircle size={13} /> Admin Capital Allocate
              </button>
            ) : (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)',
                borderRadius: 8, padding: '6px 12px', fontSize: 11, color: 'var(--text-muted)'
              }}>
                <Lock size={12} />
                <span>Admin Managed Capital</span>
              </div>
            )}
          </div>
        </div>

        {/* Zero Balance Alert Banner for Cybersecurity demonstration */}
        {isZeroBalance && (
          <div style={{
            background: 'rgba(255,179,71,0.08)',
            border: '1px solid rgba(255,179,71,0.25)',
            borderRadius: 8,
            padding: '10px 14px',
            marginBottom: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 10
          }}>
            <AlertTriangle size={16} color="var(--warning)" style={{ flexShrink: 0 }} />
            <div style={{ fontSize: 12, color: 'var(--warning)', lineHeight: 1.5 }}>
              <strong>Notice:</strong> Account balance is currently <strong>$0.00</strong>. Trading execution is paused until the Administrator allocates funds to this account.
            </div>
          </div>
        )}

        {/* Financial Sub-metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, paddingTop: 14, borderTop: '1px solid var(--border-subtle)' }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Account Equity</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', fontFamily: "'JetBrains Mono', monospace", marginTop: 2 }}>
              ${equity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Today's Floating P&L</div>
            <div style={{
              fontSize: 14, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", marginTop: 2,
              color: isProfit ? 'var(--accent-green)' : '#FF6666',
              display: 'flex', alignItems: 'center', gap: 4
            }}>
              {isProfit ? `+$${(profitToday || 0).toFixed(2)}` : `-$${Math.abs(profitToday || 0).toFixed(2)}`}
              <span style={{ fontSize: 11, opacity: 0.8 }}>({isProfit ? `+${profitPercent}%` : `${profitPercent}%`})</span>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Free Margin</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#4FC3F7', fontFamily: "'JetBrains Mono', monospace", marginTop: 2 }}>
              ${(balance * 0.94).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </div>

      {/* Adjust balance modal (for Admin) */}
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}>
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid rgba(0,255,102,0.25)', borderRadius: 16, padding: 28, width: '100%', maxWidth: 400 }}>
            <h3 style={{ fontSize: 17, fontWeight: 800, marginBottom: 6 }}>Admin Capital Allocation</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 18 }}>
              Allocate or adjust trading capital for this member account.
            </p>

            <form onSubmit={handleSetBalance}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>ENTER BALANCE (USD)</label>
                <input
                  type="number"
                  step="any"
                  className="input-field mono"
                  placeholder="e.g. 5000"
                  value={newAmount}
                  onChange={e => setNewAmount(e.target.value)}
                  autoFocus
                  required
                  style={{ fontSize: 18, marginTop: 6 }}
                />
              </div>

              {/* Quick presets */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                {[0, 1000, 5000, 10000, 25000].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setNewAmount(String(amt))}
                    className="btn-secondary btn-sm"
                    style={{ flex: 1, padding: '6px' }}
                  >
                    ${amt >= 1000 ? `${amt / 1000}k` : amt}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Confirm Allocation</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
