/**
 * GET /api/analyses
 * Returns paginated list of all analyses with video info.
 * Query params: ?sort=score|date&order=asc|desc&limit=50&page=1
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sort = searchParams.get('sort') || 'date';
  const order = (searchParams.get('order') || 'desc') as 'asc' | 'desc';
  const limit = Math.min(100, parseInt(searchParams.get('limit') || '50'));
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const skip = (page - 1) * limit;

  try {
    const [analyses, total] = await Promise.all([
      prisma.analysis.findMany({
        include: { video: true },
        orderBy:
          sort === 'score'
            ? { overallScore: order }
            : { createdAt: order },
        take: limit,
        skip,
      }),
      prisma.analysis.count(),
    ]);

    const formatted = analyses.map((a) => ({
      id: a.id,
      videoId: a.videoId,
      overallScore: a.overallScore,
      createdAt: a.createdAt.toISOString(),
      video: {
        id: a.video.id,
        sourceType: a.video.sourceType,
        originalUrl: a.video.originalUrl,
        thumbnailPath: a.video.thumbnailPath,
        duration: a.video.duration,
        resolution: a.video.resolution,
        caption: a.video.caption,
        createdAt: a.video.createdAt.toISOString(),
      },
    }));

    return NextResponse.json({ analyses: formatted, total, page, limit });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
