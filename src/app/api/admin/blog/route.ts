import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Store } from '@/lib/models';

function isAuthenticated(req: NextRequest) {
  return req.cookies.get('admin_session')?.value === 'authenticated';
}

function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const blogStore = await Store.findOne({ key: 'blog' });
    const posts = (blogStore?.data || []) as any[];

    const url = new URL(req.url);
    const adminMode = req.cookies.get('admin_session')?.value === 'authenticated';

    if (adminMode || url.searchParams.get('all') === '1') {
      return NextResponse.json(posts);
    }
    return NextResponse.json(posts.filter((p: { published: boolean }) => p.published));
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch blog posts' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!isAuthenticated(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const body = await req.json();
    
    const blogStore = await Store.findOne({ key: 'blog' });
    const posts = (blogStore?.data || []) as any[];
    
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
    
    await Store.findOneAndUpdate(
      { key: 'blog' },
      { data: posts },
      { upsert: true }
    );

    return NextResponse.json(newPost, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
