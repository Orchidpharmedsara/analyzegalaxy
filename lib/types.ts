// Shared TypeScript types across the app

export interface CategoryScore {
  category: string;
  score: number;
  reason: string;
}

export interface AnalysisResult {
  overallScore: number;
  categoryScores: CategoryScore[];
  videoSummary: string;
  whatWorked: string;
  whyItCouldWorkOnSocial: string;
  narrativeCritique: string;
  improvementSuggestions: string[];
}

export interface VideoMetadata {
  duration: number;
  resolution: string;
  fps: number;
  aspectRatio: string;
  fileSize: number;
  likeCount?: number;
  commentCount?: number;
  viewCount?: number;
  authorUsername?: string;
}

export interface DownloadResult {
  filePath: string;
  caption?: string;
  hashtags?: string;
  metadata?: Partial<VideoMetadata>;
}

export type AnalysisStatus =
  | 'idle'
  | 'downloading'
  | 'processing'
  | 'transcribing'
  | 'analyzing'
  | 'saving'
  | 'done'
  | 'error';

export interface ProgressEvent {
  status: 'downloading' | 'processing' | 'transcribing' | 'analyzing' | 'generating' | 'saving' | 'done' | 'error';
  message: string;
  analysisId?: string;
  error?: string;
  rawText?: string;
}

export interface VideoRecord {
  id: string;
  sourceType: 'upload' | 'instagram';
  originalUrl?: string | null;
  filePath: string;
  thumbnailPath?: string | null;
  caption?: string | null;
  hashtags?: string | null;
  transcript?: string | null;
  duration?: number | null;
  resolution?: string | null;
  fps?: number | null;
  aspectRatio?: string | null;
  fileSize?: number | null;
  likeCount?: number | null;
  commentCount?: number | null;
  viewCount?: number | null;
  authorUsername?: string | null;
  createdAt: string;
}

export interface AnalysisRecord {
  id: string;
  videoId: string;
  status?: string;
  overallScore?: number | null;
  overallScoreExplanation?: string | null;
  categoryScores?: CategoryScore[] | null;
  videoSummary?: string | null;
  whatWorked?: string | null;
  whyItCouldWorkOnSocial?: string | null;
  narrativeCritique?: string | null;
  improvementSuggestions?: string[] | null;
  createdAt: string;
  video: VideoRecord;
}

export interface FeedbackRecord {
  id: string;
  analysisId: string;
  rating: number;
  correction?: string | null;
  createdAt: string;
}
