import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      role: 'PROFESSIONAL',
      status: 'ACTIVE',
      profile: { isNot: null },
    };

    if (category) {
      where.profile = {
        ...where.profile,
        services: { some: { category: { contains: category, mode: 'insensitive' } } },
      };
    }

    if (search) {
      where.OR = [
        { profile: { firstName: { contains: search, mode: 'insensitive' } } },
        { profile: { lastName: { contains: search, mode: 'insensitive' } } },
        { profile: { bio: { contains: search, mode: 'insensitive' } } },
        { profile: { profession: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (minPrice || maxPrice) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const priceFilter: any = {};
      if (minPrice) priceFilter.gte = parseInt(minPrice, 10);
      if (maxPrice) priceFilter.lte = parseInt(maxPrice, 10);
      where.profile = {
        ...where.profile,
        pricing: { some: { price: priceFilter } },
      };
    }

    const users = await prisma.user.findMany({
      where,
      include: {
        profile: {
          include: {
            services: true,
            pricing: true,
            portfolio: true,
          },
        },
        reviews: {
          select: {
            rating: true,
          },
        },
      },
    });

    const pros = users.map((user) => {
      const profile = user.profile;
      const reviews = user.reviews;
      const avgRating =
        reviews.length > 0
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
          : 0;

      return {
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
              zone: profile.zone,
              coverUrl: profile.coverUrl,
              missionCount: profile.missionCount,
              responseTime: profile.responseTime,
              acceptanceRate: profile.acceptanceRate,
              availability: profile.availability,
              services: profile.services,
              pricing: profile.pricing,
              portfolio: profile.portfolio,
              trustScore: profile.trustScore,
              isOnsiteVerified: profile.isOnsiteVerified,
            }
          : {}),
      };
    });

    if (sort === 'note') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      pros.sort((a: any, b: any) => b.rating - a.rating);
    } else if (sort === 'prix') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      pros.sort((a: any, b: any) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const aPrice = a.pricing?.length ? Math.min(...a.pricing.map((p: any) => p.price)) : Infinity;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const bPrice = b.pricing?.length ? Math.min(...b.pricing.map((p: any) => p.price)) : Infinity;
        return aPrice - bPrice;
      });
    } else if (sort === 'disponible') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      pros.sort((a: any, b: any) => (a.responseTime ?? Infinity) - (b.responseTime ?? Infinity));
    }

    return NextResponse.json({ pros });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch pros' }, { status: 500 });
  }
}
