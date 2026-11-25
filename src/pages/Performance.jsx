import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import { supabase } from '../lib/supabase';
import { TrendingUp, TrendingDown, Award, Target, Percent } from 'lucide-react';

const COLORS = ['#00FF66', '#FF4444', '#FFB347'];

export default function Performance() {
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('signals').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setSignals(data || []); setLoading(false); });
  }, []);

  const total = signals.length;
  const wins = signals.filter(s => s.status === 'tp_hit').length;
  const losses = signals.filter(s => s.status === 'sl_hit').length;
  const active = signals.filter(s => s.status === 'active').length;
  const winRate = total > 0 ? Math.round((wins / (wins + losses || 1)) * 100) : 0;

  // Monthly breakdown
  const monthly = {};
  signals.forEach(s => {
    const month = s.created_at ? s.created_at.substring(0, 7) : 'Unknown';
    if (!monthly[month]) monthly[month] = { month, wins: 0, losses: 0, total: 0 };
    monthly[month].total++;
    if (s.status === 'tp_hit') monthly[month].wins++;
    if (s.status === 'sl_hit') monthly[month].losses++;
  });
  const monthlyData = Object.values(monthly).sort((a,b) => a.month.localeCompare(b.month)).slice(-6);

  const pieData = [
    { name: 'TP Hit (Wins)', value: wins },
    { name: 'SL Hit (Losses)', value: losses },
    { name: 'Active', value: active },
  ].filter(d => d.value > 0);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
      <div style={{ width: 36, height: 36, border: '3px solid rgba(0,255,102,0.2)', borderTopColor: 'var(--accent-green)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Trading Performance</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Statistics calculated from actual recorded signal outcomes.</p>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 28 }}>
        {[
          { icon: Target, label: 'Total Signals', value: total, color: '#4FC3F7' },
          { icon: TrendingUp, label: 'Winning Signals', value: wins, color: 'var(--accent-green)' },
          { icon: TrendingDown, label: 'Losing Signals', value: losses, color: 'var(--danger)' },
          { icon: Percent, label: 'Win Rate', value: `${winRate}%`, color: winRate >= 60 ? 'var(--accent-green)' : winRate >= 40 ? 'var(--warning)' : 'var(--danger)' },
          { icon: Award, label: 'Active Signals', value: active, color: 'var(--warning)' },
        ].map(item => (
          <div key={item.label} className="card" style={{ borderTop: `2px solid ${item.color}` }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: `${item.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <item.icon size={18} color={item.color} />
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: item.color, marginBottom: 4 }}>{item.value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.label}</div>
          </div>
        ))}
      </div>

      {total === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
          <Award size={48} style={{ marginBottom: 16, opacity: 0.3, color: 'var(--accent-green)' }} />
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>No completed signals yet</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Performance charts will appear once signals have outcomes recorded.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Monthly bar chart */}
          <div className="card">
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20 }}>Monthly Signal History</h3>
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={monthlyData}>
                  <XAxis dataKey="month" stroke="var(--text-muted)" tick={{ fontSize: 11 }} />
                  <YAxis stroke="var(--text-muted)" tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 8, color: 'var(--text-primary)' }} />
                  <Bar dataKey="wins" fill="#00FF66" radius={[4,4,0,0]} name="Wins" />
                  <Bar dataKey="losses" fill="#FF4444" radius={[4,4,0,0]} name="Losses" />
                </BarChart>
              </ResponsiveContainer>
            ) : <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 40 }}>Not enough data yet.</div>}
          </div>

          {/* Pie chart */}
          <div className="card">
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20 }}>Signal Outcome Distribution</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" labelLine={false}
                  label={({ name, percent }) => `${Math.round(percent*100)}%`}>
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend formatter={(value) => <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{value}</span>} />
                <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 8, color: 'var(--text-primary)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
