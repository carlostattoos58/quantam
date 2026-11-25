import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AuthPage({ activationData, onBackToGate }) {
  const [mode, setMode] = useState(activationData?.bypass ? 'login' : 'register'); // 'register' | 'login' | 'admin' | 'reset'
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '', adminPasscode: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { signUp, signIn, resetPassword, adminQuickLogin } = useAuth();
  const navigate = useNavigate();

  const update = (k, v) => { setForm(f => ({ ...f, [k]: v })); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');

    if (mode === 'register') {
      if (!form.fullName || !form.email || !form.password || !form.confirmPassword) return setError('All fields are required.');
      if (form.password !== form.confirmPassword) return setError('Passwords do not match.');
      if (form.password.length < 8) return setError('Password must be at least 8 characters.');
      setLoading(true);
      const { error: err } = await signUp({ ...form, activationKey: activationData?.key });
      setLoading(false);
      if (err) return setError(err.message);
      navigate('/dashboard');
    } else if (mode === 'login') {
      if (!form.email || !form.password) return setError('Email and password are required.');
      setLoading(true);
      const { error: err } = await signIn({ email: form.email, password: form.password });
      setLoading(false);
      if (err) return setError(err.message);
      
      // If logging in with admin email, route straight to admin panel!
      if (form.email.toLowerCase() === 'johndoe1@gmail.com') {
        sessionStorage.setItem('quantam_admin_passcode_unlocked', 'true');
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } else if (mode === 'admin') {
      const email = form.email.trim() || 'johndoe1@gmail.com';
      const code = form.adminPasscode.trim() || form.password.trim();
      if (code !== '@Slime25' && form.password !== '@Slime25') {
        return setError('Access Denied: Invalid Admin Passcode. Use @Slime25');
      }
      setLoading(true);
      await adminQuickLogin();
      sessionStorage.setItem('quantam_admin_passcode_unlocked', 'true');
      setLoading(false);
      navigate('/admin');
    } else if (mode === 'reset') {
      if (!form.email) return setError('Enter your email address.');
      setLoading(true);
      const { error: err } = await resetPassword(form.email);
      setLoading(false);
      if (err) return setError(err.message);
      setSuccess('Password reset email sent! Check your inbox.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', padding: '20px' }}>
      <div className="animate-fade-in" style={{ width: '100%', maxWidth: 450 }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: 26 }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 22, color: 'var(--accent-green)', letterSpacing: '2px', marginBottom: 4 }}>
            ⚡ QUANTAM EA v5
          </div>
          {activationData && mode === 'register' && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(0,255,102,0.08)', border: '1px solid rgba(0,255,102,0.2)', borderRadius: 999, padding: '4px 12px', marginTop: 8 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent-green)', display: 'inline-block' }} />
              <span style={{ fontSize: 11, color: 'var(--accent-green)', fontWeight: 600 }}>KEY VERIFIED ({activationData.key})</span>
            </div>
          )}
        </div>

        <div style={{ background: 'var(--bg-secondary)', border: '1px solid rgba(0,255,102,0.12)', borderRadius: 16, padding: '32px 28px', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', marginBottom: 24, gap: 0 }}>
            {[
              { id: 'register', label: 'Create Account' },
              { id: 'login', label: 'Member Sign In' },
              { id: 'admin', label: 'Admin Login 🔒' }
            ].map(m => (
              <button key={m.id} onClick={() => { setMode(m.id); setError(''); setSuccess(''); }}
                style={{
                  flex: 1, background: 'none', border: 'none', cursor: 'pointer', padding: '10px 4px',
                  fontSize: 12, fontWeight: 700,
                  color: mode === m.id ? (m.id === 'admin' ? 'var(--warning)' : 'var(--accent-green)') : 'var(--text-muted)',
                  borderBottom: mode === m.id ? `2px solid ${m.id === 'admin' ? 'var(--warning)' : 'var(--accent-green)'}` : '2px solid transparent',
                  marginBottom: -1, transition: 'all 0.2s'
                }}>
                {m.label}
              </button>
            ))}
          </div>

          {success && <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 8, background: 'rgba(0,255,102,0.08)', border: '1px solid rgba(0,255,102,0.2)', color: 'var(--accent-green)', fontSize: 13 }}>✓ {success}</div>}
          {error && <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 8, background: 'rgba(255,68,68,0.08)', border: '1px solid rgba(255,68,68,0.2)', color: '#FF6666', fontSize: 13 }}>⚠ {error}</div>}

          <form onSubmit={handleSubmit}>
            {mode === 'register' && (
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, letterSpacing: '0.5px' }}>FULL NAME</label>
                <input className="input-field" type="text" placeholder="John Doe" value={form.fullName} onChange={e => update('fullName', e.target.value)} required />
              </div>
            )}

            {mode !== 'reset' && (
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, letterSpacing: '0.5px' }}>
                  {mode === 'admin' ? 'ADMINISTRATOR EMAIL' : 'EMAIL ADDRESS'}
                </label>
                <input
                  className="input-field"
                  type="email"
                  placeholder={mode === 'admin' ? 'johndoe1@gmail.com' : 'you@example.com'}
                  value={form.email}
                  onChange={e => update('email', e.target.value)}
                  required
                />
              </div>
            )}

            {mode === 'admin' ? (
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--warning)', marginBottom: 6, letterSpacing: '0.5px' }}>
                  ADMIN PASSCODE (@Slime25)
                </label>
                <input
                  className="input-field mono"
                  type="password"
                  placeholder="Enter @Slime25"
                  value={form.adminPasscode}
                  onChange={e => update('adminPasscode', e.target.value)}
                  required
                />
              </div>
            ) : mode !== 'reset' ? (
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, letterSpacing: '0.5px' }}>PASSWORD</label>
                <input className="input-field" type="password" placeholder={mode === 'register' ? 'Min. 8 characters' : '••••••••'} value={form.password} onChange={e => update('password', e.target.value)} required />
              </div>
            ) : null}

            {mode === 'register' && (
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, letterSpacing: '0.5px' }}>CONFIRM PASSWORD</label>
                <input className="input-field" type="password" placeholder="Re-enter password" value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} required />
              </div>
            )}

            <button
              type="submit"
              className={mode === 'admin' ? 'btn-secondary' : 'btn-primary'}
              style={{
                width: '100%', marginTop: 8,
                ...(mode === 'admin' ? { borderColor: 'var(--warning)', color: 'var(--warning)', fontWeight: 800 } : {})
              }}
              disabled={loading}
            >
              {loading ? (
                <><div style={{ width: 15, height: 15, border: '2px solid rgba(0,0,0,0.3)', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Processing...</>
              ) : mode === 'register' ? (
                '🚀 Create Account & Enter'
              ) : mode === 'login' ? (
                '🔓 Sign In'
              ) : mode === 'admin' ? (
                '🛡️ Authenticate & Open Admin Panel'
              ) : (
                '📧 Send Reset Link'
              )}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 20 }}>
            {mode === 'login' && (
              <button onClick={() => { setMode('reset'); setError(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 13 }}>
                Forgot your password?
              </button>
            )}
            {mode === 'reset' && (
              <button onClick={() => { setMode('login'); setError(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-green)', fontSize: 13 }}>
                ← Back to Sign In
              </button>
            )}
          </div>
        </div>

        {/* Back to gate */}
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <button onClick={onBackToGate} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 12 }}>
            ← Back to Activation Gate
          </button>
        </div>
      </div>
    </div>
  );
}
