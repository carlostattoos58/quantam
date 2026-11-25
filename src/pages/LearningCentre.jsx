import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Edit2, Trash2, Download, Upload, FileText, Video, BookOpen } from 'lucide-react';

function ResourceCard({ resource, isAdmin, onEdit, onDelete }) {
  const icons = { pdf: FileText, video: Video, guide: BookOpen };
  const Icon = icons[resource.type] || FileText;
  return (
    <div className="card animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(0,255,102,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon size={16} color="var(--accent-green)" />
            </div>
            <div>
              <span className={`badge ${resource.level === 'beginner' ? 'badge-green' : resource.level === 'intermediate' ? 'badge-yellow' : 'badge-red'}`}>
                {resource.level?.toUpperCase()}
              </span>
            </div>
          </div>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>{resource.title}</h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>{resource.description}</p>
          {resource.file_url && (
            <a href={resource.file_url} target="_blank" rel="noreferrer" className="btn-primary btn-sm" style={{ textDecoration: 'none', display: 'inline-flex', fontSize: 12 }}>
              <Download size={12} /> Download
            </a>
          )}
        </div>
        {isAdmin && (
          <div style={{ display: 'flex', gap: 6, marginLeft: 10 }}>
            <button onClick={() => onEdit(resource)} className="btn-secondary btn-sm"><Edit2 size={12} /></button>
            <button onClick={() => onDelete(resource.id)} className="btn-danger btn-sm"><Trash2 size={12} /></button>
          </div>
        )}
      </div>
    </div>
  );
}

function ResourceModal({ resource, onClose, onSave }) {
  const [form, setForm] = useState(resource || { title: '', description: '', type: 'guide', level: 'beginner', file_url: '' });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const path = `learning/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from('media').upload(path, file);
    if (!error) {
      const { data } = supabase.storage.from('media').getPublicUrl(path);
      update('file_url', data.publicUrl);
    }
    setUploading(false);
  };

  const handleSave = async () => {
    setLoading(true);
    if (resource?.id) {
      await supabase.from('learning_resources').update(form).eq('id', resource.id);
    } else {
      await supabase.from('learning_resources').insert([form]);
    }
    setLoading(false);
    onSave();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}>
      <div style={{ background: 'var(--bg-secondary)', border: '1px solid rgba(0,255,102,0.2)', borderRadius: 16, padding: 32, width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto' }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>{resource?.id ? 'Edit Resource' : 'Add Resource'}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>TYPE</label>
            <select className="input-field" style={{ marginTop: 6 }} value={form.type} onChange={e => update('type', e.target.value)}>
              <option value="guide">Guide</option>
              <option value="pdf">PDF</option>
              <option value="video">Video</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>LEVEL</label>
            <select className="input-field" style={{ marginTop: 6 }} value={form.level} onChange={e => update('level', e.target.value)}>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>
        <div style={{ marginTop: 14 }}>
          <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>TITLE</label>
          <input className="input-field" style={{ marginTop: 6 }} value={form.title} onChange={e => update('title', e.target.value)} placeholder="Resource title..." />
        </div>
        <div style={{ marginTop: 14 }}>
          <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>DESCRIPTION</label>
          <textarea className="input-field" style={{ marginTop: 6, minHeight: 80, resize: 'vertical' }} value={form.description} onChange={e => update('description', e.target.value)} placeholder="Brief description..." />
        </div>
        <div style={{ marginTop: 14 }}>
          <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}><Upload size={12} /> UPLOAD FILE / VIDEO URL</label>
          {form.type === 'video' ? (
            <input className="input-field" style={{ marginTop: 6 }} value={form.file_url} onChange={e => update('file_url', e.target.value)} placeholder="https://youtube.com/..." />
          ) : (
            <>
              <input type="file" onChange={handleUpload} style={{ marginTop: 8, color: 'var(--text-secondary)', fontSize: 13 }} />
              {uploading && <div style={{ color: 'var(--accent-green)', fontSize: 12, marginTop: 4 }}>Uploading...</div>}
            </>
          )}
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSave} disabled={loading || uploading}>{loading ? 'Saving...' : 'Save'}</button>
        </div>
      </div>
    </div>
  );
}

export default function LearningCentre() {
  const { isAdmin } = useAuth();
  const [resources, setResources] = useState([]);
  const [level, setLevel] = useState('all');
  const [type, setType] = useState('all');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  const fetchResources = async () => {
    setLoading(true);
    let q = supabase.from('learning_resources').select('*').order('created_at', { ascending: false });
    if (level !== 'all') q = q.eq('level', level);
    if (type !== 'all') q = q.eq('type', type);
    const { data } = await q;
    setResources(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchResources(); }, [level, type]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this resource?')) return;
    await supabase.from('learning_resources').delete().eq('id', id);
    fetchResources();
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Learning Centre</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Trading education — guides, PDFs & video tutorials</p>
        </div>
        {isAdmin && <button className="btn-primary" onClick={() => setModal({})}><Plus size={16} /> Add Resource</button>}
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {['all','beginner','intermediate','advanced'].map(l => (
          <button key={l} onClick={() => setLevel(l)} style={{ padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer', background: level === l ? 'var(--accent-green)' : 'var(--bg-secondary)', color: level === l ? '#000' : 'var(--text-muted)' }}>
            {l.charAt(0).toUpperCase()+l.slice(1)}
          </button>
        ))}
        {['all','guide','pdf','video'].map(t => (
          <button key={t} onClick={() => setType(t)} style={{ padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer', background: type === t ? '#4FC3F7' : 'var(--bg-secondary)', color: type === t ? '#000' : 'var(--text-muted)' }}>
            {t.charAt(0).toUpperCase()+t.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}><div style={{ width: 36, height: 36, border: '3px solid rgba(0,255,102,0.2)', borderTopColor: 'var(--accent-green)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} /></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {resources.map(r => <ResourceCard key={r.id} resource={r} isAdmin={isAdmin} onEdit={x => setModal(x)} onDelete={handleDelete} />)}
          {resources.length === 0 && <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>No resources yet.</div>}
        </div>
      )}

      {modal !== null && <ResourceModal resource={modal} onClose={() => setModal(null)} onSave={() => { setModal(null); fetchResources(); }} />}
    </div>
  );
}
