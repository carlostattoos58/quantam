import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const INITIAL_PAIRS = [
  { symbol: 'EUR/USD', bid: 1.08450, ask: 1.08462, change: +0.28, type: 'forex' },
  { symbol: 'GBP/USD', bid: 1.29120, ask: 1.29135, change: -0.14, type: 'forex' },
  { symbol: 'USD/JPY', bid: 154.680, ask: 154.695, change: +0.45, type: 'forex' },
  { symbol: 'XAU/USD', bid: 2685.40, ask: 2685.75, change: +1.15, type: 'metals' },
  { symbol: 'BTC/USD', bid: 94820.0, ask: 94845.0, change: +3.42, type: 'crypto' },
  { symbol: 'USD/CHF', bid: 0.88720, ask: 0.88734, change: -0.08, type: 'forex' },
  { symbol: 'AUD/USD', bid: 0.65210, ask: 0.65223, change: +0.19, type: 'forex' },
  { symbol: 'USD/CAD', bid: 1.39850, ask: 1.39865, change: -0.22, type: 'forex' },
  { symbol: 'NZD/USD', bid: 0.58940, ask: 0.58955, change: +0.05, type: 'forex' },
  { symbol: 'EUR/GBP', bid: 0.83980, ask: 0.83992, change: +0.12, type: 'forex' },
  { symbol: 'ETH/USD', bid: 3420.50, ask: 3422.00, change: +2.10, type: 'crypto' },
];

export default function LiveMarketTicker() {
  const [pairs, setPairs] = useState(INITIAL_PAIRS);
  const [lastUpdated, setLastUpdated] = useState({});

  useEffect(() => {
    const interval = setInterval(() => {
      // Pick 2-3 random pairs to tick
      const count = Math.floor(Math.random() * 3) + 1;
      const updatedPairs = [...pairs];
      const newlyUpdated = {};

      for (let i = 0; i < count; i++) {
        const randomIndex = Math.floor(Math.random() * updatedPairs.length);
        const item = { ...updatedPairs[randomIndex] };
        const pip = item.symbol.includes('JPY') ? 0.01 : item.symbol.includes('BTC') ? 5 : item.symbol.includes('XAU') ? 0.2 : 0.0001;
        const delta = (Math.random() - 0.48) * pip * (Math.random() * 2 + 1);
        const decimals = item.symbol.includes('JPY') ? 3 : item.symbol.includes('BTC') || item.symbol.includes('XAU') || item.symbol.includes('ETH') ? 2 : 5;
        
        item.bid = parseFloat((item.bid + delta).toFixed(decimals));
        item.ask = parseFloat((item.bid + (item.ask - item.bid)).toFixed(decimals));
        item.change = parseFloat((item.change + (delta > 0 ? 0.02 : -0.02)).toFixed(2));
        
        updatedPairs[randomIndex] = item;
        newlyUpdated[item.symbol] = delta >= 0 ? 'up' : 'down';
      }

      setPairs(updatedPairs);
      setLastUpdated(newlyUpdated);

      // Clear flash after 800ms
      setTimeout(() => {
        setLastUpdated({});
      }, 800);
    }, 1800);

    return () => clearInterval(interval);
  }, [pairs]);

  return (
    <div style={{
      background: 'rgba(10, 14, 12, 0.95)',
      borderBottom: '1px solid var(--border-subtle)',
      overflowX: 'auto',
      whiteSpace: 'nowrap',
      padding: '8px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: '24px',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, paddingRight: 12, borderRight: '1px solid var(--border-subtle)' }}>
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent-green)', animation: 'pulseDot 1.5s infinite' }} />
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-green)', letterSpacing: '1px' }}>
          LIVE MARKETS
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        {pairs.map((p) => {
          const isUp = p.change >= 0;
          const flash = lastUpdated[p.symbol];
          return (
            <div
              key={p.symbol}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '4px 10px',
                borderRadius: '6px',
                background: flash === 'up' ? 'rgba(0, 255, 102, 0.15)' : flash === 'down' ? 'rgba(255, 68, 68, 0.15)' : 'rgba(255,255,255,0.02)',
                transition: 'background 0.3s ease',
                fontSize: 12,
                cursor: 'pointer'
              }}
            >
              <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontFamily: "'JetBrains Mono', monospace" }}>
                {p.symbol}
              </span>
              <span
                style={{
                  fontWeight: 600,
                  fontFamily: "'JetBrains Mono', monospace",
                  color: flash === 'up' ? 'var(--accent-green)' : flash === 'down' ? '#FF6666' : 'var(--text-primary)',
                  transition: 'color 0.2s'
                }}
              >
                {p.bid.toLocaleString(undefined, { minimumFractionDigits: p.symbol.includes('JPY') ? 3 : p.symbol.includes('BTC') || p.symbol.includes('XAU') ? 2 : 5 })}
              </span>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 2,
                  fontSize: 11,
                  fontWeight: 600,
                  color: isUp ? 'var(--accent-green)' : '#FF6666'
                }}
              >
                {isUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                {isUp ? `+${p.change}%` : `${p.change}%`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
