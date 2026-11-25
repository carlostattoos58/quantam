import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import { Plus, Edit2, Trash2, Image } from 'lucide-react';

function ArticleCard({ article, isAdmin, onEdit, onDelete }) {
  return (
    <div className="card animate-fade-in" style={{ cursor: 'pointer' }}>
      {article.image_url && (
        <div style={{ marginBottom: 14, borderRadius: 8, overflow: 'hidden', height: 160, background: 'var(--bg-hover)' }}>
          <img src={article.image_url} alt={article.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
            <span className={`badge ${article.category === 'gold' ? 'badge-yellow' : article.category === 'crypto' ? 'badge-blue' : 'badge-green'}`}>
              {article.category?.toUpperCase()}
            </span>
            <span className="badge badge-gray">{article.type?.toUpperCase()}</span>
          </div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>{article.title}</h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 10 }}>
            {article.content?.substring(0, 140)}...
          </p>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{format(new Date(article.created_at), 'dd MMM yyyy, HH:mm')}</div>
        </div>
        {isAdmin && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <button onClick={() => onEdit(article)} className="btn-secondary btn-sm"><Edit2 size={12} /></button>
            <button onClick={() => onDelete(article.id)} className="btn-danger btn-sm"><Trash2 size={12} /></button>
          </div>
        )}
      </div>
    </div>
  );
}

function ArticleModal({ article, onClose, onSave }) {
  const [form, setForm] = useState(article || { title: '', content: '', category: 'forex', type: 'daily_update', image_url: '' });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const path = `analysis/${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage.from('media').upload(path, file);
    if (!error) {
      const { data: urlData } = supabase.storage.from('media').getPublicUrl(path);
      update('image_url', urlData.publicUrl);
    }
    setUploading(false);
  };

  const handleSave = async () => {
    setLoading(true);
    if (article?.id) {
      await supabase.from('market_analysis').update(form).eq('id', article.id);
    } else {
      await supabase.from('market_analysis').insert([form]);
    }
    setLoading(false);
    onSave();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}>
      <div style={{ background: 'var(--bg-secondary)', border: '1px solid rgba(0,255,102,0.2)', borderRadius: 16, padding: 32, width: '100%', maxWidth: 600, maxHeight: '90vh', overflowY: 'auto' }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>{article?.id ? 'Edit Article' : 'New Analysis'}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.5px' }}>CATEGORY</label>
            <select className="input-field" style={{ marginTop: 6 }} value={form.category} onChange={e => update('category', e.target.value)}>
              {['forex','gold','crypto','technical'].map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.5px' }}>TYPE</label>
            <select className="input-field" style={{ marginTop: 6 }} value={form.type} onChange={e => update('type', e.target.value)}>
              {['daily_update','weekly_outlook','technical_analysis','commentary'].map(t => <option key={t} value={t}>{t.replace(/_/g,' ')}</option>)}
            </select>
          </div>
        </div>
        <div style={{ marginTop: 14 }}>
          <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.5px' }}>TITLE</label>
          <input className="input-field" style={{ marginTop: 6 }} value={form.title} onChange={e => update('title', e.target.value)} placeholder="Analysis title..." />
        </div>
        <div style={{ marginTop: 14 }}>
          <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.5px' }}>CONTENT</label>
          <textarea className="input-field" style={{ marginTop: 6, minHeight: 140, resize: 'vertical' }} value={form.content} onChange={e => update('content', e.target.value)} placeholder="Write your market analysis..." />
        </div>
        <div style={{ marginTop: 14 }}>
          <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Image size={12} /> CHART IMAGE (optional)
          </label>
          <input type="file" accept="image/*" onChange={handleImageUpload} style={{ marginTop: 8, color: 'var(--text-secondary)', fontSize: 13 }} />
          {uploading && <div style={{ color: 'var(--accent-green)', fontSize: 12, marginTop: 6 }}>Uploading...</div>}
          {form.image_url && <div style={{ marginTop: 8, borderRadius: 8, overflow: 'hidden', height: 100 }}><img src={form.image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>}
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSave} disabled={loading || uploading}>{loading ? 'Saving...' : 'Publish'}</button>
        </div>
      </div>
    </div>
  );
}

export default function MarketAnalysis() {
  const { isAdmin } = useAuth();
  const [articles, setArticles] = useState([]);
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  const fetchArticles = async () => {
    setLoading(true);
    let q = supabase.from('market_analysis').select('*').order('created_at', { ascending: false });
    if (category !== 'all') q = q.eq('category', category);
    const { data } = await q;
    setArticles(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchArticles(); }, [category]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this article?')) return;
    await supabase.from('market_analysis').delete().eq('id', id);
    fetchArticles();
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Market Analysis</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Daily forex, gold & crypto insights</p>
        </div>
        {isAdmin && <button className="btn-primary" onClick={() => setModal({})}><Plus size={16} /> New Analysis</button>}
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {['all','forex','gold','crypto','technical'].map(c => (
          <button key={c} onClick={() => setCategory(c)} style={{
            padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer',
            background: category === c ? 'var(--accent-green)' : 'var(--bg-secondary)',
            color: category === c ? '#000' : 'var(--text-muted)'
          }}>{c.charAt(0).toUpperCase() + c.slice(1)}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ width: 36, height: 36, border: '3px solid rgba(0,255,102,0.2)', borderTopColor: 'var(--accent-green)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {articles.map(a => <ArticleCard key={a.id} article={a} isAdmin={isAdmin} onEdit={x => setModal(x)} onDelete={handleDelete} />)}
          {articles.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
              No analysis articles yet. Check back soon.
            </div>
          )}
        </div>
      )}

      {modal !== null && <ArticleModal article={modal} onClose={() => setModal(null)} onSave={() => { setModal(null); fetchArticles(); }} />}
    </div>
  );
}
