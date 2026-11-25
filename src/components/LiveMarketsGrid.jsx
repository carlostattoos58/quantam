import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Globe } from 'lucide-react';

const MAIN_CURRENCIES = [
  { symbol: 'EUR/USD', name: 'Euro / US Dollar', bid: 1.08450, ask: 1.08462, spread: 1.2, high: 1.08820, low: 1.08210, change: +0.28, trend: [1.0825, 1.0831, 1.0829, 1.0840, 1.0838, 1.0845] },
  { symbol: 'GBP/USD', name: 'British Pound / US Dollar', bid: 1.29120, ask: 1.29135, spread: 1.5, high: 1.29540, low: 1.28890, change: -0.14, trend: [1.2940, 1.2930, 1.2925, 1.2918, 1.2910, 1.2912] },
  { symbol: 'USD/JPY', name: 'US Dollar / Japanese Yen', bid: 154.680, ask: 154.695, spread: 1.5, high: 155.100, low: 154.200, change: +0.45, trend: [154.2, 154.4, 154.3, 154.5, 154.6, 154.68] },
  { symbol: 'XAU/USD', name: 'Spot Gold / US Dollar', bid: 2685.40, ask: 2685.75, spread: 3.5, high: 2692.10, low: 2674.80, change: +1.15, trend: [2675, 2678, 2682, 2680, 2684, 2685.4] },
  { symbol: 'BTC/USD', name: 'Bitcoin / US Dollar', bid: 94820.0, ask: 94845.0, spread: 25.0, high: 95500.0, low: 92800.0, change: +3.42, trend: [93000, 93400, 94100, 93900, 94600, 94820] },
  { symbol: 'AUD/USD', name: 'Australian Dollar / US Dollar', bid: 0.65210, ask: 0.65223, spread: 1.3, high: 0.65480, low: 0.64950, change: +0.19, trend: [0.650, 0.651, 0.6508, 0.6515, 0.6518, 0.6521] },
  { symbol: 'USD/CAD', name: 'US Dollar / Canadian Dollar', bid: 1.39850, ask: 1.39865, spread: 1.5, high: 1.40200, low: 1.39600, change: -0.22, trend: [1.401, 1.400, 1.3995, 1.3990, 1.3982, 1.3985] },
  { symbol: 'USD/CHF', name: 'US Dollar / Swiss Franc', bid: 0.88720, ask: 0.88734, spread: 1.4, high: 0.89050, low: 0.88510, change: -0.08, trend: [0.8885, 0.8880, 0.8878, 0.8870, 0.8874, 0.8872] },
  { symbol: 'NZD/USD', name: 'New Zealand Dollar / US Dollar', bid: 0.58940, ask: 0.58955, spread: 1.5, high: 0.59210, low: 0.58700, change: +0.05, trend: [0.5880, 0.5885, 0.5890, 0.5888, 0.5892, 0.5894] },
  { symbol: 'EUR/GBP', name: 'Euro / British Pound', bid: 0.83980, ask: 0.83992, spread: 1.2, high: 0.84250, low: 0.83780, change: +0.12, trend: [0.8385, 0.8390, 0.8388, 0.8394, 0.8396, 0.8398] },
  { symbol: 'ETH/USD', name: 'Ethereum / US Dollar', bid: 3420.50, ask: 3422.00, spread: 1.5, high: 3480.00, low: 3340.00, change: +2.10, trend: [3360, 3380, 3400, 3390, 3415, 3420.5] },
  { symbol: 'GBP/JPY', name: 'British Pound / Japanese Yen', bid: 199.740, ask: 199.760, spread: 2.0, high: 200.350, low: 198.900, change: +0.32, trend: [199.1, 199.3, 199.2, 199.5, 199.65, 199.74] },
];

function MiniSparkline({ points, isUp }) {
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const width = 80;
  const height = 28;
  const step = width / (points.length - 1);
  
  const pathD = points
    .map((val, idx) => {
      const x = idx * step;
      const y = height - ((val - min) / range) * (height - 6) - 3;
      return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      <path
        d={pathD}
        fill="none"
        stroke={isUp ? 'var(--accent-green)' : '#FF4444'}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function LiveMarketsGrid() {
  const [currencies, setCurrencies] = useState(MAIN_CURRENCIES);
  const [filter, setFilter] = useState('all');
  const [ticks, setTicks] = useState({});

  useEffect(() => {
    const timer = setInterval(() => {
      const idx = Math.floor(Math.random() * currencies.length);
      const curr = { ...currencies[idx] };
      const pip = curr.symbol.includes('JPY') ? 0.01 : curr.symbol.includes('BTC') ? 10 : curr.symbol.includes('XAU') ? 0.3 : 0.0001;
      const delta = (Math.random() - 0.48) * pip * (Math.random() * 2 + 1);
      const decimals = curr.symbol.includes('JPY') ? 3 : curr.symbol.includes('BTC') || curr.symbol.includes('XAU') || curr.symbol.includes('ETH') ? 2 : 5;

      curr.bid = parseFloat((curr.bid + delta).toFixed(decimals));
      curr.ask = parseFloat((curr.bid + (curr.spread * (curr.symbol.includes('JPY') ? 0.01 : 0.0001))).toFixed(decimals));
      curr.trend = [...curr.trend.slice(1), curr.bid];

      const next = [...currencies];
      next[idx] = curr;
      setCurrencies(next);

      setTicks({ [curr.symbol]: delta >= 0 ? 'up' : 'down' });
      setTimeout(() => setTicks({}), 600);
    }, 1500);

    return () => clearInterval(timer);
  }, [currencies]);

  const filtered = currencies.filter(c => {
    if (filter === 'forex') return !c.symbol.includes('BTC') && !c.symbol.includes('ETH') && !c.symbol.includes('XAU');
    if (filter === 'crypto') return c.symbol.includes('BTC') || c.symbol.includes('ETH');
    if (filter === 'metals') return c.symbol.includes('XAU');
    return true;
  });

  return (
    <div className="card animate-fade-in" style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(0,255,102,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Globe size={18} color="var(--accent-green)" />
          </div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 800 }}>Real-Time Live Markets</h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Streaming live price feeds for all main currency pairs</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          {['all', 'forex', 'metals', 'crypto'].map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={filter === tab ? 'btn-primary btn-sm' : 'btn-secondary btn-sm'}
              style={{ textTransform: 'capitalize', padding: '5px 12px', fontSize: 12 }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of currencies */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
        {filtered.map(c => {
          const isUp = c.change >= 0;
          const flash = ticks[c.symbol];
          return (
            <div
              key={c.symbol}
              style={{
                background: 'var(--bg-secondary)',
                border: `1px solid ${flash === 'up' ? 'rgba(0,255,102,0.5)' : flash === 'down' ? 'rgba(255,68,68,0.5)' : 'var(--border-subtle)'}`,
                borderRadius: 10,
                padding: '12px 14px',
                transition: 'border-color 0.3s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-primary)' }}>
                      {c.symbol}
                    </span>
                    <span className="badge badge-gray" style={{ fontSize: 10 }}>{c.spread} pip</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.name}</div>
                </div>

                <MiniSparkline points={c.trend} isUp={isUp} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 10 }}>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>BID</div>
                  <div style={{
                    fontSize: 16, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace",
                    color: flash === 'up' ? 'var(--accent-green)' : flash === 'down' ? '#FF6666' : 'var(--text-primary)',
                    transition: 'color 0.2s'
                  }}>
                    {c.bid.toLocaleString(undefined, { minimumFractionDigits: c.symbol.includes('JPY') ? 3 : c.symbol.includes('BTC') || c.symbol.includes('XAU') ? 2 : 5 })}
                  </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>ASK</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>
                    {c.ask.toLocaleString(undefined, { minimumFractionDigits: c.symbol.includes('JPY') ? 3 : c.symbol.includes('BTC') || c.symbol.includes('XAU') ? 2 : 5 })}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>24H CHG</div>
                  <div style={{
                    fontSize: 13, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
                    color: isUp ? 'var(--accent-green)' : '#FF6666',
                    display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'flex-end'
                  }}>
                    {isUp ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                    {isUp ? `+${c.change}%` : `${c.change}%`}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
