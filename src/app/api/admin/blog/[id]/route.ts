import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Store } from '@/lib/models';

export const dynamic = 'force-dynamic';

function isAuthenticated(req: NextRequest) {
  return req.cookies.get('admin_session')?.value === 'authenticated';
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAuthenticated(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    await connectDB();
    
    const blogStore = await Store.findOne({ key: 'blog' });
    const posts = (blogStore?.data || []) as any[];
    
    const idx = posts.findIndex((p) => p.id === params.id);

    if (idx === -1) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    posts[idx] = { ...posts[idx], ...body, updatedAt: new Date().toISOString() };
    
    blogStore.markModified('data');
    await blogStore.save();

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
    await connectDB();
    
    const blogStore = await Store.findOne({ key: 'blog' });
    const posts = (blogStore?.data || []) as any[];
    const filtered = posts.filter((p) => p.id !== params.id);

    if (filtered.length === posts.length) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    blogStore.data = filtered;
    blogStore.markModified('data');
    await blogStore.save();

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}
