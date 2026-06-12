import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { missionId, reviewerId, rating, comment } = body;

    if (!missionId || !reviewerId || !rating) {
      return NextResponse.json(
        { error: 'missionId, reviewerId, and rating are required' },
        { status: 400 }
      );
    }

    const mission = await prisma.mission.findUnique({
      where: { id: missionId },
    });

    if (!mission) {
      return NextResponse.json({ error: 'Mission not found' }, { status: 404 });
    }

    const review = await prisma.review.create({
      data: {
        missionId,
        reviewerId,
        rating,
        comment: comment || '',
      },
    });

    await prisma.mission.update({
      where: { id: missionId },
      data: { status: 'COMPLETED' },
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
  }
}
