import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Mail, MessageSquare, Send, HelpCircle } from 'lucide-react';

export default function Support() {
  const { profile } = useAuth();
  const [form, setForm] = useState({ subject: '', category: 'general', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject || !form.message) return;
    setLoading(true);
    await supabase.from('support_tickets').insert([{
      user_id: profile?.id,
      subject: form.subject,
      category: form.category,
      message: form.message,
      status: 'open'
    }]);
    setSent(true);
    setLoading(false);
  };

  const faqs = [
    { q: 'How do I install Quantam EA v5?', a: 'Download the EA file from the EA Information section. Copy it to your MetaTrader Experts folder, restart MT4/MT5, and attach it to your preferred chart.' },
    { q: 'What pairs does the EA support?', a: 'Quantam EA v5 supports XAUUSD, EURUSD, GBPUSD, USDJPY, BTCUSD, GBPJPY, AUDUSD, USDCAD, NZDUSD, and ETHUSD.' },
    { q: 'My activation key is not working.', a: 'Ensure you are entering numbers only. Contact your administrator if the key shows as invalid or expired.' },
    { q: 'How do I reset my password?', a: 'Click the "Forgot your password?" link on the login screen and follow the email instructions.' },
    { q: 'Is a VPS required?', a: 'A VPS is strongly recommended for 24/7 trading without interruptions. Any major VPS provider will work.' },
  ];

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Support</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Get help from our team</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>
        {/* Ticket form */}
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <MessageSquare size={16} color="var(--accent-green)" /> Submit a Support Ticket
          </h3>
          {sent ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: 'var(--accent-green)' }}>Ticket Submitted!</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Your administrator will respond shortly.</div>
              <button className="btn-primary" style={{ marginTop: 20 }} onClick={() => { setSent(false); setForm({ subject: '', category: 'general', message: '' }); }}>Submit Another</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>CATEGORY</label>
                <select className="input-field" style={{ marginTop: 6 }} value={form.category} onChange={e => update('category', e.target.value)}>
                  <option value="general">General Inquiry</option>
                  <option value="technical">Technical Issue</option>
                  <option value="account">Account & Access</option>
                  <option value="ea">EA Support</option>
                  <option value="billing">Billing / Subscription</option>
                </select>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>SUBJECT</label>
                <input className="input-field" style={{ marginTop: 6 }} value={form.subject} onChange={e => update('subject', e.target.value)} placeholder="Brief description of your issue" required />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>MESSAGE</label>
                <textarea className="input-field" style={{ marginTop: 6, minHeight: 120, resize: 'vertical' }} value={form.message} onChange={e => update('message', e.target.value)} placeholder="Describe your issue in detail..." required />
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
                <Send size={14} /> {loading ? 'Sending...' : 'Send Ticket'}
              </button>
            </form>
          )}
        </div>

        {/* Contact info */}
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Contact Channels</h3>
            {[
              { icon: Mail, label: 'Email Support', value: 'support@quantamea.com', color: '#4FC3F7' },
              { icon: MessageSquare, label: 'Telegram', value: '@QuantamEA', color: '#4FC3F7' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: `${item.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <item.icon size={16} color={item.color} />
                </div>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{item.label}</div>
                  <div style={{ fontSize: 14, color: 'var(--text-primary)' }}>{item.value}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="card" style={{ background: 'rgba(0,255,102,0.04)', border: '1px solid rgba(0,255,102,0.12)' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent-green)', marginBottom: 8 }}>⏰ Response Times</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>General inquiries: Within 24 hours</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Technical issues: Within 12 hours</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Urgent access issues: Within 2 hours</div>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="card">
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <HelpCircle size={16} color="var(--accent-green)" /> Frequently Asked Questions
        </h3>
        <div>
          {faqs.map((faq, i) => (
            <details key={i} style={{ marginBottom: 8, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 8 }}>
              <summary style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer', padding: '8px 0', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {faq.q} <span style={{ color: 'var(--accent-green)' }}>+</span>
              </summary>
              <div style={{ padding: '10px 0 4px', fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7 }}>{faq.a}</div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
