import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const messages = await prisma.message.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      include: {
        sender: { include: { profile: { select: { firstName: true, lastName: true, avatarUrl: true } } } },
        receiver: { include: { profile: { select: { firstName: true, lastName: true, avatarUrl: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const conversationMap = new Map();

    for (const message of messages) {
      const partnerId =
        message.senderId === userId ? message.receiverId : message.senderId;
      const partner =
        message.senderId === userId ? message.receiver : message.sender;

      if (!conversationMap.has(partnerId)) {
        conversationMap.set(partnerId, {
          partner,
          lastMessage: message,
          unreadCount: 0,
        });
      }

      const existing = conversationMap.get(partnerId);
      if (!message.read && message.receiverId === userId) {
        existing.unreadCount += 1;
      }
    }

    const conversations = Array.from(conversationMap.values());

    return NextResponse.json({ conversations });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { senderId, receiverId, content, missionId } = body;

    if (!senderId || !receiverId || !content) {
      return NextResponse.json(
        { error: 'senderId, receiverId, and content are required' },
        { status: 400 }
      );
    }

    const message = await prisma.message.create({
      data: {
        senderId,
        receiverId,
        content,
        missionId: missionId || null,
      },
      include: {
        sender: { include: { profile: { select: { firstName: true, lastName: true, avatarUrl: true } } } },
        receiver: { include: { profile: { select: { firstName: true, lastName: true, avatarUrl: true } } } },
      },
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
