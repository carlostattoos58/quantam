import React from 'react';
import MT5BridgeSection from '../components/MT5BridgeSection';
import { Server, ShieldCheck, Cpu, HardDrive } from 'lucide-react';

export default function MT5ConnectionPage() {
  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>MetaTrader 5 Connection</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          Connect your live or demo MT5 broker account to enable algorithmic execution
        </p>
      </div>

      <MT5BridgeSection />

      {/* Info cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(0,255,102,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={18} color="var(--accent-green)" />
            </div>
            <h3 style={{ fontSize: 14, fontWeight: 700 }}>End-to-End Security</h3>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Trading credentials are authenticated via 256-bit TLS encrypted sockets directly with your broker's gateway server. Your password is never stored in plain text.
          </p>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(79,195,247,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Cpu size={18} color="#4FC3F7" />
            </div>
            <h3 style={{ fontSize: 14, fontWeight: 700 }}>Supported Platforms</h3>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Compatible with all standard MT5 brokers including Exness, IC Markets, FXTM, Pepperstone, XM, Deriv, and HF Markets with ultra-low latency order routing.
          </p>
        </div>
      </div>
    </div>
  );
}
