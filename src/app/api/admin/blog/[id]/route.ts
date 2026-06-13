import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';

const BLOG_PATH = path.join(process.cwd(), 'src/data/blog.json');

function isAuthenticated(req: NextRequest) {
  return req.cookies.get('admin_session')?.value === 'authenticated';
}

function getPosts(): Record<string, unknown>[] {
  return JSON.parse(readFileSync(BLOG_PATH, 'utf-8'));
}

function savePosts(posts: unknown[]) {
  writeFileSync(BLOG_PATH, JSON.stringify(posts, null, 2), 'utf-8');
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAuthenticated(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const posts = getPosts();
    const idx = posts.findIndex((p) => p.id === params.id);

    if (idx === -1) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    posts[idx] = { ...posts[idx], ...body, updatedAt: new Date().toISOString() };
    savePosts(posts);

    return NextResponse.json(posts[idx]);
  } catch {
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAuthenticated(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const posts = getPosts();
    const filtered = posts.filter((p) => p.id !== params.id);

    if (filtered.length === posts.length) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    savePosts(filtered);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}
