import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import {
  Users, Key, Shield, TrendingUp, Activity, Bell,
  Plus, Search, Copy, Download, Trash2, RefreshCw,
  CheckCircle, XCircle, Clock, Settings, DollarSign,
  Sparkles, Check, ExternalLink, X, Lock, Unlock, Eye,
  EyeOff, AlertTriangle, UserCheck, ArrowRight, Wallet
} from 'lucide-react';
import { fetchServerMembers, fetchServerKeys, saveServerKey, updateServerBalance } from '../../lib/syncService';

const ADMIN_PASSCODE = '@Slime25';

// Default initial accounts so admin always has registered accounts to allocate balances to
const DEFAULT_SYSTEM_MEMBERS = [
  {
    id: 'admin-master-id',
    full_name: 'John Doe',
    email: 'johndoe1@gmail.com',
    role: 'admin',
    status: 'active',
    balance: 0.00,
    activation_key: '657284107',
    created_at: new Date(Date.now() - 7 * 86400000).toISOString()
  },
  {
    id: 'member-alex-id',
    full_name: 'Alex Vance',
    email: 'alex.trader@gmail.com',
    role: 'member',
    status: 'active',
    balance: 0.00,
    activation_key: '657284107',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString()
  },
  {
    id: 'member-sarah-id',
    full_name: 'Sarah Miller',
    email: 'sarah.m@fxinvest.com',
    role: 'member',
    status: 'active',
    balance: 0.00,
    activation_key: '123456789',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString()
  }
];

// ─── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="card" style={{ borderTop: `2px solid ${color}` }}>
      <div style={{ width: 36, height: 36, borderRadius: 8, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
        <Icon size={18} color={color} />
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color, fontFamily: "'JetBrains Mono', monospace", marginBottom: 4 }}>{value ?? '—'}</div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{label}</div>
    </div>
  );
}

// ─── Admin Security Passcode Gate Screen (@Slime25) ──────────────────────────
function AdminPasscodeGate({ onUnlock }) {
  const [passcode, setPasscode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    setTimeout(() => {
      if (passcode.trim() === ADMIN_PASSCODE) {
        sessionStorage.setItem('quantam_admin_passcode_unlocked', 'true');
        toast.success('Access Granted. Welcome Administrator.', { icon: '🛡️', duration: 4000 });
        onUnlock();
      } else {
        setError(true);
        toast.error('Access Denied: Invalid Passcode.', { id: 'admin-err' });
      }
      setLoading(false);
    }, 400);
  };

  return (
    <div style={{
      minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="animate-fade-in card" style={{
        maxWidth: 460, width: '100%', padding: '40px 32px',
        border: '1.5px solid rgba(255,179,71,0.3)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
        textAlign: 'center', position: 'relative'
      }}>
        {/* Glowing Lock Icon */}
        <div style={{
          width: 72, height: 72, borderRadius: 20,
          background: 'linear-gradient(135deg, rgba(255,179,71,0.2), rgba(255,179,71,0.05))',
          border: '1px solid var(--warning)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 20, boxShadow: '0 0 25px rgba(255,179,71,0.25)'
        }}>
          <Lock size={34} color="var(--warning)" />
        </div>

        <div style={{
          display: 'inline-block',
          background: 'rgba(255,179,71,0.1)', border: '1px solid rgba(255,179,71,0.25)',
          borderRadius: 999, padding: '4px 14px', fontSize: 11, fontWeight: 700,
          color: 'var(--warning)', letterSpacing: '1px', marginBottom: 12
        }}>
          RESTRICTED ADMINISTRATIVE TERMINAL
        </div>

        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>
          Admin Authentication
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 24 }}>
          Enter authorized administrator security passcode to unlock platform management.
        </p>

        {error && (
          <div style={{
            background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.3)',
            borderRadius: 8, padding: '10px 14px', marginBottom: 18,
            display: 'flex', alignItems: 'center', gap: 8, color: '#FF6666', fontSize: 13, textAlign: 'left'
          }}>
            <AlertTriangle size={16} style={{ flexShrink: 0 }} />
            <span><strong>Access Denied:</strong> Invalid passcode. Only verified administrators may enter.</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20, textAlign: 'left' }}>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: 6 }}>
              ENTER ADMIN PASSCODE
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="input-field mono"
                value={passcode}
                onChange={e => { setPasscode(e.target.value); setError(false); }}
                placeholder="Enter passcode..."
                required
                autoFocus
                style={{ paddingRight: 40, fontSize: 15, letterSpacing: '1px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !passcode}
            className="btn-primary"
            style={{
              width: '100%', padding: '13px', fontSize: 14, fontWeight: 700,
              background: 'linear-gradient(135deg, #FFB347, #FF8C00)',
              color: '#000', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
            }}
          >
            {loading ? (
              <RefreshCw size={16} style={{ animation: 'spin 0.8s linear infinite' }} />
            ) : (
              <Unlock size={16} />
            )}
            <span>{loading ? 'Verifying Credentials...' : 'Unlock Admin Panel'}</span>
          </button>
        </form>

        <div style={{ marginTop: 24, fontSize: 11, color: 'var(--text-muted)' }}>
          🔒 Passcode protected session. Unauthorized entry attempts are logged.
        </div>
      </div>
    </div>
  );
}

// ─── Activation Keys Panel ────────────────────────────────────────────────────
function KeysPanel() {
  const [keys, setKeys] = useState(() => {
    try {
      const local = JSON.parse(localStorage.getItem('quantam_admin_keys') || '[]');
      if (local.length > 0) return local;
    } catch {}
    return [
      {
        id: 'key-primary-1',
        key_value: '657284107',
        membership_plan: 'VIP',
        status: 'active',
        assigned_to: 'alex.trader@gmail.com',
        profiles: { full_name: 'Alex Vance', email: 'alex.trader@gmail.com' },
        expires_at: new Date(Date.now() + 365 * 86400000).toISOString(),
        created_at: new Date().toISOString()
      },
      {
        id: 'key-default-2',
        key_value: '123456789',
        membership_plan: 'Standard',
        status: 'active',
        assigned_to: 'sarah.m@fxinvest.com',
        profiles: { full_name: 'Sarah Miller', email: 'sarah.m@fxinvest.com' },
        expires_at: new Date(Date.now() + 365 * 86400000).toISOString(),
        created_at: new Date().toISOString()
      }
    ];
  });

  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [genCount, setGenCount] = useState(1);
  const [genPlan, setGenPlan] = useState('Standard');
  const [genDays, setGenDays] = useState(30);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(null);
  const [newlyCreatedKeys, setNewlyCreatedKeys] = useState(null);

  // Assign Key Modal state
  const [assignModal, setAssignModal] = useState(null);
  const [assignEmail, setAssignEmail] = useState('');
  const [assignName, setAssignName] = useState('');

  const fetchKeys = async () => {
    setLoading(true);
    let serverKeys = [];
    try {
      serverKeys = await fetchServerKeys();
    } catch {}

    let dbKeys = [];
    try {
      const { data } = await supabase
        .from('activation_keys')
        .select('*, profiles(full_name, email)')
        .order('created_at', { ascending: false });
      if (data) dbKeys = data;
    } catch (err) {
      console.warn('DB fetch keys note:', err);
    }

    let localKeys = [];
    try {
      localKeys = JSON.parse(localStorage.getItem('quantam_admin_keys') || '[]');
    } catch {}

    // Cross reference with quantam_all_members to ensure used keys reflect member names
    let members = [];
    try {
      members = await fetchServerMembers();
    } catch {}

    const combinedMap = new Map();
    [...serverKeys, ...localKeys, ...dbKeys].forEach(k => {
      if (k?.key_value && !combinedMap.has(k.key_value)) {
        // If assigned profile is missing, check if any member has this key
        let matchedMember = members.find(m => m.activation_key === k.key_value);
        if (!k.profiles && matchedMember) {
          k = {
            ...k,
            status: 'active',
            assigned_to: matchedMember.email,
            profiles: { full_name: matchedMember.full_name, email: matchedMember.email }
          };
        }
        combinedMap.set(k.key_value, k);
      }
    });

    // Ensure all keys bound to members in quantam_all_members are visible and marked active!
    members.forEach(m => {
      if (m.activation_key) {
        const existing = combinedMap.get(m.activation_key);
        combinedMap.set(m.activation_key, {
          id: existing?.id || 'key-' + m.activation_key,
          key_value: m.activation_key,
          membership_plan: existing?.membership_plan || (m.activation_key === '657284107' ? 'VIP' : 'Standard'),
          status: 'active',
          assigned_to: m.email,
          profiles: { full_name: m.full_name, email: m.email },
          expires_at: existing?.expires_at || new Date(Date.now() + 365 * 86400000).toISOString(),
          created_at: existing?.created_at || m.created_at || new Date().toISOString()
        });
      }
    });

    // Ensure 657284107 is in list
    if (!combinedMap.has('657284107')) {
      combinedMap.set('657284107', {
        id: 'key-primary-1',
        key_value: '657284107',
        membership_plan: 'VIP',
        status: 'active',
        assigned_to: 'alex.trader@gmail.com',
        profiles: { full_name: 'Alex Vance', email: 'alex.trader@gmail.com' },
        expires_at: new Date(Date.now() + 365 * 86400000).toISOString(),
        created_at: new Date().toISOString()
      });
    }

    const merged = Array.from(combinedMap.values());
    setKeys(merged);
    localStorage.setItem('quantam_admin_keys', JSON.stringify(merged));
    setLoading(false);
  };

  useEffect(() => {
    fetchKeys();
    const interval = setInterval(fetchKeys, 3000);
    return () => clearInterval(interval);
  }, []);

  const generateKeys = async () => {
    setGenerating(true);
    const count = Math.max(1, Math.min(50, Number(genCount) || 1));
    const newItems = Array.from({ length: count }, () => ({
      id: 'key-' + Date.now() + '-' + Math.floor(1000 + Math.random() * 9000),
      key_value: String(Math.floor(100000000 + Math.random() * 900000000)),
      membership_plan: genPlan,
      expires_at: genDays > 0 ? new Date(Date.now() + genDays * 86400000).toISOString() : null,
      status: 'unused',
      assigned_to: null,
      profiles: null,
      created_at: new Date().toISOString()
    }));

    const updated = [...newItems, ...keys];
    setKeys(updated);
    localStorage.setItem('quantam_admin_keys', JSON.stringify(updated));
    setNewlyCreatedKeys(newItems);

    // Save to shared dev server DB for instant cross-window sync
    saveServerKey(newItems);

    try {
      await navigator.clipboard.writeText(newItems[0].key_value);
      toast.success(`Key ${newItems[0].key_value} copied to clipboard!`, { id: 'key-gen', duration: 4500 });
    } catch {
      toast.success(`Generated ${count} key${count > 1 ? 's' : ''}!`, { id: 'key-gen', duration: 4000 });
    }

    try {
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2500));
      await Promise.race([
        supabase.from('activation_keys').insert(newItems.map(item => ({
          key_value: item.key_value,
          membership_plan: item.membership_plan,
          expires_at: item.expires_at,
          status: item.status
        }))),
        timeoutPromise
      ]);
    } catch (err) {
      console.warn('Supabase key insert note:', err);
    }

    setGenerating(false);
  };

  const toggleKeyStatus = (keyObj) => {
    const nextStatus = keyObj.status === 'active' ? 'unused' : 'active';
    const updated = keys.map(k => {
      if (k.id === keyObj.id || k.key_value === keyObj.key_value) {
        return {
          ...k,
          status: nextStatus,
          assigned_to: nextStatus === 'active' ? (k.assigned_to || 'manual.assign@quantam.ea') : null,
          profiles: nextStatus === 'active' ? (k.profiles || { full_name: 'Manual Assign', email: 'manual.assign@quantam.ea' }) : null
        };
      }
      return k;
    });
    setKeys(updated);
    localStorage.setItem('quantam_admin_keys', JSON.stringify(updated));
    toast.success(`Key ${keyObj.key_value} marked as ${nextStatus.toUpperCase()}!`);

    try {
      supabase.from('activation_keys').update({ status: nextStatus }).eq('key_value', keyObj.key_value).catch(() => {});
    } catch {}
  };

  const handleSaveAssignment = (e) => {
    e.preventDefault();
    if (!assignModal || !assignEmail.trim()) return;

    const email = assignEmail.trim();
    const name = assignName.trim() || email.split('@')[0];

    const updated = keys.map(k => {
      if (k.key_value === assignModal.key_value) {
        return {
          ...k,
          status: 'active',
          assigned_to: email,
          profiles: { full_name: name, email: email }
        };
      }
      return k;
    });

    setKeys(updated);
    localStorage.setItem('quantam_admin_keys', JSON.stringify(updated));

    // Update members list
    try {
      const members = JSON.parse(localStorage.getItem('quantam_all_members') || '[]');
      const matchIdx = members.findIndex(m => m.email?.toLowerCase() === email.toLowerCase());
      if (matchIdx >= 0) {
        members[matchIdx].activation_key = assignModal.key_value;
      } else {
        members.push({
          id: 'usr-' + Date.now(),
          full_name: name,
          email: email,
          role: 'member',
          status: 'active',
          balance: 0.00,
          activation_key: assignModal.key_value,
          created_at: new Date().toISOString()
        });
      }
      localStorage.setItem('quantam_all_members', JSON.stringify(members));
    } catch {}

    toast.success(`Key ${assignModal.key_value} assigned to ${email}!`);
    setAssignModal(null);
    setAssignEmail('');
    setAssignName('');
  };

  const revokeKey = async (id, keyValue) => {
    const updated = keys.map(k => (k.id === id || k.key_value === keyValue) ? { ...k, status: 'revoked' } : k);
    setKeys(updated);
    localStorage.setItem('quantam_admin_keys', JSON.stringify(updated));
    toast('Key revoked', { icon: '🚫' });
    try {
      await supabase.from('activation_keys').update({ status: 'revoked' }).eq('key_value', keyValue);
    } catch {}
  };

  const extendKey = async (id, keyValue) => {
    const days = Number(prompt('Extend by how many days?', '30'));
    if (!days) return;
    const updated = keys.map(k => {
      if (k.id === id || k.key_value === keyValue) {
        const base = k.expires_at ? new Date(k.expires_at) : new Date();
        const newExpiry = new Date(Math.max(base, new Date()) + days * 86400000);
        return { ...k, expires_at: newExpiry.toISOString(), status: 'active' };
      }
      return k;
    });
    setKeys(updated);
    localStorage.setItem('quantam_admin_keys', JSON.stringify(updated));
    toast.success(`Key extended by ${days} days!`);
    try {
      const match = updated.find(k => k.id === id || k.key_value === keyValue);
      if (match) {
        await supabase.from('activation_keys').update({ expires_at: match.expires_at, status: 'active' }).eq('key_value', keyValue);
      }
    } catch {}
  };

  const deleteKey = async (id, keyValue) => {
    if (!confirm(`Delete key ${keyValue} permanently?`)) return;
    const updated = keys.filter(k => k.id !== id && k.key_value !== keyValue);
    setKeys(updated);
    localStorage.setItem('quantam_admin_keys', JSON.stringify(updated));
    toast.success('Key deleted.');
    try {
      await supabase.from('activation_keys').delete().eq('key_value', keyValue);
    } catch {}
  };

  const copyKey = (val) => {
    navigator.clipboard.writeText(val);
    setCopied(val);
    toast.success(`Copied: ${val}`);
    setTimeout(() => setCopied(null), 2000);
  };

  const exportKeys = () => {
    const csv = ['Key,Plan,Status,Assigned To,Expires At',
      ...keys.map(k => `${k.key_value},${k.membership_plan},${k.status},${k.profiles?.email || k.assigned_to || 'Unassigned'},${k.expires_at || 'Never'}`)
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `quantam_keys_${Date.now()}.csv`;
    a.click();
  };

  const filtered = keys.filter(k =>
    k.key_value?.includes(search) ||
    k.assigned_to?.toLowerCase().includes(search.toLowerCase()) ||
    k.profiles?.email?.toLowerCase().includes(search.toLowerCase()) ||
    k.profiles?.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Generator */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Generate Numerical Activation Keys</h3>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>COUNT</label>
            <input className="input-field" type="number" min={1} max={50} value={genCount} onChange={e => setGenCount(Number(e.target.value))} style={{ width: 80, marginTop: 4 }} />
          </div>
          <div>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>PLAN</label>
            <select className="input-field" value={genPlan} onChange={e => setGenPlan(e.target.value)} style={{ marginTop: 4, width: 140 }}>
              <option value="Standard">Standard</option>
              <option value="Premium">Premium</option>
              <option value="VIP">VIP</option>
              <option value="Lifetime">Lifetime</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>DURATION (DAYS, 0=never)</label>
            <input className="input-field" type="number" min={0} value={genDays} onChange={e => setGenDays(Number(e.target.value))} style={{ width: 100, marginTop: 4 }} />
          </div>
          <button className="btn-primary" onClick={generateKeys} disabled={generating} style={{ height: 40 }}>
            <Plus size={15} /> {generating ? 'Generating...' : `Generate ${genCount} Key${genCount > 1 ? 's' : ''}`}
          </button>
          <button className="btn-secondary" onClick={exportKeys} style={{ marginLeft: 'auto', height: 40 }}>
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* Newly Generated Keys Showcase Modal/Banner */}
      {newlyCreatedKeys && newlyCreatedKeys.length > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(0,255,102,0.12), rgba(0,255,102,0.03))',
          border: '1.5px solid var(--accent-green)',
          borderRadius: 14,
          padding: '20px 24px',
          marginBottom: 20,
          boxShadow: '0 8px 32px rgba(0,255,102,0.15)',
          position: 'relative'
        }}>
          <button
            onClick={() => setNewlyCreatedKeys(null)}
            style={{
              position: 'absolute', top: 12, right: 12,
              background: 'transparent', border: 'none', color: 'var(--text-muted)',
              cursor: 'pointer', padding: 4
            }}
          >
            <X size={18} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'rgba(0,255,102,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Sparkles size={18} color="var(--accent-green)" />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>
                🎉 {newlyCreatedKeys.length > 1 ? `${newlyCreatedKeys.length} Keys Generated Successfully!` : 'Key Generated Successfully!'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--accent-green)' }}>
                Active and ready for immediate account activation.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
            {newlyCreatedKeys.map((item, idx) => (
              <div
                key={item.id || idx}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(0,255,102,0.25)',
                  borderRadius: 10, padding: '12px 18px', flexWrap: 'wrap', gap: 12
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>KEY #{idx + 1}</span>
                  <span
                    className="mono"
                    style={{
                      fontSize: 22, fontWeight: 900,
                      color: 'var(--accent-green)', letterSpacing: '3px'
                    }}
                  >
                    {item.key_value}
                  </span>
                  <span className="badge badge-green" style={{ fontSize: 11 }}>
                    {item.membership_plan}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => copyKey(item.key_value)}
                    className="btn-primary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', fontSize: 13 }}
                  >
                    {copied === item.key_value ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy Key</>}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input className="input-field" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by key, name, or email..." style={{ paddingLeft: 38 }} />
      </div>

      {/* Table */}
      <div style={{ background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>KEY VALUE</th>
                <th>USAGE STATUS</th>
                <th>TIER / PLAN</th>
                <th>ASSIGNED MEMBER</th>
                <th>EXPIRES</th>
                <th>KEY ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40 }}>Loading keys...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No keys found.</td></tr>
              ) : filtered.map(k => {
                const isUsed = k.status === 'active' || !!k.assigned_to || !!k.profiles;
                const assignedEmail = k.profiles?.email || k.assigned_to;
                const assignedName = k.profiles?.full_name || (assignedEmail ? assignedEmail.split('@')[0] : null);

                return (
                  <tr key={k.id || k.key_value}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="mono" style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: 14 }}>
                          {k.key_value}
                        </span>
                        <button onClick={() => copyKey(k.key_value)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied === k.key_value ? 'var(--accent-green)' : 'var(--text-muted)', padding: 2 }}>
                          {copied === k.key_value ? <CheckCircle size={13} /> : <Copy size={13} />}
                        </button>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${k.status === 'revoked' ? 'badge-red' : isUsed ? 'badge-green' : 'badge-gray'}`}>
                        {k.status === 'revoked' ? 'REVOKED' : isUsed ? '● ACTIVE (USED)' : '○ UNUSED'}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-yellow" style={{ fontSize: 11 }}>{k.membership_plan}</span>
                    </td>
                    <td>
                      {assignedEmail ? (
                        <div>
                          <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 600 }}>{assignedName}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{assignedEmail}</div>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Unassigned</span>
                      )}
                    </td>
                    <td>
                      <span style={{ fontSize: 12, color: k.expires_at && new Date(k.expires_at) < new Date() ? 'var(--danger)' : 'var(--text-secondary)' }}>
                        {k.expires_at ? format(new Date(k.expires_at), 'dd MMM yyyy') : '∞ Never'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        {/* Toggle used/unused status */}
                        <button
                          onClick={() => toggleKeyStatus(k)}
                          className="btn-secondary btn-sm"
                          title={isUsed ? "Mark as Unused" : "Mark as Used"}
                          style={{ fontSize: 11, padding: '4px 8px' }}
                        >
                          {isUsed ? 'Set Unused' : 'Set Used'}
                        </button>

                        {/* Assign to member */}
                        <button
                          onClick={() => {
                            setAssignModal(k);
                            setAssignEmail(assignedEmail || '');
                            setAssignName(assignedName || '');
                          }}
                          className="btn-secondary btn-sm"
                          title="Assign to specific user"
                          style={{ fontSize: 11, padding: '4px 8px' }}
                        >
                          Assign
                        </button>

                        <button onClick={() => extendKey(k.id, k.key_value)} className="btn-secondary btn-sm" title="Extend duration"><RefreshCw size={12} /></button>
                        {k.status !== 'revoked' && <button onClick={() => revokeKey(k.id, k.key_value)} className="btn-danger btn-sm" title="Revoke"><XCircle size={12} /></button>}
                        <button onClick={() => deleteKey(k.id, k.key_value)} style={{ padding: '6px', borderRadius: 6, border: '1px solid rgba(255,68,68,0.2)', background: 'transparent', cursor: 'pointer', color: '#FF6666' }} title="Delete key"><Trash2 size={12} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Assign Key Modal */}
      {assignModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <div className="card animate-fade-in" style={{ maxWidth: 440, width: '100%', padding: '28px 24px' }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>
              Assign Activation Key to Member
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 18 }}>
              Binding Key <span className="mono" style={{ color: 'var(--accent-green)', fontWeight: 700 }}>{assignModal.key_value}</span> to an account:
            </p>

            <form onSubmit={handleSaveAssignment}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: 4 }}>MEMBER EMAIL</label>
                <input
                  type="email"
                  className="input-field"
                  placeholder="member@example.com"
                  value={assignEmail}
                  onChange={e => setAssignEmail(e.target.value)}
                  required
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: 4 }}>FULL NAME</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Alex Vance"
                  value={assignName}
                  onChange={e => setAssignName(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="btn-secondary" onClick={() => setAssignModal(null)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Assignment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Set Account Balances Panel (For Every Account) ───────────────────────────
function BalancesPanel() {
  const [members, setMembers] = useState(() => {
    try {
      const local = JSON.parse(localStorage.getItem('quantam_all_members') || '[]');
      if (local.length > 0) return local;
    } catch {}
    return DEFAULT_SYSTEM_MEMBERS;
  });

  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [editingMember, setEditingMember] = useState(null);
  const [newBalance, setNewBalance] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchMembers = async () => {
    setLoading(true);
    let dbProfiles = [];
    try {
      const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (data && data.length > 0) dbProfiles = data;
    } catch {}

    let serverMembers = [];
    try {
      serverMembers = await fetchServerMembers();
    } catch {}

    let localMembers = [];
    try {
      localMembers = JSON.parse(localStorage.getItem('quantam_all_members') || '[]');
    } catch {}

    // Combine
    const map = new Map();
    DEFAULT_SYSTEM_MEMBERS.forEach(m => map.set(m.email.toLowerCase(), m));
    localMembers.forEach(m => map.set(m.email?.toLowerCase(), { ...map.get(m.email?.toLowerCase()), ...m }));
    serverMembers.forEach(m => map.set(m.email?.toLowerCase(), { ...map.get(m.email?.toLowerCase()), ...m }));
    dbProfiles.forEach(m => {
      if (m?.email) map.set(m.email.toLowerCase(), { ...map.get(m.email.toLowerCase()), ...m });
    });

    // Sync per-user localStorage balance
    const merged = Array.from(map.values()).map(m => {
      const savedBal = localStorage.getItem('quantam_balance_' + m.email) || localStorage.getItem('quantam_balance_' + m.id);
      if (savedBal !== null) {
        return { ...m, balance: parseFloat(savedBal) };
      }
      return m;
    });

    setMembers(merged);
    localStorage.setItem('quantam_all_members', JSON.stringify(merged));
    setLoading(false);
  };

  useEffect(() => {
    fetchMembers();
    const interval = setInterval(fetchMembers, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateBalance = async (member, amount) => {
    setUpdating(true);
    const parsedAmount = Math.max(0, parseFloat(amount) || 0);

    // 1. Update server & cross-window sync
    await updateServerBalance(member, parsedAmount);

    // 2. Update local state
    const updated = members.map(m => {
      if (m.id === member.id || m.email?.toLowerCase() === member.email?.toLowerCase()) {
        return { ...m, balance: parsedAmount };
      }
      return m;
    });
    setMembers(updated);

    // 3. Try updating Supabase
    try {
      await supabase.from('profiles').update({ balance: parsedAmount }).eq('id', member.id);
    } catch {}

    toast.success(`Balance for ${member.email} updated to $${parsedAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}!`, {
      icon: '💰',
      duration: 4000
    });

    setUpdating(false);
    setEditingMember(null);
    setNewBalance('');
  };

  const filtered = members.filter(m =>
    m.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    m.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(0,255,102,0.08), rgba(0,255,102,0.02))',
        border: '1px solid rgba(0,255,102,0.2)',
        borderRadius: 14, padding: '20px 24px', marginBottom: 20,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(0,255,102,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Wallet size={22} color="var(--accent-green)" />
          </div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>Trading Account Capital Allocation</h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              Every account begins at <strong>$0.00</strong> unallocated. As the Administrator, allocate and set trading capital for each member account below.
            </p>
          </div>
        </div>

        <button onClick={fetchMembers} className="btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <RefreshCw size={13} /> Refresh Balances
        </button>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input className="input-field" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search member by name or email..." style={{ paddingLeft: 38 }} />
      </div>

      {/* Members Balance Table */}
      <div style={{ background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>ACCOUNT / MEMBER</th>
                <th>ROLE</th>
                <th>CURRENT TRADING BALANCE</th>
                <th>CAPITAL STATUS</th>
                <th>ACTIVE KEY</th>
                <th>SET ACCOUNT BALANCE</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40 }}>Loading account balances...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No accounts found.</td></tr>
              ) : filtered.map(m => {
                const bal = Number(m.balance) || 0;
                const isZero = bal <= 0;

                return (
                  <tr key={m.id || m.email}>
                    <td>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{m.full_name || 'Member'}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{m.email}</div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${m.role === 'admin' ? 'badge-yellow' : 'badge-gray'}`} style={{ fontSize: 10 }}>
                        {m.role?.toUpperCase() || 'MEMBER'}
                      </span>
                    </td>
                    <td>
                      <div className="mono" style={{
                        fontSize: 16, fontWeight: 900,
                        color: isZero ? 'var(--warning)' : 'var(--accent-green)'
                      }}>
                        ${bal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${isZero ? 'badge-yellow' : 'badge-green'}`} style={{ fontSize: 10 }}>
                        {isZero ? 'UNALLOCATED ($0.00)' : 'ACTIVE CAPITAL'}
                      </span>
                    </td>
                    <td>
                      <span className="mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {m.activation_key || '—'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        {/* Quick Presets */}
                        <button
                          onClick={() => handleUpdateBalance(m, bal + 1000)}
                          className="btn-secondary btn-sm"
                          style={{ fontSize: 10, padding: '3px 7px' }}
                          title="Add $1,000"
                        >
                          +$1K
                        </button>
                        <button
                          onClick={() => handleUpdateBalance(m, bal + 5000)}
                          className="btn-secondary btn-sm"
                          style={{ fontSize: 10, padding: '3px 7px' }}
                          title="Add $5,000"
                        >
                          +$5K
                        </button>
                        <button
                          onClick={() => handleUpdateBalance(m, bal + 10000)}
                          className="btn-secondary btn-sm"
                          style={{ fontSize: 10, padding: '3px 7px' }}
                          title="Add $10,000"
                        >
                          +$10K
                        </button>
                        <button
                          onClick={() => handleUpdateBalance(m, 0)}
                          className="btn-secondary btn-sm"
                          style={{ fontSize: 10, padding: '3px 7px', color: '#FF6666' }}
                          title="Reset to zero"
                        >
                          Reset $0
                        </button>

                        {/* Custom Edit Button */}
                        <button
                          onClick={() => {
                            setEditingMember(m);
                            setNewBalance(bal.toString());
                          }}
                          className="btn-primary btn-sm"
                          style={{ fontSize: 11, padding: '5px 12px', display: 'flex', alignItems: 'center', gap: 4 }}
                        >
                          <DollarSign size={12} /> Set Balance
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Set Balance Modal */}
      {editingMember && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <div className="card animate-fade-in" style={{ maxWidth: 440, width: '100%', padding: '30px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 800 }}>Allocate Account Balance</h3>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{editingMember.full_name} ({editingMember.email})</div>
              </div>
              <button onClick={() => setEditingMember(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              handleUpdateBalance(editingMember, newBalance);
            }}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: 6 }}>
                  SET EXACT BALANCE (USD)
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-green)', fontWeight: 800 }}>$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="input-field mono"
                    value={newBalance}
                    onChange={e => setNewBalance(e.target.value)}
                    required
                    style={{ paddingLeft: 30, fontSize: 18, fontWeight: 800 }}
                  />
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 22 }}>
                {[0, 500, 1000, 2500, 5000, 10000, 25000, 50000].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setNewBalance(amt.toString())}
                    className="btn-secondary btn-sm"
                    style={{ fontSize: 11, padding: '4px 10px' }}
                  >
                    ${amt.toLocaleString()}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="btn-secondary" onClick={() => setEditingMember(null)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={updating}>
                  {updating ? 'Saving...' : 'Confirm Balance Allocation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Members Panel ────────────────────────────────────────────────────────────
function MembersPanel() {
  const [members, setMembers] = useState(() => {
    try {
      const local = JSON.parse(localStorage.getItem('quantam_all_members') || '[]');
      if (local.length > 0) return local;
    } catch {}
    return DEFAULT_SYSTEM_MEMBERS;
  });

  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const fetchMembers = async () => {
    setLoading(true);
    let dbProfiles = [];
    try {
      const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (data && data.length > 0) dbProfiles = data;
    } catch {}

    let localMembers = [];
    try {
      localMembers = JSON.parse(localStorage.getItem('quantam_all_members') || '[]');
    } catch {}

    const map = new Map();
    DEFAULT_SYSTEM_MEMBERS.forEach(m => map.set(m.email.toLowerCase(), m));
    localMembers.forEach(m => map.set(m.email?.toLowerCase(), { ...map.get(m.email?.toLowerCase()), ...m }));
    dbProfiles.forEach(m => {
      if (m?.email) map.set(m.email.toLowerCase(), { ...map.get(m.email.toLowerCase()), ...m });
    });

    const merged = Array.from(map.values());
    setMembers(merged);
    localStorage.setItem('quantam_all_members', JSON.stringify(merged));
    setLoading(false);
  };

  useEffect(() => { fetchMembers(); }, []);

  const toggleStatus = async (member) => {
    const next = member.status === 'active' ? 'suspended' : 'active';
    const updated = members.map(m => m.id === member.id ? { ...m, status: next } : m);
    setMembers(updated);
    localStorage.setItem('quantam_all_members', JSON.stringify(updated));
    toast.success(`Member status set to ${next.toUpperCase()}`);
    try {
      await supabase.from('profiles').update({ status: next }).eq('id', member.id);
    } catch {}
  };

  const deleteUser = async (id, email) => {
    if (!confirm(`Delete member ${email}? This cannot be undone.`)) return;
    const updated = members.filter(m => m.id !== id && m.email !== email);
    setMembers(updated);
    localStorage.setItem('quantam_all_members', JSON.stringify(updated));
    toast.success('Member removed.');
    try {
      await supabase.from('profiles').delete().eq('id', id);
    } catch {}
  };

  const filtered = members.filter(m =>
    m.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    m.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input className="input-field" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search members..." style={{ paddingLeft: 38 }} />
      </div>

      <div style={{ background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>MEMBER</th>
                <th>ACCOUNT BALANCE</th>
                <th>STATUS</th>
                <th>ROLE</th>
                <th>KEY BOUND</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40 }}>Loading members...</td></tr>
              ) : filtered.map(m => (
                <tr key={m.id || m.email}>
                  <td>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{m.full_name || 'Member'}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{m.email}</div>
                    </div>
                  </td>
                  <td>
                    <span className="mono" style={{ fontWeight: 800, color: (m.balance || 0) > 0 ? 'var(--accent-green)' : 'var(--warning)' }}>
                      ${(m.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${m.status === 'active' ? 'badge-green' : 'badge-red'}`}>
                      {m.status?.toUpperCase() || 'ACTIVE'}
                    </span>
                  </td>
                  <td><span className="badge badge-gray">{m.role?.toUpperCase() || 'MEMBER'}</span></td>
                  <td><span className="mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>{m.activation_key || '—'}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        onClick={() => toggleStatus(m)}
                        className={`btn-sm ${m.status === 'active' ? 'btn-danger' : 'btn-secondary'}`}
                        style={{ fontSize: 11, padding: '4px 8px' }}
                      >
                        {m.status === 'active' ? 'Suspend' : 'Reactivate'}
                      </button>
                      <button
                        onClick={() => deleteUser(m.id, m.email)}
                        style={{ padding: '6px', borderRadius: 6, border: '1px solid rgba(255,68,68,0.2)', background: 'transparent', cursor: 'pointer', color: '#FF6666' }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Main Admin Panel ─────────────────────────────────────────────────────────
export default function AdminPanel() {
  const [isUnlocked, setIsUnlocked] = useState(() => {
    return sessionStorage.getItem('quantam_admin_passcode_unlocked') === 'true';
  });

  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState({
    total: 3,
    active: 3,
    suspended: 0,
    totalKeys: 2,
    usedKeys: 2,
    unusedKeys: 0
  });

  useEffect(() => {
    if (!isUnlocked) return;

    try {
      const keys = JSON.parse(localStorage.getItem('quantam_admin_keys') || '[]');
      const members = JSON.parse(localStorage.getItem('quantam_all_members') || '[]');
      const mList = members.length > 0 ? members : DEFAULT_SYSTEM_MEMBERS;

      setStats({
        total: mList.length,
        active: mList.filter(x => x.status === 'active' || !x.status).length,
        suspended: mList.filter(x => x.status === 'suspended').length,
        totalKeys: keys.length,
        usedKeys: keys.filter(x => x.status === 'active' || !!x.assigned_to).length,
        unusedKeys: keys.filter(x => x.status === 'unused' && !x.assigned_to).length,
        totalCapital: mList.reduce((acc, m) => acc + (Number(m.balance) || 0), 0)
      });
    } catch {}
  }, [isUnlocked, tab]);

  const handleLockSession = () => {
    sessionStorage.removeItem('quantam_admin_passcode_unlocked');
    setIsUnlocked(false);
    toast('Admin session locked.', { icon: '🔒' });
  };

  // If not unlocked with @Slime25, show the passcode gate
  if (!isUnlocked) {
    return <AdminPasscodeGate onUnlock={() => setIsUnlocked(true)} />;
  }

  const TABS = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'balances', label: 'Account Balances', icon: DollarSign },
    { id: 'keys', label: 'Activation Keys', icon: Key },
    { id: 'members', label: 'Members', icon: Users },
  ];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(255,179,71,0.1), rgba(255,179,71,0.02))',
        border: '1px solid rgba(255,179,71,0.25)', borderRadius: 16, padding: '22px 26px', marginBottom: 24,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(255,179,71,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={24} color="var(--warning)" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 style={{ fontSize: 22, fontWeight: 800 }}>Admin Control Panel</h1>
              <span className="badge badge-yellow" style={{ fontSize: 10 }}>
                🔒 AUTHENTICATED (@Slime25)
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 2 }}>
              Master platform configuration, key management & account balance allocation
            </p>
          </div>
        </div>

        <button
          onClick={handleLockSession}
          className="btn-secondary"
          style={{
            display: 'flex', alignItems: 'center', gap: 6, fontSize: 12,
            padding: '8px 16px', borderColor: 'rgba(255,68,68,0.3)', color: '#FF6666'
          }}
        >
          <Lock size={14} /> Lock Admin Session
        </button>
      </div>

      {/* Tab nav */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', marginBottom: 24, gap: 4 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px',
            background: 'none', border: 'none', cursor: 'pointer',
            color: tab === t.id ? 'var(--accent-green)' : 'var(--text-muted)',
            fontWeight: tab === t.id ? 700 : 500, fontSize: 14,
            borderBottom: tab === t.id ? '2px solid var(--accent-green)' : '2px solid transparent',
            marginBottom: -1, transition: 'all 0.15s'
          }}>
            <t.icon size={15} /> {t.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {tab === 'overview' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
            <StatCard icon={Users} label="Total Members" value={stats.total} color="#4FC3F7" />
            <StatCard icon={CheckCircle} label="Active Members" value={stats.active} color="var(--accent-green)" />
            <StatCard icon={XCircle} label="Suspended" value={stats.suspended} color="var(--danger)" />
            <StatCard icon={Key} label="Total Activation Keys" value={stats.totalKeys} color="var(--warning)" />
            <StatCard icon={Activity} label="Keys In Use" value={stats.usedKeys} color="var(--accent-green)" />
            <StatCard icon={Clock} label="Unused Keys" value={stats.unusedKeys} color="var(--text-secondary)" />
            <StatCard icon={DollarSign} label="Total Allocated Capital" value={`$${(stats.totalCapital || 0).toLocaleString()}`} color="var(--accent-green)" />
          </div>

          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
            borderRadius: 14, padding: '24px 28px'
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Administrative Quick Actions</h3>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button onClick={() => setTab('balances')} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <DollarSign size={16} /> Set Member Balances
              </button>
              <button onClick={() => setTab('keys')} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Key size={16} /> Manage Activation Keys
              </button>
              <button onClick={() => setTab('members')} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Users size={16} /> View Member Accounts
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Balances Tab */}
      {tab === 'balances' && <BalancesPanel />}

      {/* Keys Tab */}
      {tab === 'keys' && <KeysPanel />}

      {/* Members Tab */}
      {tab === 'members' && <MembersPanel />}
    </div>
  );
}
