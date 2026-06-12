import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        profile: {
          include: {
            services: true,
            pricing: true,
            portfolio: true,
          },
        },
        reviews: {
          include: {
            reviewer: {
              select: {
                id: true,
                profile: { select: { firstName: true, lastName: true, avatarUrl: true } },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Pro not found' }, { status: 404 });
    }

    const profile = user.profile;
    const reviews = user.reviews;
    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    const pro = {
      id: user.id,
      name: profile ? `${profile.firstName} ${profile.lastName}`.trim() : null,
      phone: user.phone,
      avatarUrl: profile?.avatarUrl ?? null,
      isVerified: profile?.isVerified ?? false,
      badge: profile?.badge ?? 'NONE',
      status: user.status,
      createdAt: user.createdAt,
      ...(profile
        ? {
            profession: profile.profession,
            bio: profile.bio,
            experience: profile.experience,
            rating: avgRating,
            reviewCount: reviews.length,
            trustScore: profile.trustScore,
            isOnsiteVerified: profile.isOnsiteVerified,
            zone: profile.zone,
            coverUrl: profile.coverUrl,
            missionCount: profile.missionCount,
            responseTime: profile.responseTime,
            acceptanceRate: profile.acceptanceRate,
            availability: profile.availability,
            services: profile.services,
            pricing: profile.pricing,
            portfolio: profile.portfolio,
            reviews: reviews.map((r) => ({
              id: r.id,
              rating: r.rating,
              comment: r.comment,
              date: r.createdAt,
              isVerified: r.isVerified,
              proofUrl: r.proofUrl,
              author: r.reviewer?.profile ? `${r.reviewer.profile.firstName} ${r.reviewer.profile.lastName}`.trim() : 'Anonyme',
              authorAvatar: r.reviewer?.profile?.avatarUrl,
            })),
          }
        : {}),
    };

    return NextResponse.json({ pro });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch pro' }, { status: 500 });
  }
}
