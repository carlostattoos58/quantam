import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Download, Upload, Info, Settings, Shield, HelpCircle, AlertTriangle } from 'lucide-react';

export default function EAInfo() {
  const { isAdmin } = useAuth();
  const [releases, setReleases] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadNote, setUploadNote] = useState('');

  useEffect(() => {
    supabase.from('ea_releases').select('*').order('created_at', { ascending: false })
      .then(({ data }) => setReleases(data || []));
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const path = `ea/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from('media').upload(path, file);
    if (!error) {
      const { data } = supabase.storage.from('media').getPublicUrl(path);
      await supabase.from('ea_releases').insert([{
        filename: file.name,
        file_url: data.publicUrl,
        version: file.name.replace(/[^0-9.]/g, '') || 'v5',
        notes: uploadNote || 'Latest release'
      }]);
      const { data: newReleases } = await supabase.from('ea_releases').select('*').order('created_at', { ascending: false });
      setReleases(newReleases || []);
      setUploadNote('');
    }
    setUploading(false);
  };

  const Section = ({ icon: Icon, title, children, color = 'var(--accent-green)' }) => (
    <div className="card" style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={18} color={color} />
        </div>
        <h3 style={{ fontSize: 16, fontWeight: 700 }}>{title}</h3>
      </div>
      {children}
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>EA Information</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Everything you need to know about Quantam EA v5</p>
      </div>

      <Section icon={Info} title="What is Quantam EA v5?">
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: 14 }}>
          Quantam EA v5 is a sophisticated automated trading Expert Advisor (EA) designed for the MetaTrader platform.
          It leverages advanced algorithms and market analysis techniques to identify high-probability trading opportunities
          across multiple forex pairs and commodities, executing trades automatically with precision risk management.
        </p>
      </Section>

      <Section icon={Settings} title="How It Works">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          {[
            { title: 'Market Scanning', desc: 'Continuously scans multiple timeframes for high-probability setups' },
            { title: 'Signal Generation', desc: 'Uses proprietary algorithms to generate precise entry points' },
            { title: 'Risk Management', desc: 'Automatically calculates optimal lot sizes and stop losses' },
            { title: 'Trade Execution', desc: 'Places, manages and closes trades without manual intervention' },
          ].map(item => (
            <div key={item.title} style={{ background: 'var(--bg-hover)', borderRadius: 10, padding: '14px' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-green)', marginBottom: 6 }}>{item.title}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </Section>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingUpIcon /> Supported Pairs
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {['XAUUSD','EURUSD','GBPUSD','USDJPY','BTCUSD','GBPJPY','AUDUSD','USDCAD','NZDUSD','ETHUSD'].map(p => (
              <span key={p} className="badge badge-green mono">{p}</span>
            ))}
          </div>
        </div>
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>⚙️ Recommended Settings</h3>
          {[
            ['Platform', 'MetaTrader 4 / 5'],
            ['Timeframe', 'H1 (Primary), M15 (Confirmation)'],
            ['Lot Size', '0.01 per $1,000 balance'],
            ['Max Spread', '20 pips'],
            ['VPS', 'Recommended (24/7 uptime)'],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)', fontSize: 13 }}>
              <span style={{ color: 'var(--text-muted)' }}>{k}</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      <Section icon={Shield} title="Risk Management" color="#FFB347">
        <div style={{ background: 'rgba(255,179,71,0.08)', border: '1px solid rgba(255,179,71,0.2)', borderRadius: 8, padding: 14, marginBottom: 12 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <AlertTriangle size={16} color="var(--warning)" style={{ marginTop: 1 }} />
            <p style={{ color: 'var(--warning)', fontSize: 13, lineHeight: 1.6 }}>
              <strong>Important:</strong> Trading forex involves significant risk. Never risk more than 1-2% of your account on a single trade. Past performance does not guarantee future results.
            </p>
          </div>
        </div>
        {['Never risk more than 2% per trade', 'Use a dedicated trading account', 'Set a maximum daily drawdown limit of 5%', 'Run on a VPS for 24/7 operation', 'Backtest before deploying on live accounts'].map(tip => (
          <div key={tip} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border-subtle)', fontSize: 13 }}>
            <span style={{ color: 'var(--accent-green)' }}>✓</span>
            <span style={{ color: 'var(--text-secondary)' }}>{tip}</span>
          </div>
        ))}
      </Section>

      {/* Downloads */}
      <div className="card" style={{ borderTop: '2px solid var(--accent-green)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>EA Downloads</h3>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Authorized members only</div>
          </div>
          {isAdmin && (
            <label style={{ cursor: 'pointer', padding: '8px 16px', borderRadius: 8, background: 'rgba(0,255,102,0.1)', border: '1px solid rgba(0,255,102,0.2)', color: 'var(--accent-green)', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Upload size={14} />
              {uploading ? 'Uploading...' : 'Upload New Version'}
              <input type="file" style={{ display: 'none' }} onChange={handleUpload} accept=".ex4,.ex5,.zip,.rar" />
            </label>
          )}
        </div>

        {releases.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No EA files uploaded yet.</div>
        ) : releases.map(r => (
          <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid var(--border-subtle)' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-primary)', marginBottom: 4 }}>{r.filename}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.notes} • v{r.version}</div>
            </div>
            <a href={r.file_url} download className="btn-primary btn-sm" style={{ textDecoration: 'none' }}>
              <Download size={13} /> Download
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

function TrendingUpIcon() {
  return <span style={{ color: 'var(--accent-green)' }}>📈</span>;
}
