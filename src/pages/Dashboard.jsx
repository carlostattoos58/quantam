import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { format, differenceInDays } from 'date-fns';
import { Shield, TrendingUp, Zap, Calendar, Clock, Bell, Sparkles } from 'lucide-react';
import AccountBalanceCard from '../components/AccountBalanceCard';
import BotControlPanel from '../components/BotControlPanel';
import LiveMarketsGrid from '../components/LiveMarketsGrid';
import ActiveTradesTerminal from '../components/ActiveTradesTerminal';
import { fetchServerMembers } from '../lib/syncService';

function StatCard({ icon: Icon, label, value, color = 'var(--accent-green)', badge, sub }) {
  return (
    <div className="card animate-fade-in" style={{ borderTop: `2px solid ${color}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div style={{ width: 42, height: 42, borderRadius: 10, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={20} color={color} />
        </div>
        {badge && <span className={`badge ${badge.cls}`}>{badge.text}</span>}
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, color, marginBottom: 4, fontFamily: "'JetBrains Mono', monospace" }}>{value}</div>
      <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>{label}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

export default function Dashboard() {
  const { profile, user } = useAuth();
  const userIdentifier = profile?.email || user?.email || profile?.id || user?.id || 'default';

  // Balance state stored in localStorage (user-specific) or loaded from profile (Default 0.00)
  const [balance, setBalance] = useState(() => {
    // 1. User specific localStorage balance
    const userSaved = localStorage.getItem('quantam_balance_' + userIdentifier);
    if (userSaved !== null) return parseFloat(userSaved);

    // 2. Profile balance
    if (profile?.balance !== undefined && profile?.balance !== null) {
      return parseFloat(profile.balance);
    }
    
    // 3. Fallback
    const saved = localStorage.getItem('quantam_account_balance');
    return saved ? parseFloat(saved) : 0.0;
  });

  const [botRunning, setBotRunning] = useState(() => {
    return localStorage.getItem('quantam_bot_status') === 'running';
  });

  const [profitToday, setProfitToday] = useState(() => {
    const saved = localStorage.getItem('quantam_profit_today');
    return saved ? parseFloat(saved) : 0.0;
  });

  // Listen for admin balance updates across tabs or within session
  useEffect(() => {
    const handleBalanceSync = async () => {
      // Check server for live cross-window balance updates
      try {
        const members = await fetchServerMembers();
        const me = members.find(m =>
          (userIdentifier && m.email?.toLowerCase() === userIdentifier.toLowerCase()) ||
          (userIdentifier && m.id === userIdentifier)
        );
        if (me && me.balance !== undefined && me.balance !== null) {
          const sBal = parseFloat(me.balance);
          setBalance(sBal);
          localStorage.setItem('quantam_balance_' + userIdentifier, sBal.toString());
          localStorage.setItem('quantam_account_balance', sBal.toString());
          return;
        }
      } catch {}

      const userSaved = localStorage.getItem('quantam_balance_' + userIdentifier);
      if (userSaved !== null) {
        setBalance(parseFloat(userSaved));
      } else if (profile?.balance !== undefined && profile?.balance !== null) {
        setBalance(parseFloat(profile.balance));
      }
    };

    window.addEventListener('storage', handleBalanceSync);
    window.addEventListener('quantam_balance_updated', handleBalanceSync);
    const interval = setInterval(handleBalanceSync, 3000);

    return () => {
      window.removeEventListener('storage', handleBalanceSync);
      window.removeEventListener('quantam_balance_updated', handleBalanceSync);
      clearInterval(interval);
    };
  }, [userIdentifier, profile?.balance]);

  // Keep balance in sync if admin updates profile
  useEffect(() => {
    if (profile?.balance !== undefined && profile?.balance !== null) {
      setBalance(parseFloat(profile.balance));
      localStorage.setItem('quantam_balance_' + userIdentifier, profile.balance.toString());
      localStorage.setItem('quantam_account_balance', profile.balance.toString());
    }
  }, [profile?.balance, userIdentifier]);

  useEffect(() => {
    localStorage.setItem('quantam_balance_' + userIdentifier, balance.toString());
    localStorage.setItem('quantam_account_balance', balance.toString());
  }, [balance, userIdentifier]);

  useEffect(() => {
    localStorage.setItem('quantam_profit_today', profitToday.toString());
  }, [profitToday]);

  const handleBotTradeEvent = (profitAdded) => {
    setProfitToday(p => parseFloat((p + profitAdded).toFixed(2)));
    setBalance(b => parseFloat((b + profitAdded).toFixed(2)));
  };

  const handleTradeClosed = (realizedProfit) => {
    setBalance(b => parseFloat((b + realizedProfit).toFixed(2)));
    setProfitToday(p => parseFloat((p + realizedProfit).toFixed(2)));
  };

  const keyInfo = profile?.activation_keys?.[0];
  const expiresAt = keyInfo?.expires_at ? new Date(keyInfo.expires_at) : null;
  const daysLeft = expiresAt ? differenceInDays(expiresAt, new Date()) : null;
  const activatedAt = profile?.created_at ? format(new Date(profile.created_at), 'dd MMM yyyy') : '—';

  return (
    <div className="animate-fade-in">
      {/* Hero Welcome section */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(0,255,102,0.08) 0%, rgba(0,255,102,0.02) 100%)',
        border: '1px solid rgba(0,255,102,0.15)', borderRadius: 16,
        padding: '28px 32px', marginBottom: 24
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 13, color: 'var(--accent-green)', fontWeight: 700, letterSpacing: '1px' }}>⚡ QUANTAM EA v5</span>
              <span className="badge badge-green" style={{ fontSize: 10 }}>TERMINAL LIVE</span>
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
              Welcome back, <span style={{ color: 'var(--accent-green)' }}>{profile?.full_name?.split(' ')[0] || 'Member'}</span>
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
              Trade Smart. Automate Profits. Grow Together.
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Membership Status</div>
            <span className={`badge ${profile?.status === 'active' ? 'badge-green' : 'badge-red'}`} style={{ fontSize: 13, padding: '6px 14px' }}>
              {profile?.status?.toUpperCase() || 'ACTIVE'}
            </span>
          </div>
        </div>
      </div>

      {/* 1. Account Balance & Live Financial Overview */}
      <div style={{ marginBottom: 24 }}>
        <AccountBalanceCard
          balance={balance}
          profitToday={profitToday}
          onUpdateBalance={setBalance}
        />
      </div>

      {/* 2. Automated Trading Bot Control Panel */}
      <div style={{ marginBottom: 24 }}>
        <BotControlPanel
          botRunning={botRunning}
          balance={balance}
          onToggleBot={setBotRunning}
          onTradeEvent={handleBotTradeEvent}
        />
      </div>

      {/* 4. Real-Time Moving Trades Terminal (Scaled to Balance) */}
      <ActiveTradesTerminal
        botRunning={botRunning}
        balance={balance}
        onTradeClosed={handleTradeClosed}
        onProfitUpdate={setProfitToday}
      />

      {/* 5. Real-Time Currency Markets on all Main Currencies */}
      <LiveMarketsGrid />

      {/* 4. Membership Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 24 }}>
        <StatCard
          icon={Shield}
          label="Account Status"
          value={profile?.status === 'active' ? 'Active' : 'Inactive'}
          color={profile?.status === 'active' ? 'var(--accent-green)' : 'var(--danger)'}
          badge={{ text: profile?.status?.toUpperCase() || 'ACTIVE', cls: profile?.status === 'active' ? 'badge-green' : 'badge-red' }}
        />
        <StatCard
          icon={Zap}
          label="Activation Status"
          value="Verified"
          color="var(--accent-green)"
          badge={{ text: 'VERIFIED', cls: 'badge-green' }}
        />
        <StatCard
          icon={TrendingUp}
          label="Membership Plan"
          value={keyInfo?.membership_plan || 'Standard'}
          color="#4FC3F7"
          badge={{ text: 'MEMBER', cls: 'badge-blue' }}
        />
        <StatCard
          icon={Calendar}
          label="Activated"
          value={activatedAt}
          color="var(--accent-silver)"
          sub="Member since"
        />
        {daysLeft !== null && (
          <StatCard
            icon={Clock}
            label="Days Remaining"
            value={daysLeft > 0 ? `${daysLeft}d` : 'Expired'}
            color={daysLeft > 7 ? 'var(--accent-green)' : daysLeft > 0 ? 'var(--warning)' : 'var(--danger)'}
            sub={expiresAt ? `Expires ${format(expiresAt, 'dd MMM yyyy')}` : ''}
            badge={daysLeft <= 0 ? { text: 'EXPIRED', cls: 'badge-red' } : daysLeft < 7 ? { text: 'EXPIRING SOON', cls: 'badge-yellow' } : undefined}
          />
        )}
      </div>

      {/* 5. Quick actions & Announcements */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)' }}>Quick Actions</h3>
          {[
            { label: 'View Trading Signals', href: '/signals', icon: TrendingUp, desc: 'Latest buy/sell opportunities' },
            { label: 'Market Analysis', href: '/analysis', icon: TrendingUp, desc: 'Daily forex & gold outlook' },
            { label: 'EA Information & Downloads', href: '/ea-info', icon: Zap, desc: 'Setup guides & EA v5 files' },
            { label: 'Learning Centre', href: '/learn', icon: Bell, desc: 'Courses & PDF resources' },
          ].map(item => (
            <a key={item.href} href={item.href} style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0',
              borderBottom: '1px solid var(--border-subtle)', textDecoration: 'none', transition: 'padding 0.15s'
            }}
              onMouseEnter={e => e.currentTarget.style.paddingLeft = '8px'}
              onMouseLeave={e => e.currentTarget.style.paddingLeft = '0'}
            >
              <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(0,255,102,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <item.icon size={16} color="var(--accent-green)" />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{item.label}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.desc}</div>
              </div>
            </a>
          ))}
        </div>

        <RecentAnnouncements />
      </div>
    </div>
  );
}

function RecentAnnouncements() {
  const [announcements, setAnnouncements] = React.useState([]);
  React.useEffect(() => {
    import('../lib/supabase.js').then(({ supabase }) => {
      supabase.from('announcements').select('*').order('created_at', { ascending: false }).limit(4)
        .then(({ data }) => setAnnouncements(data || []));
    });
  }, []);

  return (
    <div className="card">
      <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <Bell size={16} color="var(--accent-green)" /> Recent Announcements
      </h3>
      {announcements.length === 0 ? (
        <div style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>No announcements yet.</div>
      ) : announcements.map(a => (
        <div key={a.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{a.title}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{a.content?.substring(0, 80)}...</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{format(new Date(a.created_at), 'dd MMM yyyy')}</div>
        </div>
      ))}
    </div>
  );
}
