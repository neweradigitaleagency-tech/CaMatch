import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const otherUserId = searchParams.get('otherUserId');

    if (!userId || !otherUserId) {
      return NextResponse.json(
        { error: 'userId and otherUserId are required' },
        { status: 400 }
      );
    }

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
        ],
      },
      include: {
        sender: { include: { profile: { select: { firstName: true, lastName: true, avatarUrl: true } } } },
        receiver: { include: { profile: { select: { firstName: true, lastName: true, avatarUrl: true } } } },
      },
      orderBy: { createdAt: 'asc' },
    });

    await prisma.message.updateMany({
      where: {
        senderId: otherUserId,
        receiverId: userId,
        read: false,
      },
      data: { read: true },
    });

    return NextResponse.json({ messages });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}
