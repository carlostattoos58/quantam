import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Shield, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export default function MyProfile() {
  const { profile, fetchProfile, user } = useAuth();
  const [form, setForm] = useState({ full_name: profile?.full_name || '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [pwForm, setPwForm] = useState({ newPassword: '', confirm: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState('');

  useEffect(() => { if (profile) setForm({ full_name: profile.full_name || '' }); }, [profile]);

  const handleSave = async () => {
    setLoading(true);
    await supabase.from('profiles').update({ full_name: form.full_name }).eq('id', profile?.id);
    await fetchProfile(profile?.id);
    setSuccess('Profile updated!');
    setTimeout(() => setSuccess(''), 3000);
    setLoading(false);
  };

  const handlePasswordChange = async () => {
    setPwError('');
    if (pwForm.newPassword !== pwForm.confirm) return setPwError('Passwords do not match.');
    if (pwForm.newPassword.length < 8) return setPwError('Minimum 8 characters.');
    setPwLoading(true);
    const { error } = await supabase.auth.updateUser({ password: pwForm.newPassword });
    setPwLoading(false);
    if (error) return setPwError(error.message);
    setPwForm({ newPassword: '', confirm: '' });
    setSuccess('Password changed successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const keyInfo = profile?.activation_keys?.[0];

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>My Profile</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Manage your account information</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Profile info */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(0,255,102,0.1)', border: '2px solid rgba(0,255,102,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={28} color="var(--accent-green)" />
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{profile?.full_name || 'Member'}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{profile?.email}</div>
            </div>
          </div>

          {success && <div style={{ marginBottom: 14, padding: '10px 14px', borderRadius: 8, background: 'rgba(0,255,102,0.08)', border: '1px solid rgba(0,255,102,0.2)', color: 'var(--accent-green)', fontSize: 13 }}>✓ {success}</div>}

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>FULL NAME</label>
            <input className="input-field" style={{ marginTop: 6 }} value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} placeholder="Your full name" />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>EMAIL</label>
            <input className="input-field" style={{ marginTop: 6 }} value={profile?.email || ''} disabled style={{ marginTop: 6, opacity: 0.6 }} />
          </div>
          <button className="btn-primary" onClick={handleSave} disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button>
        </div>

        {/* Membership info */}
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Membership Details</h3>
          {[
            { icon: Shield, label: 'Status', value: profile?.status || 'active', color: profile?.status === 'active' ? 'var(--accent-green)' : 'var(--danger)' },
            { icon: User, label: 'Role', value: profile?.role || 'member' },
            { icon: Calendar, label: 'Joined', value: profile?.created_at ? format(new Date(profile.created_at), 'dd MMM yyyy') : '—' },
            { icon: Shield, label: 'Plan', value: keyInfo?.membership_plan || 'Standard' },
            { icon: Calendar, label: 'Key Status', value: keyInfo?.status || '—' },
            { icon: Calendar, label: 'Expires', value: keyInfo?.expires_at ? format(new Date(keyInfo.expires_at), 'dd MMM yyyy') : 'No expiry' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-muted)' }}>
                <item.icon size={14} />
                {item.label}
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: item.color || 'var(--text-primary)', textTransform: 'capitalize' }}>{item.value}</span>
            </div>
          ))}
        </div>

        {/* Change password */}
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Change Password</h3>
          {pwError && <div style={{ marginBottom: 12, padding: '10px 14px', borderRadius: 8, background: 'rgba(255,68,68,0.08)', border: '1px solid rgba(255,68,68,0.2)', color: '#FF6666', fontSize: 13 }}>⚠ {pwError}</div>}
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>NEW PASSWORD</label>
            <input className="input-field" type="password" style={{ marginTop: 6 }} value={pwForm.newPassword} onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))} placeholder="Min. 8 characters" />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>CONFIRM PASSWORD</label>
            <input className="input-field" type="password" style={{ marginTop: 6 }} value={pwForm.confirm} onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))} placeholder="Re-enter password" />
          </div>
          <button className="btn-primary" onClick={handlePasswordChange} disabled={pwLoading}>{pwLoading ? 'Updating...' : 'Update Password'}</button>
        </div>
      </div>
    </div>
  );
}
