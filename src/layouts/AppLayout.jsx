import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LiveMarketTicker from '../components/LiveMarketTicker';
import {
  LayoutDashboard, TrendingUp, BarChart2, Cpu, Activity,
  BookOpen, Bell, Users, User, HeadphonesIcon, LogOut,
  Menu, X, Shield, ChevronRight, Server, Sliders
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/mt5-connection', icon: Server, label: 'MT5 Connection' },
  { to: '/bot-settings', icon: Sliders, label: 'Bot Settings' },
  { to: '/signals', icon: TrendingUp, label: 'Trading Signals' },
  { to: '/analysis', icon: BarChart2, label: 'Market Analysis' },
  { to: '/ea-info', icon: Cpu, label: 'EA Information' },
  { to: '/performance', icon: Activity, label: 'Trading Performance' },
  { to: '/learn', icon: BookOpen, label: 'Learning Centre' },
  { to: '/announcements', icon: Bell, label: 'Announcements' },
  { to: '/community', icon: Users, label: 'Community' },
  { to: '/profile', icon: User, label: 'My Profile' },
  { to: '/support', icon: HeadphonesIcon, label: 'Support' },
];

function NavItem({ to, icon: Icon, label, collapsed, onClick }) {
  return (
    <NavLink
      to={to}
      end={to === '/dashboard'}
      onClick={onClick}
      style={({ isActive }) => ({
        display: 'flex', alignItems: 'center', gap: collapsed ? 0 : 12,
        padding: collapsed ? '12px' : '11px 16px', borderRadius: 8,
        textDecoration: 'none', justifyContent: collapsed ? 'center' : 'flex-start',
        background: isActive ? 'rgba(0,255,102,0.1)' : 'transparent',
        color: isActive ? 'var(--accent-green)' : 'var(--text-secondary)',
        fontWeight: isActive ? 600 : 400, fontSize: 14,
        borderLeft: isActive ? '2px solid var(--accent-green)' : '2px solid transparent',
        transition: 'all 0.15s ease', margin: '1px 0'
      })}
    >
      <Icon size={18} style={{ flexShrink: 0 }} />
      {!collapsed && <span>{label}</span>}
    </NavLink>
  );
}

export default function AppLayout() {
  const { profile, signOut, isAdmin } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleLogout = async () => { await signOut(); navigate('/'); };

  const sidebarContent = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo */}
      <div style={{ padding: collapsed ? '20px 12px' : '24px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between' }}>
        {collapsed ? (
          <div style={{ textAlign: 'center', color: 'var(--accent-green)', fontWeight: 700, fontSize: 18 }}>⚡</div>
        ) : (
          <>
            <div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 15, color: 'var(--accent-green)', letterSpacing: '1.5px' }}>⚡ QUANTAM EA v5</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3, letterSpacing: '0.5px' }}>Trade Smart. Automate Profits.</div>
            </div>
            {/* Mobile close button inside drawer */}
            <button
              className="mobile-close-btn"
              onClick={() => setMobileOpen(false)}
              style={{
                display: 'none',
                background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-subtle)',
                borderRadius: 8, width: 34, height: 34, alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-muted)', cursor: 'pointer', flexShrink: 0
              }}
            >
              <X size={18} />
            </button>
          </>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
        {NAV_ITEMS.map(item => (
          <NavItem key={item.to} {...item} collapsed={collapsed} onClick={() => setMobileOpen(false)} />
        ))}

        {/* Admin Link */}
        <div style={{ height: 1, background: 'var(--border-subtle)', margin: '12px 8px' }} />
        <NavLink to="/admin" onClick={() => setMobileOpen(false)} style={({ isActive }) => ({
          display: 'flex', alignItems: 'center', gap: collapsed ? 0 : 12,
          padding: collapsed ? '12px' : '11px 16px', borderRadius: 8,
          textDecoration: 'none', justifyContent: collapsed ? 'center' : 'flex-start',
          background: isActive ? 'rgba(255,179,71,0.12)' : 'rgba(255,179,71,0.03)',
          color: isActive ? 'var(--warning)' : 'var(--text-secondary)',
          fontWeight: 600, fontSize: 13, borderLeft: isActive ? '2px solid var(--warning)' : '2px solid transparent',
          transition: 'all 0.15s ease', margin: '1px 0'
        })}>
          <Shield size={17} color="var(--warning)" style={{ flexShrink: 0 }} />
          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <span>Admin Panel</span>
              <span style={{ fontSize: 10, background: 'rgba(255,179,71,0.15)', color: 'var(--warning)', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>
                🔒 Passcode
              </span>
            </div>
          )}
        </NavLink>
      </nav>

      {/* Profile + Logout */}
      <div style={{ padding: '12px 8px', borderTop: '1px solid var(--border-subtle)' }}>
        {!collapsed && profile && (
          <div style={{ padding: '10px 12px', marginBottom: 8, borderRadius: 8, background: 'var(--bg-hover)' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {profile.full_name || 'Member'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{profile.email}</div>
            <div style={{ marginTop: 6 }}>
              <span className={`badge ${profile.status === 'active' ? 'badge-green' : 'badge-red'}`}>
                {profile.status?.toUpperCase() || 'ACTIVE'}
              </span>
            </div>
          </div>
        )}
        <button onClick={handleLogout} style={{
          display: 'flex', alignItems: 'center', gap: collapsed ? 0 : 10, justifyContent: collapsed ? 'center' : 'flex-start',
          width: '100%', padding: collapsed ? '12px' : '10px 12px', borderRadius: 8, border: 'none',
          background: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 14,
          transition: 'all 0.15s'
        }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,68,68,0.1)'; e.currentTarget.style.color = '#FF6666'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
          <LogOut size={18} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>

      {/* Mobile overlay backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
            zIndex: 40, backdropFilter: 'blur(2px)'
          }}
        />
      )}

      {/* ── Desktop Sidebar ── */}
      <aside className="desktop-sidebar" style={{
        width: collapsed ? 68 : 'var(--sidebar-width)',
        minHeight: '100vh', background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-subtle)', flexShrink: 0,
        transition: 'width 0.25s ease', position: 'sticky', top: 0,
        display: 'flex', flexDirection: 'column', zIndex: 30
      }}>
        {sidebarContent}
        {/* Collapse toggle (desktop only) */}
        <button onClick={() => setCollapsed(c => !c)} style={{
          position: 'absolute', right: -12, top: '50%', transform: 'translateY(-50%)',
          width: 24, height: 24, borderRadius: '50%', border: '1px solid var(--border-subtle)',
          background: 'var(--bg-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--text-muted)', zIndex: 10
        }}>
          <ChevronRight size={12} style={{ transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.25s' }} />
        </button>
      </aside>

      {/* ── Mobile Drawer ── */}
      <aside className="mobile-drawer" style={{
        position: 'fixed', top: 0, left: 0, bottom: 0,
        width: 280, background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-subtle)',
        transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s ease', zIndex: 50,
        display: 'flex', flexDirection: 'column', overflowY: 'auto'
      }}>
        {/* Drawer header with close btn */}
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 15, color: 'var(--accent-green)', letterSpacing: '1.5px' }}>⚡ QUANTAM EA v5</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>Trade Smart. Automate Profits.</div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            style={{
              background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-subtle)',
              borderRadius: 8, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-muted)', cursor: 'pointer', flexShrink: 0
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav items in drawer (never collapsed) */}
        <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
          {NAV_ITEMS.map(item => (
            <NavItem key={item.to} {...item} collapsed={false} onClick={() => setMobileOpen(false)} />
          ))}
          <div style={{ height: 1, background: 'var(--border-subtle)', margin: '12px 8px' }} />
          <NavLink to="/admin" onClick={() => setMobileOpen(false)} style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '11px 16px', borderRadius: 8, textDecoration: 'none',
            background: isActive ? 'rgba(255,179,71,0.12)' : 'rgba(255,179,71,0.03)',
            color: isActive ? 'var(--warning)' : 'var(--text-secondary)',
            fontWeight: 600, fontSize: 13, borderLeft: isActive ? '2px solid var(--warning)' : '2px solid transparent',
            transition: 'all 0.15s ease', margin: '1px 0'
          })}>
            <Shield size={17} color="var(--warning)" />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <span>Admin Panel</span>
              <span style={{ fontSize: 10, background: 'rgba(255,179,71,0.15)', color: 'var(--warning)', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>🔒</span>
            </div>
          </NavLink>
        </nav>

        {/* Profile + Logout in drawer */}
        <div style={{ padding: '12px 8px', borderTop: '1px solid var(--border-subtle)' }}>
          {profile && (
            <div style={{ padding: '10px 12px', marginBottom: 8, borderRadius: 8, background: 'var(--bg-hover)' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{profile.full_name || 'Member'}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{profile.email}</div>
              <div style={{ marginTop: 6 }}>
                <span className={`badge ${profile.status === 'active' ? 'badge-green' : 'badge-red'}`}>
                  {profile.status?.toUpperCase() || 'ACTIVE'}
                </span>
              </div>
            </div>
          )}
          <button onClick={handleLogout} style={{
            display: 'flex', alignItems: 'center', gap: 10, width: '100%',
            padding: '10px 12px', borderRadius: 8, border: 'none', background: 'none',
            cursor: 'pointer', color: 'var(--text-muted)', fontSize: 14, transition: 'all 0.15s'
          }}>
            <LogOut size={18} /><span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main style={{ flex: 1, minWidth: 0, overflowX: 'hidden' }}>
        <LiveMarketTicker />

        {/* Top bar */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 20,
          background: 'rgba(8,11,10,0.9)', backdropFilter: 'blur(10px)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          {/* Hamburger — only visible on mobile */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileOpen(true)}
            style={{
              display: 'none',
              background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-subtle)',
              borderRadius: 8, width: 38, height: 38, alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-primary)', cursor: 'pointer', flexShrink: 0
            }}
          >
            <Menu size={20} />
          </button>

          <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
            Welcome back, <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{profile?.full_name || 'Member'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-green)', animation: 'pulseDot 2s infinite' }} />
            <span style={{ fontSize: 12, color: 'var(--accent-green)', fontWeight: 600 }}>LIVE</span>
          </div>
        </div>

        <div className="main-content-pad">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
