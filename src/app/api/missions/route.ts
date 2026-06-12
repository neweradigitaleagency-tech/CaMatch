import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const role = searchParams.get('role');

    if (!userId || !role) {
      return NextResponse.json(
        { error: 'userId and role are required' },
        { status: 400 }
      );
    }

    const where: Prisma.MissionWhereInput = {};
    if (role === 'client') where.clientId = userId;
    else if (role === 'pro') where.proId = userId;
    else return NextResponse.json({ error: 'role must be "client" or "pro"' }, { status: 400 });

    const missions = await prisma.mission.findMany({
      where,
      include: {
        client: {
          select: { id: true, phone: true, profile: { select: { firstName: true, lastName: true, avatarUrl: true } } },
        },
        pro: {
          select: { id: true, phone: true, profile: { select: { firstName: true, lastName: true, avatarUrl: true, profession: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ missions });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch missions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clientId, proId, service, description, address, scheduledAt, agreedPrice } = body;

    if (!clientId || !proId || !service || !description || !address) {
      return NextResponse.json(
        { error: 'clientId, proId, service, description, and address are required' },
        { status: 400 }
      );
    }

    const mission = await prisma.mission.create({
      data: {
        clientId,
        proId,
        service,
        description,
        address,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        agreedPrice: agreedPrice ? parseFloat(agreedPrice) : null,
        status: 'PENDING',
      },
      include: {
        client: {
          select: { id: true, phone: true, profile: { select: { firstName: true, lastName: true, avatarUrl: true } } },
        },
        pro: {
          select: { id: true, phone: true, profile: { select: { firstName: true, lastName: true, avatarUrl: true } } },
        },
      },
    });

    return NextResponse.json({ mission }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create mission' }, { status: 500 });
  }
}