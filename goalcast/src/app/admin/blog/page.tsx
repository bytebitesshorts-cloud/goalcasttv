'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus, FileText, Trash2, Edit2, Eye, EyeOff,
  AlertCircle, CheckCircle2, Calendar, User, ToggleLeft, ToggleRight
} from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  imageUrl: string;
  author: string;
  publishedAt: string;
  published: boolean;
}

export default function AdminBlogPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBlogsOnHome, setShowBlogsOnHome] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [r1, r2] = await Promise.all([
        fetch('/api/admin/blog?all=1'),
        fetch('/api/admin/settings')
      ]);
      if (r1.ok) setPosts(await r1.json());
      if (r2.ok) {
        const settings = await r2.json();
        setShowBlogsOnHome(settings.showBlogsOnHome || false);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function togglePublish(post: BlogPost) {
    const r = await fetch(`/api/admin/blog/${post.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: !post.published }),
    });
    if (r.ok) {
      showToast(post.published ? 'Post unpublished' : 'Post published!');
      load();
    }
  }

  async function toggleShowBlogs() {
    setSavingSettings(true);
    const newValue = !showBlogsOnHome;
    const r = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ showBlogsOnHome: newValue }),
    });
    setSavingSettings(false);
    if (r.ok) {
      setShowBlogsOnHome(newValue);
      showToast(`Blogs on Home Page ${newValue ? 'Enabled' : 'Disabled'}`);
    } else {
      showToast('Failed to update setting', 'error');
    }
  }

  async function deletePost(id: string) {
    if (!confirm('Delete this post permanently?')) return;
    const r = await fetch(`/api/admin/blog/${id}`, { method: 'DELETE' });
    if (r.ok) {
      showToast('Post deleted');
      load();
    } else {
      showToast('Delete failed', 'error');
    }
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium shadow-2xl
          ${toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-400" />
            Blog Posts
          </h1>
          <p className="text-zinc-400 text-sm mt-0.5">{posts.length} posts total</p>
        </div>
        <Link
          href="/admin/blog/new"
          id="new-post-btn"
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl transition-all duration-150 shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" />
          New Post
        </Link>
      </div>

      {/* Blog Display Setting */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex items-center justify-between">
        <div>
          <h2 className="text-white font-semibold">Show Blogs on Home Page</h2>
          <p className="text-zinc-400 text-sm mt-0.5">Toggle whether recent blog posts appear at the bottom of the main site.</p>
        </div>
        <button
          onClick={toggleShowBlogs}
          disabled={savingSettings}
          className="transition-colors disabled:opacity-50"
          aria-label="Toggle blogs on home page"
        >
          {showBlogsOnHome ? (
            <ToggleRight className="w-10 h-10 text-emerald-400" />
          ) : (
            <ToggleLeft className="w-10 h-10 text-zinc-500" />
          )}
        </button>
      </div>

      {/* Posts list */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 bg-zinc-900 border border-zinc-800 rounded-2xl">
          <FileText className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-400 mb-4">No blog posts yet</p>
          <Link href="/admin/blog/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white font-medium rounded-xl text-sm transition-colors">
            <Plus className="w-4 h-4" /> Create your first post
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map(post => (
            <div key={post.id}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 hover:border-zinc-700 transition-colors">
              {/* Thumbnail */}
              {post.imageUrl ? (
                <img src={post.imageUrl} alt={post.title}
                  className="w-full sm:w-24 h-40 sm:h-16 object-cover rounded-xl shrink-0" />
              ) : (
                <div className="w-full sm:w-24 h-40 sm:h-16 bg-zinc-800 rounded-xl shrink-0 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-zinc-600" />
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-white font-semibold truncate">{post.title}</h3>
                  <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-medium
                    ${post.published
                      ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                      : 'bg-zinc-700 text-zinc-400'}`}>
                    {post.published ? 'Published' : 'Draft'}
                  </span>
                </div>
                <p className="text-zinc-400 text-sm mt-1 line-clamp-1">{post.excerpt}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-zinc-500">
                  <span className="flex items-center gap-1"><User className="w-3 h-3" />{post.author}</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex sm:flex-col items-center gap-2 shrink-0">
                <button onClick={() => router.push(`/admin/blog/${post.id}`)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors">
                  <Edit2 className="w-3 h-3" /> Edit
                </button>
                <button onClick={() => togglePublish(post)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors">
                  {post.published ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  {post.published ? 'Unpublish' : 'Publish'}
                </button>
                <button onClick={() => deletePost(post.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
