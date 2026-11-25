import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import { Plus, Edit2, Trash2, TrendingUp, TrendingDown } from 'lucide-react';

const PAIRS = ['XAUUSD','EURUSD','GBPUSD','BTCUSD','USDJPY','GBPJPY','AUDUSD','USDCAD','NZDUSD','ETHUSD'];

const statusColors = {
  active: 'badge-green', tp_hit: 'badge-blue', sl_hit: 'badge-red', closed: 'badge-gray'
};

function SignalCard({ sig, isAdmin, onEdit, onDelete }) {
  const isBuy = sig.direction === 'BUY';
  return (
    <div className="card animate-fade-in" style={{ border: `1px solid ${isBuy ? 'rgba(0,255,102,0.2)' : 'rgba(255,68,68,0.2)'}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 17, color: 'var(--text-primary)' }}>{sig.pair}</span>
            <span style={{ padding: '3px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700,
              background: isBuy ? 'rgba(0,255,102,0.15)' : 'rgba(255,68,68,0.15)',
              color: isBuy ? 'var(--accent-green)' : '#FF6666',
              border: isBuy ? '1px solid rgba(0,255,102,0.3)' : '1px solid rgba(255,68,68,0.3)',
              display: 'flex', alignItems: 'center', gap: 4
            }}>
              {isBuy ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {sig.direction}
            </span>
          </div>
          <span className={`badge ${statusColors[sig.status] || 'badge-gray'}`}>{sig.status?.replace('_', ' ').toUpperCase()}</span>
        </div>
        {isAdmin && (
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => onEdit(sig)} className="btn-secondary btn-sm"><Edit2 size={12} /></button>
            <button onClick={() => onDelete(sig.id)} className="btn-danger btn-sm"><Trash2 size={12} /></button>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 12 }}>
        {[
          { label: 'Entry', value: sig.entry_price },
          { label: 'Stop Loss', value: sig.stop_loss, color: '#FF6666' },
          { label: 'TP1', value: sig.tp1, color: 'var(--accent-green)' },
          { label: 'TP2', value: sig.tp2, color: 'var(--accent-green)' },
          { label: 'TP3', value: sig.tp3, color: 'var(--accent-green)' },
          { label: 'R:R', value: sig.rr_ratio },
        ].map(item => item.value && (
          <div key={item.label} style={{ background: 'var(--bg-hover)', borderRadius: 8, padding: '10px 12px' }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.5px', marginBottom: 4 }}>{item.label}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: item.color || 'var(--text-primary)', fontFamily: "'JetBrains Mono', monospace" }}>
              {item.label === 'R:R' ? `1:${item.value}` : item.value}
            </div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 11, color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: 10 }}>
        Published: {format(new Date(sig.created_at), 'dd MMM yyyy, HH:mm')}
      </div>
    </div>
  );
}

function SignalModal({ signal, onClose, onSave }) {
  const [form, setForm] = useState(signal || { pair: 'XAUUSD', direction: 'BUY', entry_price: '', stop_loss: '', tp1: '', tp2: '', tp3: '', rr_ratio: '', status: 'active' });
  const [loading, setLoading] = useState(false);
  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setLoading(true);
    if (signal?.id) {
      await supabase.from('signals').update(form).eq('id', signal.id);
    } else {
      await supabase.from('signals').insert([form]);
    }
    setLoading(false);
    onSave();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}>
      <div style={{ background: 'var(--bg-secondary)', border: '1px solid rgba(0,255,102,0.2)', borderRadius: 16, padding: 32, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>{signal?.id ? 'Edit Signal' : 'New Signal'}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.5px' }}>PAIR</label>
            <select className="input-field" style={{ marginTop: 6 }} value={form.pair} onChange={e => update('pair', e.target.value)}>
              {PAIRS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.5px' }}>DIRECTION</label>
            <select className="input-field" style={{ marginTop: 6 }} value={form.direction} onChange={e => update('direction', e.target.value)}>
              <option value="BUY">BUY</option>
              <option value="SELL">SELL</option>
            </select>
          </div>
          {[['entry_price','Entry Price'],['stop_loss','Stop Loss'],['tp1','Take Profit 1'],['tp2','Take Profit 2'],['tp3','Take Profit 3'],['rr_ratio','R:R Ratio']].map(([k,l]) => (
            <div key={k}>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.5px' }}>{l.toUpperCase()}</label>
              <input className="input-field mono" style={{ marginTop: 6 }} value={form[k]} onChange={e => update(k, e.target.value)} placeholder="0.00000" />
            </div>
          ))}
          <div>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.5px' }}>STATUS</label>
            <select className="input-field" style={{ marginTop: 6 }} value={form.status} onChange={e => update('status', e.target.value)}>
              <option value="active">Active</option>
              <option value="tp_hit">TP Hit</option>
              <option value="sl_hit">SL Hit</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSave} disabled={loading}>{loading ? 'Saving...' : 'Save Signal'}</button>
        </div>
      </div>
    </div>
  );
}

export default function TradingSignals() {
  const { isAdmin } = useAuth();
  const [signals, setSignals] = useState([]);
  const [filter, setFilter] = useState('all');
  const [filterPair, setFilterPair] = useState('all');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  const fetchSignals = async () => {
    setLoading(true);
    let q = supabase.from('signals').select('*').order('created_at', { ascending: false });
    if (filter !== 'all') q = q.eq('status', filter);
    if (filterPair !== 'all') q = q.eq('pair', filterPair);
    const { data } = await q;
    setSignals(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchSignals(); }, [filter, filterPair]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this signal?')) return;
    await supabase.from('signals').delete().eq('id', id);
    fetchSignals();
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Trading Signals</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Real-time forex & crypto trading signals</p>
        </div>
        {isAdmin && (
          <button className="btn-primary" onClick={() => setModal({})}>
            <Plus size={16} /> New Signal
          </button>
        )}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {['all','active','tp_hit','sl_hit','closed'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer',
            background: filter === f ? 'var(--accent-green)' : 'var(--bg-secondary)',
            color: filter === f ? '#000' : 'var(--text-muted)', transition: 'all 0.15s'
          }}>{f.replace('_', ' ').toUpperCase()}</button>
        ))}
        <select className="input-field" style={{ width: 'auto', padding: '6px 12px', fontSize: 12 }} value={filterPair} onChange={e => setFilterPair(e.target.value)}>
          <option value="all">All Pairs</option>
          {PAIRS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ width: 36, height: 36, border: '3px solid rgba(0,255,102,0.2)', borderTopColor: 'var(--accent-green)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
        </div>
      ) : signals.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <TrendingUp size={48} style={{ marginBottom: 16, opacity: 0.3 }} />
          <div style={{ fontSize: 16, fontWeight: 600 }}>No signals found</div>
          <div style={{ fontSize: 13, marginTop: 6 }}>Check back soon for trading opportunities.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {signals.map(sig => (
            <SignalCard key={sig.id} sig={sig} isAdmin={isAdmin} onEdit={s => setModal(s)} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {modal !== null && (
        <SignalModal signal={modal} onClose={() => setModal(null)} onSave={() => { setModal(null); fetchSignals(); }} />
      )}
    </div>
  );
}
