import type { Metadata } from 'next';
import { readFileSync } from 'fs';
import path from 'path';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Calendar, User, ArrowLeft, BookOpen } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  author: string;
  publishedAt: string;
  updatedAt: string;
  published: boolean;
}

function getPosts(): BlogPost[] {
  return JSON.parse(readFileSync(path.join(process.cwd(), 'src/data/blog.json'), 'utf-8'));
}

function getPost(slug: string): BlogPost | undefined {
  return getPosts().find(p => p.slug === slug && p.published);
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = getPost(params.slug);
  if (!post) return { title: 'Post Not Found | GoalCast' };
  return {
    title: `${post.title} | GoalCast Blog`,
    description: post.excerpt,
    openGraph: { title: post.title, description: post.excerpt, images: post.imageUrl ? [post.imageUrl] : [] },
  };
}

export async function generateStaticParams() {
  return getPosts().filter(p => p.published).map(p => ({ slug: p.slug }));
}

/** Very simple Markdown → HTML renderer (no dependencies) */
function renderMarkdown(md: string): string {
  return md
    .replace(/^### (.+)$/gm, '<h3 class="text-xl font-bold mt-8 mb-3 text-zinc-900 dark:text-white">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold mt-10 mb-4 text-zinc-900 dark:text-white">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-3xl font-extrabold mt-10 mb-5 text-zinc-900 dark:text-white">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-emerald-500 hover:text-emerald-400 underline">$1</a>')
    .replace(/^---$/gm, '<hr class="border-zinc-200 dark:border-zinc-700 my-8" />')
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc text-zinc-700 dark:text-zinc-300">$1</li>')
    .replace(/(<li.*<\/li>\n?)+/g, '<ul class="space-y-1 my-4">$&</ul>')
    .replace(/\n\n/g, '</p><p class="text-zinc-700 dark:text-zinc-300 leading-relaxed my-4">')
    .replace(/^(?!<)(.+)$/gm, '<p class="text-zinc-700 dark:text-zinc-300 leading-relaxed my-4">$1</p>');
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getPost(params.slug);
  if (!post) notFound();

  const html = renderMarkdown(post.content);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Back */}
      <Link href="/blog"
        className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-emerald-500 transition-colors mb-8 group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Back to Blog
      </Link>

      {/* Cover */}
      {post.imageUrl && (
        <div className="relative h-56 sm:h-80 rounded-2xl overflow-hidden mb-8">
          <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>
      )}

      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-4 h-4 text-emerald-500" />
          <span className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">GoalCast Blog</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white leading-tight mb-4">
          {post.title}
        </h1>
        {post.excerpt && (
          <p className="text-lg text-zinc-500 dark:text-zinc-400 leading-relaxed mb-6 border-l-4 border-emerald-500 pl-4">
            {post.excerpt}
          </p>
        )}
        <div className="flex items-center gap-5 text-sm text-zinc-400 pb-6 border-b border-zinc-200 dark:border-zinc-800">
          <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" />{post.author}</span>
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
      </header>

      {/* Content */}
      <article
        className="prose prose-zinc dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {/* Footer CTA */}
      <div className="mt-16 p-6 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40 rounded-2xl text-center">
        <p className="text-zinc-700 dark:text-zinc-300 mb-4 font-medium">Ready to watch live sports?</p>
        <Link href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5">
          Browse Channels →
        </Link>
      </div>
    </div>
  );
}
