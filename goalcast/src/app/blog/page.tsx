import type { Metadata } from 'next';
import Link from 'next/link';
import { readFileSync } from 'fs';
import path from 'path';
import { Calendar, User, ArrowRight, BookOpen } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Blog — GoalCast',
  description: 'Latest news, tips, and updates from the GoalCast team. Stay up to date with sports streaming.',
};

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

function getPosts(): BlogPost[] {
  const data = readFileSync(path.join(process.cwd(), 'src/data/blog.json'), 'utf-8');
  return JSON.parse(data).filter((p: BlogPost) => p.published);
}

export default function BlogPage() {
  const posts = getPosts();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero */}
      <section className="text-center mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800/50 mb-4">
          <BookOpen className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">GoalCast Blog</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-zinc-900 dark:text-white mb-3 tracking-tight">
          News &{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400">
            Updates
          </span>
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-lg max-w-xl mx-auto">
          Tips, sports streaming news, and GoalCast updates — straight from the team.
        </p>
      </section>

      {/* Posts */}
      {posts.length === 0 ? (
        <div className="text-center py-24">
          <BookOpen className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-500 dark:text-zinc-400 text-lg">No posts yet. Check back soon!</p>
        </div>
      ) : (
        <>
          {/* Featured (first post) */}
          {posts[0] && (
            <Link href={`/blog/${posts[0].slug}`} className="group block mb-10">
              <div className="relative overflow-hidden rounded-3xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/5">
                {posts[0].imageUrl && (
                  <div className="relative h-64 sm:h-80 overflow-hidden">
                    <img
                      src={posts[0].imageUrl}
                      alt={posts[0].title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                    <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-emerald-500 text-white text-xs font-bold">
                      Featured
                    </span>
                  </div>
                )}
                <div className="p-6 sm:p-8">
                  <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white mb-3 group-hover:text-emerald-500 transition-colors">
                    {posts[0].title}
                  </h2>
                  <p className="text-zinc-600 dark:text-zinc-400 mb-5 leading-relaxed">{posts[0].excerpt}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-500">
                      <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" />{posts[0].author}</span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(posts[0].publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <span className="flex items-center gap-1 text-emerald-500 text-sm font-semibold group-hover:gap-2 transition-all">
                      Read more <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          )}

          {/* Rest of posts */}
          {posts.length > 1 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {posts.slice(1).map(post => (
                <Link key={post.id} href={`/blog/${post.slug}`} className="group block">
                  <div className="h-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300">
                    {post.imageUrl ? (
                      <div className="h-48 overflow-hidden">
                        <img src={post.imageUrl} alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                    ) : (
                      <div className="h-48 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 flex items-center justify-center">
                        <BookOpen className="w-12 h-12 text-emerald-500/30" />
                      </div>
                    )}
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2 group-hover:text-emerald-500 transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-4 line-clamp-2">{post.excerpt}</p>
                      <div className="flex items-center justify-between text-xs text-zinc-400">
                        <span className="flex items-center gap-1"><User className="w-3 h-3" />{post.author}</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
