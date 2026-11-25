import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import { Plus, Edit2, Trash2, Bell } from 'lucide-react';

export default function Announcements() {
  const { isAdmin } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  const fetch = async () => {
    setLoading(true);
    const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
    setAnnouncements(data || []);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this announcement?')) return;
    await supabase.from('announcements').delete().eq('id', id);
    fetch();
  };

  const priorityColor = { high: 'badge-red', normal: 'badge-green', low: 'badge-gray' };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Announcements</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Important updates from your administrator</p>
        </div>
        {isAdmin && <button className="btn-primary" onClick={() => setModal({})}><Plus size={16} /> New Announcement</button>}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}><div style={{ width: 36, height: 36, border: '3px solid rgba(0,255,102,0.2)', borderTopColor: 'var(--accent-green)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} /></div>
      ) : announcements.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
          <Bell size={48} style={{ marginBottom: 16, opacity: 0.3 }} />
          <div>No announcements yet.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {announcements.map(a => (
            <div key={a.id} className="card animate-fade-in" style={{ borderLeft: `3px solid ${a.priority === 'high' ? 'var(--danger)' : a.priority === 'normal' ? 'var(--accent-green)' : 'var(--text-muted)'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <span className={`badge ${priorityColor[a.priority] || 'badge-gray'}`}>{(a.priority || 'normal').toUpperCase()}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{format(new Date(a.created_at), 'dd MMM yyyy, HH:mm')}</span>
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>{a.title}</h3>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>{a.content}</p>
                </div>
                {isAdmin && (
                  <div style={{ display: 'flex', gap: 6, marginLeft: 16 }}>
                    <button onClick={() => setModal(a)} className="btn-secondary btn-sm"><Edit2 size={12} /></button>
                    <button onClick={() => handleDelete(a.id)} className="btn-danger btn-sm"><Trash2 size={12} /></button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {modal !== null && <AnnouncementModal announcement={modal} onClose={() => setModal(null)} onSave={() => { setModal(null); fetch(); }} />}
    </div>
  );
}

function AnnouncementModal({ announcement, onClose, onSave }) {
  const [form, setForm] = useState(announcement?.id ? announcement : { title: '', content: '', priority: 'normal' });
  const [loading, setLoading] = useState(false);
  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setLoading(true);
    if (announcement?.id) {
      await supabase.from('announcements').update(form).eq('id', announcement.id);
    } else {
      await supabase.from('announcements').insert([form]);
    }
    setLoading(false);
    onSave();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}>
      <div style={{ background: 'var(--bg-secondary)', border: '1px solid rgba(0,255,102,0.2)', borderRadius: 16, padding: 32, width: '100%', maxWidth: 500 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>{announcement?.id ? 'Edit Announcement' : 'New Announcement'}</h3>
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>PRIORITY</label>
          <select className="input-field" style={{ marginTop: 6 }} value={form.priority} onChange={e => update('priority', e.target.value)}>
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High – Urgent</option>
          </select>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>TITLE</label>
          <input className="input-field" style={{ marginTop: 6 }} value={form.title} onChange={e => update('title', e.target.value)} placeholder="Announcement title..." />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>CONTENT</label>
          <textarea className="input-field" style={{ marginTop: 6, minHeight: 120, resize: 'vertical' }} value={form.content} onChange={e => update('content', e.target.value)} placeholder="Write announcement..." />
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSave} disabled={loading}>{loading ? 'Saving...' : 'Publish'}</button>
        </div>
      </div>
    </div>
  );
}
