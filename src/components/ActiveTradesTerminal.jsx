import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, X, ShieldAlert, CheckCircle, Clock, Zap } from 'lucide-react';

// Generates dynamic trades scaled proportionally to account balance
export function generateInitialTrades(balance, customLot) {
  if (balance <= 0) return [];

  // Use custom configured lot size or scale according to balance
  const baseLot = customLot || Math.max(0.01, parseFloat(((balance / 10000) * 0.15).toFixed(2)));

  return [
    {
      id: 'TRD-' + Math.floor(100000 + Math.random() * 900000),
      pair: 'XAU/USD',
      type: 'BUY',
      lots: parseFloat((baseLot * 0.8).toFixed(2)),
      entry: 2684.20,
      current: 2686.40,
      sl: 2672.00,
      tp: 2698.00,
      pips: +22.0,
      profit: parseFloat(((baseLot * 0.8) * 220).toFixed(2)),
      openedAt: 'Just now'
    },
    {
      id: 'TRD-' + Math.floor(100000 + Math.random() * 900000),
      pair: 'EUR/USD',
      type: 'BUY',
      lots: baseLot,
      entry: 1.08420,
      current: 1.08455,
      sl: 1.08150,
      tp: 1.08950,
      pips: +3.5,
      profit: parseFloat((baseLot * 35).toFixed(2)),
      openedAt: '2m ago'
    },
    {
      id: 'TRD-' + Math.floor(100000 + Math.random() * 900000),
      pair: 'GBP/USD',
      type: 'SELL',
      lots: parseFloat((baseLot * 0.9).toFixed(2)),
      entry: 1.29180,
      current: 1.29125,
      sl: 1.29600,
      tp: 1.28400,
      pips: +5.5,
      profit: parseFloat(((baseLot * 0.9) * 55).toFixed(2)),
      openedAt: '5m ago'
    }
  ];
}

export default function ActiveTradesTerminal({ botRunning, balance, onTradeClosed, onProfitUpdate }) {
  const getCustomLot = () => {
    try {
      const s = JSON.parse(localStorage.getItem('quantam_bot_settings') || '{}');
      return s.lotSize;
    } catch {
      return null;
    }
  };

  const [trades, setTrades] = useState(() => {
    if (balance <= 0) return [];
    const saved = localStorage.getItem('quantam_open_trades');
    return saved ? JSON.parse(saved) : generateInitialTrades(balance, getCustomLot());
  });

  const [flashTrade, setFlashTrade] = useState({});

  // When balance is zero, wipe any open trades
  useEffect(() => {
    if (balance <= 0) {
      setTrades([]);
      localStorage.removeItem('quantam_open_trades');
      return;
    }

    if (botRunning && trades.length === 0) {
      const freshTrades = generateInitialTrades(balance, getCustomLot());
      setTrades(freshTrades);
    }
  }, [botRunning, balance]);

  // Real-time market tick simulation for open trades
  useEffect(() => {
    if (!botRunning || trades.length === 0) return;

    const interval = setInterval(() => {
      setTrades(prevTrades => {
        const updated = prevTrades.map(trade => {
          // Calculate realistic price movement
          const isJpy = trade.pair.includes('JPY');
          const isGold = trade.pair.includes('XAU');
          const isBtc = trade.pair.includes('BTC');

          const pipScale = isJpy ? 0.01 : isGold ? 0.15 : isBtc ? 8.0 : 0.0001;
          const tickDelta = (Math.random() - 0.46) * pipScale;
          const newPrice = parseFloat((trade.current + tickDelta).toFixed(isJpy ? 3 : isGold || isBtc ? 2 : 5));

          // Calculate pips and dollar profit based on lots
          const priceDiff = trade.type === 'BUY' ? (newPrice - trade.entry) : (trade.entry - newPrice);
          const pipsGain = parseFloat((priceDiff / (isJpy ? 0.01 : isGold ? 0.10 : isBtc ? 1.0 : 0.0001)).toFixed(1));
          
          // Dollar profit proportional to volume & balance
          const multiplier = isGold ? 10 : isBtc ? 1 : 10;
          const profitDollar = parseFloat((pipsGain * trade.lots * multiplier).toFixed(2));

          return {
            ...trade,
            current: newPrice,
            pips: pipsGain,
            profit: profitDollar
          };
        });

        // Calculate total floating profit across all trades
        const totalFloating = updated.reduce((sum, t) => sum + t.profit, 0);
        if (onProfitUpdate) {
          onProfitUpdate(parseFloat(totalFloating.toFixed(2)));
        }

        localStorage.setItem('quantam_open_trades', JSON.stringify(updated));
        return updated;
      });

      // Randomly spawn or close a trade if bot has been running
      if (Math.random() < 0.12 && trades.length < 5) {
        const pairs = ['USD/JPY', 'AUD/USD', 'BTC/USD', 'EUR/GBP'];
        const randomPair = pairs[Math.floor(Math.random() * pairs.length)];
        const isBuy = Math.random() > 0.5;
        const baseLot = Math.max(0.01, parseFloat(((balance / 10000) * 0.12).toFixed(2)));
        const newTrade = {
          id: 'TRD-' + Math.floor(100000 + Math.random() * 900000),
          pair: randomPair,
          type: isBuy ? 'BUY' : 'SELL',
          lots: baseLot,
          entry: randomPair.includes('JPY') ? 154.500 : randomPair.includes('BTC') ? 94800.0 : 0.65200,
          current: randomPair.includes('JPY') ? 154.510 : randomPair.includes('BTC') ? 94815.0 : 0.65205,
          sl: 0,
          tp: 0,
          pips: +1.0,
          profit: +(baseLot * 10).toFixed(2),
          openedAt: 'Just now'
        };
        setTrades(curr => [...curr, newTrade]);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [botRunning, trades.length, balance, onProfitUpdate]);

  const closeTrade = (tradeId) => {
    const tradeToClose = trades.find(t => t.id === tradeId);
    if (tradeToClose && onTradeClosed) {
      onTradeClosed(tradeToClose.profit);
    }
    const remaining = trades.filter(t => t.id !== tradeId);
    setTrades(remaining);
    localStorage.setItem('quantam_open_trades', JSON.stringify(remaining));
  };

  const closeAllTrades = () => {
    const totalRealized = trades.reduce((sum, t) => sum + t.profit, 0);
    if (onTradeClosed) {
      onTradeClosed(parseFloat(totalRealized.toFixed(2)));
    }
    setTrades([]);
    localStorage.removeItem('quantam_open_trades');
  };

  const totalFloatingProfit = trades.reduce((sum, t) => sum + (t.profit || 0), 0);
  const isOverallProfit = totalFloatingProfit >= 0;

  return (
    <div className="card animate-fade-in" style={{ marginBottom: 24, border: '1px solid var(--border-subtle)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(0,255,102,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={18} color="var(--accent-green)" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800 }}>Active Bot Positions</h3>
              <span className={`badge ${botRunning ? 'badge-green' : 'badge-gray'}`}>
                {botRunning ? `${trades.length} LIVE TRADES` : 'STANDBY'}
              </span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Real-time position tracking scaled to your balance (${balance.toLocaleString()})
            </p>
          </div>
        </div>

        {trades.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Floating P&L</div>
              <div style={{
                fontSize: 16, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace",
                color: isOverallProfit ? 'var(--accent-green)' : '#FF6666'
              }}>
                {isOverallProfit ? `+$${totalFloatingProfit.toFixed(2)}` : `-$${Math.abs(totalFloatingProfit).toFixed(2)}`}
              </div>
            </div>

            <button
              onClick={closeAllTrades}
              className="btn-danger btn-sm"
              style={{ padding: '7px 12px', fontSize: 11 }}
            >
              Close All Positions
            </button>
          </div>
        )}
      </div>

      {/* Trades Table */}
      {balance <= 0 ? (
        <div style={{ textAlign: 'center', padding: '36px 20px', background: 'var(--bg-secondary)', borderRadius: 10, border: '1px dashed rgba(255,179,71,0.3)' }}>
          <ShieldAlert size={34} style={{ color: 'var(--warning)', marginBottom: 10 }} />
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Account Balance is $0.00 (Unallocated)</div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6, maxWidth: 500, margin: '6px auto 0' }}>
            Trading is paused because account balance is $0.00. Please contact your platform administrator to allocate capital to your account.
          </p>
        </div>
      ) : !botRunning && trades.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '36px 20px', background: 'var(--bg-secondary)', borderRadius: 10 }}>
          <Clock size={32} style={{ color: 'var(--text-muted)', marginBottom: 8, opacity: 0.5 }} />
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Bot is Currently Stopped</div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
            Click <strong>START BOT</strong> above to launch auto-trading and stream live positions according to your balance.
          </p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', background: 'var(--bg-secondary)', borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
          <table className="table">
            <thead>
              <tr>
                <th>ORDER / PAIR</th>
                <th>TYPE</th>
                <th>LOTS</th>
                <th>ENTRY PRICE</th>
                <th>MARKET PRICE</th>
                <th>PIPS</th>
                <th>PROFIT (USD)</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {trades.map(trade => {
                const isProfitable = trade.profit >= 0;
                const isBuy = trade.type === 'BUY';
                return (
                  <tr key={trade.id}>
                    <td>
                      <div>
                        <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'JetBrains Mono', monospace", fontSize: 14 }}>
                          {trade.pair}
                        </span>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>
                          #{trade.id} • {trade.openedAt}
                        </div>
                      </div>
                    </td>

                    <td>
                      <span style={{
                        padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 800,
                        background: isBuy ? 'rgba(0,255,102,0.15)' : 'rgba(255,68,68,0.15)',
                        color: isBuy ? 'var(--accent-green)' : '#FF6666',
                        border: isBuy ? '1px solid rgba(0,255,102,0.3)' : '1px solid rgba(255,68,68,0.3)',
                        display: 'inline-flex', alignItems: 'center', gap: 4
                      }}>
                        {isBuy ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                        {trade.type}
                      </span>
                    </td>

                    <td>
                      <span style={{ fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-primary)', fontSize: 13 }}>
                        {trade.lots.toFixed(2)}
                      </span>
                    </td>

                    <td>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-muted)', fontSize: 13 }}>
                        {trade.entry.toLocaleString()}
                      </span>
                    </td>

                    <td>
                      <span style={{
                        fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 13,
                        color: isProfitable ? 'var(--accent-green)' : '#FF6666',
                        transition: 'color 0.2s ease'
                      }}>
                        {trade.current.toLocaleString()}
                      </span>
                    </td>

                    <td>
                      <span style={{
                        fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 12,
                        color: trade.pips >= 0 ? 'var(--accent-green)' : '#FF6666'
                      }}>
                        {trade.pips >= 0 ? `+${trade.pips}` : trade.pips} pips
                      </span>
                    </td>

                    <td>
                      <span style={{
                        fontFamily: "'JetBrains Mono', monospace", fontWeight: 800, fontSize: 14,
                        color: isProfitable ? 'var(--accent-green)' : '#FF6666',
                        display: 'inline-flex', alignItems: 'center', gap: 4
                      }}>
                        {isProfitable ? `+$${trade.profit.toFixed(2)}` : `-$${Math.abs(trade.profit).toFixed(2)}`}
                      </span>
                    </td>

                    <td>
                      <button
                        onClick={() => closeTrade(trade.id)}
                        className="btn-secondary btn-sm"
                        style={{ padding: '4px 8px', fontSize: 11, borderColor: 'rgba(255,255,255,0.1)' }}
                        title="Close position and realize P&L"
                      >
                        <X size={12} /> Close
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
