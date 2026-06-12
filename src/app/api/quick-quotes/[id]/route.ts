import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { proId } = body;

    if (!proId) {
      return NextResponse.json({ error: 'proId is required' }, { status: 400 });
    }

    const quote = await prisma.quickQuote.findUnique({ where: { id: params.id } });
    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }
    if (quote.status !== 'OPEN') {
      return NextResponse.json({ error: 'Quote is no longer open' }, { status: 400 });
    }

    await prisma.quickQuote.update({
      where: { id: params.id },
      data: { status: 'ACCEPTED' },
    });

    await prisma.message.create({
      data: {
        senderId: proId,
        receiverId: quote.clientId,
        content: `Bonjour, j'ai vu votre demande de devis "${quote.description.substring(0, 50)}..." et je suis intéressé. Discutons-en !`,
      },
    });

    return NextResponse.json({ success: true, clientId: quote.clientId });
  } catch {
    return NextResponse.json({ error: 'Failed to accept quote' }, { status: 500 });
  }
}
