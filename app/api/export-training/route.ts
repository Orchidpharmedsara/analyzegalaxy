import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const feedbacks = await prisma.feedback.findMany({
      include: {
        analysis: {
          include: {
            video: true
          }
        }
      }
    });

    // Format as JSONL for LLM fine-tuning
    const lines = feedbacks.map(f => {
      return JSON.stringify({
        messages: [
          {
            role: "system",
            content: "You are a sharp, honest social media strategist with deep expertise in short-form video performance."
          },
          {
            role: "user",
            content: `Analyze this video:
Video Metadata: ${f.analysis.video.duration}s, ${f.analysis.video.viewCount} views, ${f.analysis.video.likeCount} likes.
Transcript: ${f.analysis.video.transcript || 'None'}`
          },
          {
            role: "model",
            content: JSON.stringify({
              overall_score: f.analysis.overallScore,
              category_scores: JSON.parse(f.analysis.categoryScores ?? '[]'),
              video_summary: f.analysis.videoSummary,
              what_worked: f.analysis.whatWorked,
              why_it_could_work_on_social: f.analysis.whyItCouldWorkOnSocial,
              narrative_critique: f.analysis.narrativeCritique,
              improvement_suggestions: JSON.parse(f.analysis.improvementSuggestions ?? '[]')
            })
          },
          {
            role: "human_correction",
            rating: f.rating,
            correction: f.correction || ""
          }
        ]
      });
    });

    const jsonl = lines.join('\n');

    return new NextResponse(jsonl, {
      headers: {
        'Content-Type': 'application/jsonl',
        'Content-Disposition': 'attachment; filename="training_data.jsonl"'
      }
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
