'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Save, Eye, EyeOff, Image, AlertCircle, CheckCircle2, Loader2,
} from 'lucide-react';

interface PostForm {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  author: string;
  published: boolean;
}

const EMPTY_FORM: PostForm = {
  title: '', slug: '', excerpt: '', content: '', imageUrl: '', author: 'GoalCast Team', published: false,
};

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function BlogPostEditorPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const isNew = id === 'new';

  const [form, setForm] = useState<PostForm>(EMPTY_FORM);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (isNew) return;
    fetch('/api/admin/blog?all=1')
      .then(r => r.json())
      .then((posts: (PostForm & { id: string })[]) => {
        const post = posts.find((p) => p.id === id);
        if (post) setForm({ title: post.title, slug: post.slug, excerpt: post.excerpt, content: post.content, imageUrl: post.imageUrl, author: post.author, published: post.published });
        setLoading(false);
      });
  }, [id, isNew]);

  function updateField<K extends keyof PostForm>(key: K, val: PostForm[K]) {
    setForm(f => {
      const next = { ...f, [key]: val };
      if (key === 'title' && isNew) next.slug = slugify(val as string);
      return next;
    });
  }

  async function save(publish?: boolean) {
    setSaving(true);
    const payload = { ...form, ...(publish !== undefined && { published: publish }) };

    try {
      let r: Response;
      if (isNew) {
        r = await fetch('/api/admin/blog', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        r = await fetch(`/api/admin/blog/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (r.ok) {
        showToast(isNew ? 'Post created!' : 'Saved!');
        if (isNew) {
          const data = await r.json();
          router.replace(`/admin/blog/${data.id}`);
        } else {
          setForm(f => ({ ...f, ...(publish !== undefined && { published: publish }) }));
        }
      } else {
        showToast('Save failed', 'error');
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
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
        <div className="flex items-center gap-3">
          <Link href="/admin/blog" className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white">{isNew ? 'New Post' : 'Edit Post'}</h1>
            <p className="text-zinc-500 text-sm">{form.published ? '✅ Published' : '⚪ Draft'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => save()} disabled={saving || !form.title}
            className="flex items-center gap-2 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-200 font-medium rounded-xl transition-colors text-sm">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Draft
          </button>
          <button onClick={() => save(!form.published)} disabled={saving || !form.title}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/20 text-sm">
            {form.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {form.published ? 'Unpublish' : 'Publish'}
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm text-zinc-400 mb-2">Title *</label>
            <input
              id="post-title"
              value={form.title}
              onChange={e => updateField('title', e.target.value)}
              placeholder="Enter post title…"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white text-lg font-semibold placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm text-zinc-400 mb-2">Slug</label>
            <div className="flex items-center bg-zinc-900 border border-zinc-700 rounded-xl overflow-hidden">
              <span className="px-3 text-zinc-500 text-sm select-none">/blog/</span>
              <input
                value={form.slug}
                onChange={e => updateField('slug', e.target.value)}
                placeholder="url-slug"
                className="flex-1 bg-transparent px-2 py-3 text-zinc-300 text-sm focus:outline-none"
              />
            </div>
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-sm text-zinc-400 mb-2">Excerpt</label>
            <textarea
              id="post-excerpt"
              value={form.excerpt}
              onChange={e => updateField('excerpt', e.target.value)}
              placeholder="Short description shown in blog listing…"
              rows={3}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-200 placeholder-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 resize-y"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm text-zinc-400 mb-2">Content (Markdown supported)</label>
            <textarea
              id="post-content"
              value={form.content}
              onChange={e => updateField('content', e.target.value)}
              placeholder="Write your post content here… Markdown formatting is supported."
              rows={18}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-200 placeholder-zinc-600 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/40 resize-y"
            />
            <p className="text-xs text-zinc-600 mt-1">Supports **bold**, *italic*, ## headings, - lists, [links](url)</p>
          </div>

          {/* Bottom Save Buttons */}
          <div className="flex items-center gap-2 pt-4 border-t border-zinc-800">
            <button onClick={() => save()} disabled={saving || !form.title}
              className="flex items-center gap-2 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-200 font-medium rounded-xl transition-colors text-sm">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Draft
            </button>
            <button onClick={() => save(!form.published)} disabled={saving || !form.title}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/20 text-sm">
              {form.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {form.published ? 'Unpublish' : 'Publish'}
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Cover image */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3">
            <h3 className="text-sm font-medium text-zinc-300 flex items-center gap-2">
              <Image className="w-4 h-4 text-zinc-500" />
              Cover Image
            </h3>
            {form.imageUrl && (
              <img src={form.imageUrl} alt="Cover preview"
                className="w-full h-36 object-cover rounded-xl"
                onError={e => { (e.currentTarget as HTMLImageElement).src = ''; }}
              />
            )}
            <input
              id="post-image-url"
              value={form.imageUrl}
              onChange={e => updateField('imageUrl', e.target.value)}
              placeholder="https://images.unsplash.com/…"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-zinc-200 placeholder-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
            <p className="text-xs text-zinc-600">Paste any image URL (Unsplash, etc.)</p>
          </div>

          {/* Author */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3">
            <h3 className="text-sm font-medium text-zinc-300">Author</h3>
            <input
              value={form.author}
              onChange={e => updateField('author', e.target.value)}
              placeholder="Author name"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-zinc-200 placeholder-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
          </div>

          {/* Status summary */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-2 text-sm">
            <h3 className="font-medium text-zinc-300 mb-3">Post Status</h3>
            <div className="flex justify-between text-zinc-400">
              <span>Status</span>
              <span className={form.published ? 'text-emerald-400' : 'text-zinc-500'}>
                {form.published ? 'Published' : 'Draft'}
              </span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Has content</span>
              <span className={form.content ? 'text-emerald-400' : 'text-zinc-500'}>
                {form.content ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Has cover image</span>
              <span className={form.imageUrl ? 'text-emerald-400' : 'text-zinc-500'}>
                {form.imageUrl ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
