/**
 * GET /api/analyses/[id]
 * Returns a single full analysis with video metadata.
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const analysis = await prisma.analysis.findUnique({
      where: { id },
      include: { video: true },
    });

    if (!analysis) {
      return NextResponse.json({ error: 'Analysis not found.' }, { status: 404 });
    }

    return NextResponse.json({
      id: analysis.id,
      videoId: analysis.videoId,
      overallScore: analysis.overallScore,
      categoryScores: JSON.parse(analysis.categoryScores),
      whatWorked: analysis.whatWorked,
      whyItCouldWorkOnSocial: analysis.whyItCouldWorkOnSocial,
      narrativeCritique: analysis.narrativeCritique,
      improvementSuggestions: JSON.parse(analysis.improvementSuggestions),
      createdAt: analysis.createdAt.toISOString(),
      video: {
        id: analysis.video.id,
        sourceType: analysis.video.sourceType,
        originalUrl: analysis.video.originalUrl,
        filePath: analysis.video.filePath,
        thumbnailPath: analysis.video.thumbnailPath,
        caption: analysis.video.caption,
        hashtags: analysis.video.hashtags,
        duration: analysis.video.duration,
        resolution: analysis.video.resolution,
        fps: analysis.video.fps,
        aspectRatio: analysis.video.aspectRatio,
        fileSize: analysis.video.fileSize,
        createdAt: analysis.video.createdAt.toISOString(),
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    await prisma.analysis.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
