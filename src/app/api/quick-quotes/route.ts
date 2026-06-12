import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clientId, category, description, budget, mediaUrl, mediaType } = body;

    if (!clientId || !category || !description) {
      return NextResponse.json({ error: 'clientId, category, and description are required' }, { status: 400 });
    }

    const quote = await prisma.quickQuote.create({
      data: {
        clientId,
        category,
        description,
        budget: budget ? parseInt(budget, 10) : null,
        mediaUrl: mediaUrl || null,
        mediaType: mediaType || null,
      },
    });

    return NextResponse.json({ quote }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create quote' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status') || 'OPEN';
    const proId = searchParams.get('proId');

    const where: Record<string, unknown> = {};
    if (status) {
      const statuses = status.split(',').map((s) => s.trim()).filter(Boolean);
      if (statuses.length === 1) where.status = statuses[0];
      else if (statuses.length > 1) where.status = { in: statuses };
    }
    if (category) where.category = { contains: category, mode: 'insensitive' };

    const quotes = await prisma.quickQuote.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            profile: { select: { firstName: true, lastName: true, avatarUrl: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (proId && quotes.length > 0) {
      await prisma.quickQuote.updateMany({
        where: { id: { in: quotes.map((q) => q.id) } },
        data: { viewCount: { increment: 1 } },
      });
      const updated = await prisma.quickQuote.findMany({
        where: { id: { in: quotes.map((q) => q.id) } },
        select: { id: true, viewCount: true },
      });
      const viewMap = Object.fromEntries(updated.map((q) => [q.id, q.viewCount]));
      for (const q of quotes) q.viewCount = viewMap[q.id] ?? q.viewCount;
    }

    return NextResponse.json({ quotes });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch quotes' }, { status: 500 });
  }
}
