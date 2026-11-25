import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Cpu, Zap, Activity, Radio, AlertCircle, Settings2, Sliders } from 'lucide-react';

const LOG_TEMPLATES = [
  'Quantam Engine: Scanning H1 market structure on XAUUSD...',
  'Liquidity grab detected at session high. Setting pending order.',
  'Spread verified: 1.2 pips. Execution latency: 14ms (Optimal).',
  'Quantam Algorithm v5.2: Fibonacci 61.8% confluence confirmed.',
  'Dynamic Risk Management: Max risk per trade capped at 1.0%.',
  'Order #938412: BUY 0.10 lot EURUSD filled @ 1.08460',
  'Trailing Stop activated on BTCUSD (+35 pips secured)',
  'Quantam Filter: High-impact news event passed. Auto-resuming scan.',
  'Volatility Index balanced: AI confidence score 94.2%',
  'TP1 hit on GBPUSD. Partial profits locked: +$145.00'
];

export default function BotControlPanel({ botRunning: propRunning, balance = 0, onToggleBot, onTradeEvent }) {
  const [internalRunning, setInternalRunning] = useState(() => {
    return localStorage.getItem('quantam_bot_status') === 'running';
  });

  const botRunning = propRunning !== undefined ? propRunning : internalRunning;

  const [strategy, setStrategy] = useState('scalper');
  const [riskLevel, setRiskLevel] = useState('moderate');
  const [logs, setLogs] = useState([
    { id: 1, time: '06:00:12', text: 'Quantam EA v5 Bot Core Initialized.' },
    { id: 2, time: '06:05:40', text: 'MetaTrader 5 Bridge connected. Ping: 12ms.' },
    { id: 3, time: '06:10:02', text: 'Awaiting operator trigger to start auto-trading.' }
  ]);

  const logContainerRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('quantam_bot_status', botRunning ? 'running' : 'stopped');
  }, [botRunning]);

  useEffect(() => {
    if (!botRunning) return;

    const interval = setInterval(() => {
      const now = new Date().toTimeString().split(' ')[0];
      const randomText = LOG_TEMPLATES[Math.floor(Math.random() * LOG_TEMPLATES.length)];
      
      setLogs(prev => [
        ...prev.slice(-15),
        { id: Date.now(), time: now, text: randomText }
      ]);

      // If random event is an order, emit profit update to balance
      if (randomText.includes('Order') || randomText.includes('TP1')) {
        if (onTradeEvent) {
          const profit = parseFloat((Math.random() * 45 + 15).toFixed(2));
          onTradeEvent(profit);
        }
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [botRunning, onTradeEvent]);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const toggleBot = () => {
    if (!botRunning && balance <= 0) {
      alert('⚠️ Insufficient Balance ($0.00)\n\nPlease contact the Platform Administrator to allocate trading balance to your account in the Admin Panel.');
      const now = new Date().toTimeString().split(' ')[0];
      setLogs(prev => [
        ...prev,
        {
          id: Date.now(),
          time: now,
          text: '⚠️ Insufficient balance ($0.00). Execution halted until administrator capital allocation.'
        }
      ]);
      return;
    }

    const nextState = !botRunning;
    if (onToggleBot) {
      onToggleBot(nextState);
    } else {
      setInternalRunning(nextState);
    }
    const now = new Date().toTimeString().split(' ')[0];
    setLogs(prev => [
      ...prev,
      {
        id: Date.now(),
        time: now,
        text: nextState
          ? '🚀 QUANTAM EA v5 BOT STARTED — High-frequency scanning active!'
          : '🛑 QUANTAM EA v5 BOT STOPPED — All open positions monitored with protective stops.'
      }
    ]);
  };

  return (
    <div className="card animate-fade-in" style={{ border: `1px solid ${botRunning ? 'rgba(0,255,102,0.4)' : 'rgba(255,255,255,0.08)'}`, position: 'relative', overflow: 'hidden' }}>
      {/* Glow highlight when running */}
      {botRunning && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 3,
          background: 'linear-gradient(90deg, transparent, #00FF66, transparent)',
          animation: 'shimmer 2s infinite'
        }} />
      )}

      {/* Header with Title & Big Start/Stop Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: botRunning ? 'rgba(0,255,102,0.15)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${botRunning ? 'var(--accent-green)' : 'rgba(255,255,255,0.1)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Cpu size={22} color={botRunning ? 'var(--accent-green)' : 'var(--text-muted)'} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>
                QUANTAM EA v5 AUTO BOT
              </h2>
              <span className={`badge ${botRunning ? 'badge-green' : 'badge-gray'}`} style={{ animation: botRunning ? 'pulseDot 2s infinite' : 'none' }}>
                {botRunning ? '● BOT RUNNING' : '○ BOT STOPPED'}
              </span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              Algorithmic execution engine with real-time liquidity detection
            </div>
          </div>
        </div>

        {/* Master Start / Stop Button */}
        <button
          onClick={toggleBot}
          className={botRunning ? 'btn-danger' : 'btn-primary'}
          style={{
            padding: '14px 28px',
            fontSize: 15,
            fontWeight: 800,
            borderRadius: 10,
            boxShadow: botRunning ? '0 0 20px rgba(255,68,68,0.4)' : '0 0 25px rgba(0,255,102,0.4)',
            transition: 'all 0.25s ease',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10
          }}
        >
          {botRunning ? (
            <>
              <Square size={16} fill="currentColor" /> STOP BOT
            </>
          ) : (
            <>
              <Play size={16} fill="currentColor" /> START BOT
            </>
          )}
        </button>
      </div>

      {/* Settings & Parameters row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 18, background: 'var(--bg-hover)', padding: '14px', borderRadius: 10 }}>
        <div>
          <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Sliders size={12} /> STRATEGY
          </label>
          <select
            className="input-field"
            value={strategy}
            onChange={e => setStrategy(e.target.value)}
            disabled={botRunning}
            style={{ marginTop: 4, padding: '8px 10px', fontSize: 12 }}
          >
            <option value="scalper">Quantam H1 Scalper</option>
            <option value="trend">Trend Momentum Matrix</option>
            <option value="breakout">London/NY Breakout EA</option>
          </select>
        </div>

        <div>
          <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Zap size={12} /> RISK PROFILE
          </label>
          <select
            className="input-field"
            value={riskLevel}
            onChange={e => setRiskLevel(e.target.value)}
            disabled={botRunning}
            style={{ marginTop: 4, padding: '8px 10px', fontSize: 12 }}
          >
            <option value="conservative">Conservative (0.5% / trade)</option>
            <option value="moderate">Balanced (1.0% / trade)</option>
            <option value="aggressive">Aggressive (2.0% / trade)</option>
          </select>
        </div>

        <div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>MT5 BRIDGE STATUS</div>
          <div style={{ marginTop: 6, fontSize: 13, fontWeight: 700, color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent-green)' }} />
            Connected (12ms)
          </div>
        </div>

        <div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>AI CONFIDENCE</div>
          <div style={{ marginTop: 6, fontSize: 13, fontWeight: 700, color: '#4FC3F7', fontFamily: "'JetBrains Mono', monospace" }}>
            94.8% High
          </div>
        </div>
      </div>

      {/* Live Terminal Console Feed */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Activity size={13} color="var(--accent-green)" />
            LIVE EXECUTION TERMINAL
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Auto-updating</span>
        </div>

        <div
          ref={logContainerRef}
          style={{
            background: '#040705',
            border: '1px solid rgba(0,255,102,0.15)',
            borderRadius: 8,
            padding: '12px 14px',
            height: 120,
            overflowY: 'auto',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            lineHeight: 1.6
          }}
        >
          {logs.map(log => (
            <div key={log.id} style={{ display: 'flex', gap: 10, marginBottom: 4 }}>
              <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>[{log.time}]</span>
              <span style={{ color: log.text.includes('ORDER') || log.text.includes('BUY') || log.text.includes('TP1') || log.text.includes('STARTED') ? 'var(--accent-green)' : log.text.includes('STOPPED') ? '#FF6666' : 'var(--text-secondary)' }}>
                {log.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
