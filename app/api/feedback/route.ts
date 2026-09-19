import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { analysisId, rating, correction } = await req.json();

    if (!analysisId || !rating) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const feedback = await prisma.feedback.upsert({
      where: { analysisId },
      update: { rating, correction },
      create: { analysisId, rating, correction },
    });

    return NextResponse.json({ success: true, feedback });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
