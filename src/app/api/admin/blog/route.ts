import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';

const BLOG_PATH = path.join(process.cwd(), 'src/data/blog.json');

function isAuthenticated(req: NextRequest) {
  return req.cookies.get('admin_session')?.value === 'authenticated';
}

function getPosts() {
  return JSON.parse(readFileSync(BLOG_PATH, 'utf-8'));
}

function savePosts(posts: unknown[]) {
  writeFileSync(BLOG_PATH, JSON.stringify(posts, null, 2), 'utf-8');
}

function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function GET(req: NextRequest) {
  // Public endpoint for blog listing (no auth needed)
  const posts = getPosts();
  const url = new URL(req.url);
  const adminMode = req.cookies.get('admin_session')?.value === 'authenticated';

  if (adminMode || url.searchParams.get('all') === '1') {
    return NextResponse.json(posts);
  }
  return NextResponse.json(posts.filter((p: { published: boolean }) => p.published));
}

export async function POST(req: NextRequest) {
  if (!isAuthenticated(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const posts = getPosts();
    const now = new Date().toISOString();

    const newPost = {
      id: Date.now().toString(),
      title: body.title || 'Untitled',
      slug: body.slug || slugify(body.title || 'untitled'),
      excerpt: body.excerpt || '',
      content: body.content || '',
      imageUrl: body.imageUrl || '',
      author: body.author || 'GoalCast Team',
      publishedAt: now,
      updatedAt: now,
      published: body.published ?? false,
    };

    posts.push(newPost);
    savePosts(posts);

    return NextResponse.json(newPost, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
