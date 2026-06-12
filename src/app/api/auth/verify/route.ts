import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSupabaseAdmin } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, token, role } = body;

    if (!phone || !token) {
      return NextResponse.json({ error: 'Phone and token are required' }, { status: 400 });
    }

    const { data, error } = await getSupabaseAdmin().auth.verifyOtp({
      phone,
      token,
      type: 'sms',
    });

    if (error || !data.user) {
      return NextResponse.json({ error: error?.message || 'Invalid OTP' }, { status: 400 });
    }

    const user = await prisma.user.upsert({
      where: { phone },
      update: {
        status: 'ACTIVE',
      },
      create: {
        phone,
        role: role === 'pro' ? 'PROFESSIONAL' : 'CLIENT',
        status: 'ACTIVE',
      },
    });

    return NextResponse.json({
      user,
      session: data.session,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to verify OTP' }, { status: 500 });
  }
}
