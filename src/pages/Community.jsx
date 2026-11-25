import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import { Users, User, Edit2, Trash2, MessageSquare, Send, ThumbsUp } from 'lucide-react';

export default function Community() {
  const { profile } = useAuth();
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  const fetchPosts = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('community_posts')
      .select('*, profiles(full_name, role)')
      .order('created_at', { ascending: false })
      .limit(50);
    setPosts(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, []);

  const handlePost = async () => {
    if (!newPost.trim()) return;
    setPosting(true);
    await supabase.from('community_posts').insert([{
      content: newPost.trim(),
      user_id: profile?.id
    }]);
    setNewPost('');
    setPosting(false);
    fetchPosts();
  };

  const handleDelete = async (id) => {
    await supabase.from('community_posts').delete().eq('id', id);
    fetchPosts();
  };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Community</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Connect with fellow Quantam EA members</p>
      </div>

      {/* New post */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,255,102,0.1)', border: '1px solid rgba(0,255,102,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <User size={16} color="var(--accent-green)" />
          </div>
          <div style={{ flex: 1 }}>
            <textarea
              className="input-field"
              value={newPost}
              onChange={e => setNewPost(e.target.value)}
              placeholder="Share something with the community..."
              style={{ minHeight: 80, resize: 'vertical', marginBottom: 10 }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn-primary btn-sm" onClick={handlePost} disabled={posting || !newPost.trim()}>
                <Send size={13} /> {posting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}><div style={{ width: 36, height: 36, border: '3px solid rgba(0,255,102,0.2)', borderTopColor: 'var(--accent-green)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} /></div>
      ) : posts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          <Users size={48} style={{ marginBottom: 16, opacity: 0.3 }} />
          <div>No posts yet. Be the first to share!</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {posts.map(post => (
            <div key={post.id} className="card animate-fade-in">
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(0,255,102,0.1)', border: '1px solid rgba(0,255,102,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <User size={16} color="var(--accent-green)" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                        {post.profiles?.full_name || 'Member'}
                      </span>
                      {post.profiles?.role === 'admin' && (
                        <span className="badge badge-yellow">ADMIN</span>
                      )}
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {format(new Date(post.created_at), 'dd MMM, HH:mm')}
                      </span>
                    </div>
                    {(profile?.id === post.user_id || profile?.role === 'admin') && (
                      <button onClick={() => handleDelete(post.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>{post.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
