import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSupabaseAdmin } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, userId, role, profile: profileData } = body;

    if (userId && role && profileData) {
      const user = await prisma.user.upsert({
        where: { id: userId },
        update: { role: role as 'CLIENT' | 'PROFESSIONAL' },
        create: {
          id: userId,
          phone: phone || '',
          role: role as 'CLIENT' | 'PROFESSIONAL',
          status: 'ACTIVE',
          profile: {
            create: {
              firstName: profileData.firstName || '',
              lastName: profileData.lastName || '',
              zone: profileData.zone || [],
              bio: profileData.bio || null,
              onboardingCompleted: true,
              isAvailable: role === 'PROFESSIONAL',
            },
          },
        },
        include: { profile: true },
      });

      if (user.profile && profileData.onboardingCompleted) {
        await prisma.profile.update({
          where: { id: user.profile.id },
          data: {
            firstName: profileData.firstName || user.profile.firstName,
            lastName: profileData.lastName || user.profile.lastName,
            zone: profileData.zone || user.profile.zone,
            bio: profileData.bio !== undefined ? profileData.bio : user.profile.bio,
            onboardingCompleted: profileData.onboardingCompleted,
          },
        });
      }

      return NextResponse.json({ success: true, user });
    }

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    const { error } = await getSupabaseAdmin().auth.signInWithOtp({ phone });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Register error:', err);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}