import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { profileId, type, afterUrl, beforeUrl, description, missionId } = body;

    if (!profileId || !type || !afterUrl) {
      return NextResponse.json(
        { error: 'profileId, type, and afterUrl are required' },
        { status: 400 }
      );
    }

    const item = await prisma.portfolioItem.create({
      data: {
        profileId,
        type,
        afterUrl,
        beforeUrl: beforeUrl || null,
        description: description || null,
        missionId: missionId || null,
      },
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create portfolio item' }, { status: 500 });
  }
}
